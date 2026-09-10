<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClienteCotisacion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClienteCotisacionController extends Controller
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
     * List quote requests submitted from the public form.
     */
    public function index(Request $request): Response
    {
        $meses = $this->mesesCatalogo();
        $mes = max(1, min(12, (int) $request->input('mes', now()->month)));
        $anio = max(2020, min((int) now()->format('Y') + 1, (int) $request->input('anio', now()->year)));
        $buscar = trim($request->string('buscar')->toString());

        $cotizacionesQuery = ClienteCotisacion::query()
            ->with(['equipoModulo:id,modelo,slug'])
            ->whereYear('created_at', $anio)
            ->whereMonth('created_at', $mes)
            ->when($buscar !== '', fn (Builder $query) => $query->where('cliente', 'like', "%{$buscar}%"))
            ->latest();

        $totalMes = ClienteCotisacion::query()
            ->whereYear('created_at', $anio)
            ->whereMonth('created_at', $mes)
            ->count();

        $aniosDisponibles = ClienteCotisacion::query()
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

        $cotizaciones = $cotizacionesQuery
            ->get()
            ->map(fn (ClienteCotisacion $cotizacion): array => $this->mapCotizacion($cotizacion));

        return Inertia::render('Cotizaciones/Cotizacionview', [
            'cotizaciones' => $cotizaciones,
            'filtros' => [
                'mes' => $mes,
                'anio' => $anio,
                'buscar' => $buscar,
            ],
            'resumen' => [
                'total_mes' => $totalMes,
                'total_filtrado' => $cotizaciones->count(),
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
     * Remove a quote request from the listing.
     */
    public function destroy(Request $request, ClienteCotisacion $clienteCotisacion): RedirectResponse
    {
        $clienteCotisacion->delete();

        return redirect()
            ->route('admin.cotizaciones.index', $request->only(['mes', 'anio', 'buscar']))
            ->with('success', 'Solicitud de cotización eliminada correctamente.');
    }

    /**
     * @return array<string, mixed>
     */
    private function mapCotizacion(ClienteCotisacion $cotizacion): array
    {
        return [
            'id' => $cotizacion->id,
            'cliente' => $cotizacion->cliente,
            'contacto' => $cotizacion->contacto,
            'area' => $cotizacion->area,
            'telefono' => $cotizacion->telefono,
            'correo' => $cotizacion->correo,
            'calle' => $cotizacion->calle,
            'numero' => $cotizacion->numero,
            'colonia' => $cotizacion->colonia,
            'cp' => $cotizacion->cp,
            'ciudad' => $cotizacion->ciudad,
            'direccion' => "{$cotizacion->calle} {$cotizacion->numero}, {$cotizacion->colonia}, CP {$cotizacion->cp}, {$cotizacion->ciudad}",
            'latitud' => $cotizacion->latitud,
            'longitud' => $cotizacion->longitud,
            'equipo' => $cotizacion->equipoModulo ? [
                'id' => $cotizacion->equipoModulo->id,
                'nombre' => $cotizacion->equipoModulo->modelo,
                'slug' => $cotizacion->equipoModulo->slug,
            ] : null,
            'created_at' => $cotizacion->created_at?->toIso8601String(),
            'created_at_formatted' => $cotizacion->created_at?->format('d/m/Y H:i'),
            'es_nueva' => $cotizacion->isNueva(),
        ];
    }
}
