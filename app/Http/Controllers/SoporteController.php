<?php

namespace App\Http\Controllers;

use App\Models\EquipoModulo;
use App\Models\Modulo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SoporteController extends Controller
{
    /**
     * Public technical support request page.
     */
    public function show(Request $request): Response
    {
        $servicios = $this->servicios();
        $servicioSlug = $request->string('servicio')->toString();
        $servicio = collect($servicios)->firstWhere('slug', $servicioSlug)
            ?? collect($servicios)->firstWhere('slug', 'mantenimiento-correctivo')
            ?? $servicios[0];

        $modalidadSlug = $request->string('modalidad')->toString();
        $moduloQuery = Modulo::query()
            ->activos()
            ->with('estatus:id,nombre');

        $modulo = $modalidadSlug !== ''
            ? $moduloQuery->clone()->where('slug', $modalidadSlug)->first()
            : $moduloQuery->clone()->orderBy('modulo')->first();

        if ($modulo === null) {
            throw new NotFoundHttpException;
        }

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

        $equipoSlug = $request->string('equipo')->toString();
        $equipoSeleccionado = $equipoSlug !== ''
            ? $equipos->firstWhere('slug', $equipoSlug)
            : null;

        return Inertia::render('Mantenimiento/ViewSoporte', [
            'servicio' => $servicio,
            'servicios' => $servicios,
            'modalidad' => [
                'slug' => $modulo->slug,
                'nombre' => $modulo->modulo,
                'imagen' => $modulo->imageUrl() ?? '',
            ],
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
        return [
            ['slug' => 'mantenimiento-preventivo', 'title' => 'Mantenimiento preventivo'],
            ['slug' => 'mantenimiento-correctivo', 'title' => 'Mantenimiento correctivo'],
            ['slug' => 'diagnostico', 'title' => 'Diagnóstico'],
            ['slug' => 'renta-de-equipos-medicos', 'title' => 'Renta de equipos médicos'],
            ['slug' => 'instalacion', 'title' => 'Instalación'],
            ['slug' => 'desinstalacion', 'title' => 'Desinstalación'],
            ['slug' => 'puesta-en-marcha', 'title' => 'Puesta en marcha'],
        ];
    }
}
