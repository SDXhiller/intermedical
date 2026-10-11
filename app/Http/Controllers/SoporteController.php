<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSolicitudSoporteRequest;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\SolicitudSoporte;
use App\Models\TipoServicioMantenimiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SoporteController extends Controller
{
    private const EQUIPO_NOMBRE_MAX_LENGTH = 120;

    /**
     * Public technical support request page.
     */
    public function show(Request $request): Response
    {
        $servicios = $this->servicios();
        $servicioSlug = $request->string('servicio')->toString();
        $servicio = $servicioSlug !== ''
            ? collect($servicios)->firstWhere('slug', $servicioSlug)
            : null;

        $modulos = Modulo::query()
            ->activos()
            ->orderBy('modulo')
            ->get(['id', 'modulo', 'slug', 'imagen']);

        $modalidadSlug = $request->string('modalidad')->toString();
        $modulo = $modalidadSlug !== ''
            ? $modulos->firstWhere('slug', $modalidadSlug)
            : null;

        $equipos = collect();

        if ($modulo !== null) {
            $equipos = $modulo->equipos()
                ->where('activo', true)
                ->with('fabricante:id,nombre')
                ->orderBy('modelo')
                ->get()
                ->map(fn (EquipoModulo $equipo): array => [
                    'slug' => $equipo->publicSlug(),
                    'nombre' => $equipo->modelo,
                    'marca' => $equipo->fabricante?->nombre ?? 'Sin fabricante',
                    'imagen' => $equipo->imageUrl() ?? '',
                ])
                ->values();
        }

        $equipoSlug = $request->string('equipo')->toString();
        $equipoSeleccionado = $equipoSlug !== ''
            ? $equipos->firstWhere('slug', $equipoSlug)
            : null;
        $equipoNombre = $this->equipoNombreEscrito(
            $request->string('equipo_nombre')->toString(),
            $equipoSeleccionado !== null,
        );

        return Inertia::render('Mantenimiento/ViewSoporte', [
            'servicio' => $servicio,
            'servicios' => $servicios,
            'modalidad' => $modulo === null ? null : [
                'slug' => $modulo->slug,
                'nombre' => $modulo->modulo,
                'imagen' => $modulo->imageUrl() ?? '',
            ],
            'modalidades' => $modulos
                ->map(fn (Modulo $item): array => [
                    'slug' => $item->slug,
                    'nombre' => $item->modulo,
                    'imagen' => $item->imageUrl() ?? '',
                ])
                ->values()
                ->all(),
            'equipos' => $equipos,
            'equipo' => $equipoSeleccionado,
            'equipoNombre' => $equipoNombre,
        ]);
    }

    /**
     * Store a public technical support request.
     */
    public function store(StoreSolicitudSoporteRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $servicio = TipoServicioMantenimiento::query()
            ->where('activo', true)
            ->where('slug', $validated['servicio'])
            ->firstOrFail();
        $modulo = Modulo::query()->activos()->where('slug', $validated['modalidad'])->firstOrFail();
        $equipo = $request->equipoSeleccionado();

        $imagenes = [];
        $directorio = $this->directorioImagenes($modulo, $servicio);

        foreach ($validated['imagenes'] ?? [] as $imagen) {
            $guardada = $imagen->store($directorio, 'soporte');

            if (is_string($guardada) && $guardada !== '') {
                $imagenes[] = SolicitudSoporte::DIRECTORIO_PUBLICO.'/'.$guardada;
            }
        }

        SolicitudSoporte::query()->create([
            'tipo_servicio_mantenimiento_id' => $servicio->id,
            'modulo_id' => $modulo->id,
            'equipo_modulo_id' => $equipo?->id,
            'equipo_nombre' => $equipo === null ? $validated['equipo_nombre'] : null,
            'marca' => $equipo === null ? $validated['marca'] : null,
            'nombre' => $validated['nombre'],
            'empresa' => $validated['empresa'] ?? null,
            'codigo_pais' => $validated['codigo_pais'],
            'telefono' => $validated['telefono'],
            'correo' => $validated['correo'],
            'estado' => $validated['estado'] ?? null,
            'latitud' => $validated['latitud'] ?? null,
            'longitud' => $validated['longitud'] ?? null,
            'descripcion' => $validated['descripcion'],
            'imagenes' => $imagenes,
        ]);

        return redirect()
            ->route('mantenimiento.soporte')
            ->with('soporte_enviado', true);
    }

    /**
     * Store uploaded photos as public/Imagen/Soporte/{año}/{mes}/{módulo}/{servicio}/{archivo}.
     */
    private function directorioImagenes(Modulo $modulo, TipoServicioMantenimiento $servicio): string
    {
        return sprintf(
            '%s/%s/%s/%s',
            now()->format('Y'),
            now()->format('m'),
            $this->segmentoCarpeta($modulo->slug, 'modulo'),
            $this->segmentoCarpeta($servicio->slug, 'general'),
        );
    }

    /**
     * Filesystem-safe folder name for a module or service.
     */
    private function segmentoCarpeta(string $valor, string $respaldo): string
    {
        $segmento = Str::slug($valor);

        return $segmento !== '' ? $segmento : $respaldo;
    }

    /**
     * Name typed by the visitor when the equipment is not in the catalog.
     */
    private function equipoNombreEscrito(string $nombre, bool $catalogoSeleccionado): ?string
    {
        if ($catalogoSeleccionado) {
            return null;
        }

        $nombre = Str::squish($nombre);

        if ($nombre === '' || mb_strlen($nombre) > self::EQUIPO_NOMBRE_MAX_LENGTH) {
            return null;
        }

        return $nombre;
    }

    /**
     * Public maintenance services available on the support form.
     *
     * @return list<array{slug: string, title: string}>
     */
    private function servicios(): array
    {
        return collect(TipoServicioMantenimiento::catalogItems())
            ->map(fn (array $item): array => [
                'slug' => $item['slug'],
                'title' => $item['title'],
            ])
            ->values()
            ->all();
    }
}
