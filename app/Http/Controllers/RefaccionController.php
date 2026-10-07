<?php

namespace App\Http\Controllers;

use App\Models\EquipoModulo;
use App\Models\Mibrafaccion;
use App\Models\Modulo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RefaccionController extends Controller
{
    /**
     * Public spare-parts catalog: modality, then model, then parts.
     */
    public function index(Request $request): Response
    {
        $modalidadSlug = $request->string('modalidad')->toString();
        $modeloSlug = $request->string('modelo')->toString();

        $modalidades = Modulo::query()
            ->activos()
            ->orderBy('modulo')
            ->get(['id', 'modulo', 'slug', 'imagen'])
            ->map(fn (Modulo $modulo): array => [
                'slug' => $modulo->slug,
                'nombre' => $modulo->modulo,
                'imagen' => $modulo->imageUrl() ?? '',
            ])
            ->values()
            ->all();

        $modalidad = $modalidadSlug === ''
            ? null
            : collect($modalidades)->firstWhere('slug', $modalidadSlug);

        $modelos = [];
        $modelo = null;
        $refacciones = [];

        if ($modalidad !== null) {
            $modelos = EquipoModulo::query()
                ->where('activo', true)
                ->whereHas(
                    'modulo',
                    fn ($query) => $query->activos()->where('slug', $modalidadSlug),
                )
                ->with('fabricante:id,nombre')
                ->orderBy('modelo')
                ->get(['id', 'modulo_id', 'fabricante_id', 'modelo', 'slug', 'imagen'])
                ->map(fn (EquipoModulo $equipo): array => [
                    'slug' => $equipo->publicSlug(),
                    'nombre' => $equipo->modelo,
                    'marca' => $equipo->fabricante?->nombre ?? '',
                    'imagen' => $equipo->imageUrl() ?? '',
                ])
                ->values()
                ->all();

            $modelo = $modeloSlug === ''
                ? null
                : collect($modelos)->firstWhere('slug', $modeloSlug);

            if ($modelo !== null) {
                $refacciones = Mibrafaccion::query()
                    ->where('activo', true)
                    ->whereHas(
                        'equipoModulo',
                        fn ($query) => $query
                            ->where('activo', true)
                            ->where('slug', $modeloSlug),
                    )
                    ->with([
                        'equipoModulo:id,modulo_id,fabricante_id,modelo,slug,imagen',
                        'equipoModulo.modulo:id,modulo,slug',
                        'equipoModulo.fabricante:id,nombre',
                        'modulo:id,modulo,slug',
                        'fabricante:id,nombre',
                    ])
                    ->orderBy('refaccion_requerida')
                    ->get()
                    ->map(fn (Mibrafaccion $refaccion): array => $refaccion->toPublicCard())
                    ->values()
                    ->all();
            }
        }

        return Inertia::render('Refacciones/ViewPiesasReffaciones', [
            'modalidades' => $modalidades,
            'modalidad' => $modalidad,
            'modelos' => $modelos,
            'modelo' => $modelo,
            'refacciones' => $refacciones,
        ]);
    }
}
