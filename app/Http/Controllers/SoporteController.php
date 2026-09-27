<?php

namespace App\Http\Controllers;

use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\TipoServicioMantenimiento;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SoporteController extends Controller
{
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
        ]);
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
