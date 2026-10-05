<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SolicitudSoporte;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SolicitudSoporteController extends Controller
{
    /**
     * @return array<int, string>
     */
    private function mesesCatalogo(): array
    {
        return [
            1 => 'Enero',
            2 => 'Febrero',
            3 => 'Marzo',
            4 => 'Abril',
            5 => 'Mayo',
            6 => 'Junio',
            7 => 'Julio',
            8 => 'Agosto',
            9 => 'Septiembre',
            10 => 'Octubre',
            11 => 'Noviembre',
            12 => 'Diciembre',
        ];
    }

    /**
     * List support requests stored from the public form.
     */
    public function index(Request $request): Response
    {
        $meses = $this->mesesCatalogo();
        $mes = max(1, min(12, (int) $request->input('mes', now()->month)));
        $anio = max(2020, min((int) now()->format('Y') + 1, (int) $request->input('anio', now()->year)));
        $buscar = trim($request->string('buscar')->toString());

        $solicitudesQuery = SolicitudSoporte::query()
            ->with([
                'servicio:id,nombre,slug',
                'modalidad:id,modulo,slug',
                'equipo:id,modelo,slug,fabricante_id',
                'equipo.fabricante:id,nombre',
            ])
            ->whereYear('created_at', $anio)
            ->whereMonth('created_at', $mes)
            ->when($buscar !== '', fn (Builder $query) => $this->applySearch($query, $buscar))
            ->latest();

        $totalMes = SolicitudSoporte::query()
            ->whereYear('created_at', $anio)
            ->whereMonth('created_at', $mes)
            ->count();

        $aniosDisponibles = SolicitudSoporte::query()
            ->whereNotNull('created_at')
            ->latest('created_at')
            ->pluck('created_at')
            ->map(fn ($fecha): int => $fecha->year)
            ->unique()
            ->sortDesc()
            ->values();

        if ($aniosDisponibles->isEmpty()) {
            $aniosDisponibles = collect([(int) now()->format('Y')]);
        }

        if (! $aniosDisponibles->contains($anio)) {
            $aniosDisponibles = $aniosDisponibles->push($anio)->sortDesc()->values();
        }

        $solicitudes = $solicitudesQuery
            ->get()
            ->map(fn (SolicitudSoporte $solicitud): array => $this->mapSolicitud($solicitud));

        return Inertia::render('Servcios/Servcios_view_mail', [
            'solicitudes' => $solicitudes,
            'filtros' => [
                'mes' => $mes,
                'anio' => $anio,
                'buscar' => $buscar,
            ],
            'resumen' => [
                'total_mes' => $totalMes,
                'total_filtrado' => $solicitudes->count(),
                'mes' => $mes,
                'mes_nombre' => $meses[$mes],
                'anio' => $anio,
            ],
            'meses' => collect($meses)
                ->map(fn (string $nombre, int $numero): array => [
                    'value' => $numero,
                    'label' => $nombre,
                ])
                ->values(),
            'anios_disponibles' => $aniosDisponibles->values(),
        ]);
    }

    /**
     * Mark a support request as attended and clear its new-request marker.
     */
    public function atender(Request $request, SolicitudSoporte $solicitudSoporte): RedirectResponse
    {
        if ($solicitudSoporte->atendida_at === null) {
            $solicitudSoporte->update([
                'atendida_at' => now(),
            ]);
        }

        $solicitudSoporte->loadMissing('servicio');

        return redirect()
            ->route('admin.soporte.index', $request->only(['mes', 'anio', 'buscar']))
            ->with('solicitud_atendida', [
                'servicio' => $solicitudSoporte->servicio->nombre,
                'nombre' => $solicitudSoporte->nombre,
            ]);
    }

    /**
     * Remove a support request and the photos sent with it.
     */
    public function destroy(Request $request, SolicitudSoporte $solicitudSoporte): RedirectResponse
    {
        $solicitudSoporte->delete();

        return redirect()
            ->route('admin.soporte.index', $request->only(['mes', 'anio', 'buscar']))
            ->with('success', 'Solicitud de soporte eliminada correctamente.');
    }

    /**
     * @param  Builder<SolicitudSoporte>  $query
     */
    private function applySearch(Builder $query, string $buscar): void
    {
        $query->where(function (Builder $query) use ($buscar): void {
            $query->whereHas(
                'servicio',
                fn (Builder $servicio): Builder => $servicio->where('nombre', 'like', "%{$buscar}%"),
            )->orWhereHas(
                'modalidad',
                fn (Builder $modalidad): Builder => $modalidad->where('modulo', 'like', "%{$buscar}%"),
            )->orWhereHas(
                'equipo',
                fn (Builder $equipo): Builder => $equipo->where('modelo', 'like', "%{$buscar}%"),
            )->orWhere('nombre', 'like', "%{$buscar}%")
                ->orWhere('correo', 'like', "%{$buscar}%")
                ->orWhere('equipo_nombre', 'like', "%{$buscar}%")
                ->orWhere('marca', 'like', "%{$buscar}%");
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function mapSolicitud(SolicitudSoporte $solicitud): array
    {
        return [
            'id' => $solicitud->id,
            'servicio' => [
                'id' => $solicitud->servicio->id,
                'nombre' => $solicitud->servicio->nombre,
            ],
            'modalidad' => [
                'id' => $solicitud->modalidad->id,
                'nombre' => $solicitud->modalidad->modulo,
            ],
            'equipo' => $this->equipoPayload($solicitud),
            'cliente' => [
                'nombre' => $solicitud->nombre,
                'empresa' => $solicitud->empresa,
                'telefono' => trim($solicitud->codigo_pais.' '.$solicitud->telefono),
                'correo' => $solicitud->correo,
                'estado' => $solicitud->estado,
            ],
            'descripcion' => $solicitud->descripcion,
            'imagenes' => collect($solicitud->imagenes ?? [])
                ->map(fn (string $path): string => Storage::disk('public')->url($path))
                ->values()
                ->all(),
            'created_at' => $solicitud->created_at?->toIso8601String(),
            'created_at_formatted' => $solicitud->created_at?->format('d/m/Y H:i'),
            'atendida' => $solicitud->atendida_at !== null,
            'es_nueva' => $solicitud->isNueva(),
        ];
    }

    /**
     * @return array{id: int|null, nombre: string, marca: string}|null
     */
    private function equipoPayload(SolicitudSoporte $solicitud): ?array
    {
        if ($solicitud->equipo !== null) {
            return [
                'id' => $solicitud->equipo->id,
                'nombre' => $solicitud->equipo->modelo,
                'marca' => $solicitud->equipo->fabricante?->nombre ?? 'Sin fabricante',
            ];
        }

        if ($solicitud->equipo_nombre === null || $solicitud->equipo_nombre === '') {
            return null;
        }

        return [
            'id' => null,
            'nombre' => $solicitud->equipo_nombre,
            'marca' => $solicitud->marca ?: 'Sin marca',
        ];
    }
}
