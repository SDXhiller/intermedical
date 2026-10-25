<?php

namespace App\Http\Controllers;

use App\Models\Modulo;
use App\Models\Refaccion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RefaccionController extends Controller
{
    /**
     * Public spare-parts catalog. Modalities only; models and parts live on the pieces page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        if ($request->filled('modalidad')) {
            $modelo = $request->string('modelo')->toString();

            return redirect()->route('refacciones.piezas', array_filter([
                'modalidad' => $request->string('modalidad')->toString(),
                'modelo' => $modelo !== '' ? $modelo : null,
            ]));
        }

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

        return Inertia::render('Refacciones/ViewPiesasReffaciones', [
            'modalidades' => $modalidades,
        ]);
    }

    /**
     * Public detail of one published spare part.
     */
    public function show(string $modalidad, Refaccion $refaccion): Response
    {
        $modulo = $this->moduloPublicado($modalidad);
        abort_unless($this->perteneceAlModulo($refaccion, $modulo), 404);

        return Inertia::render('Refacciones/vistarefraccionview', [
            'refaccion' => $refaccion->toDetailPayload(),
        ]);
    }

    /**
     * Placeholder while the spare-part quote form is built.
     */
    public function cotizacion(string $modalidad, Refaccion $refaccion): Response
    {
        $modulo = $this->moduloPublicado($modalidad);
        abort_unless($this->perteneceAlModulo($refaccion, $modulo), 404);

        return Inertia::render('Refacciones/cotizacionesViewPiesasReffaciones', [
            'refaccion' => [
                'id' => $refaccion->id,
                'nombre' => $refaccion->nombre,
                'modalidad' => [
                    'slug' => $modulo->slug,
                    'nombre' => $modulo->modulo,
                ],
            ],
        ]);
    }

    /**
     * Spare parts for one modality, without the equipment catalog.
     */
    public function piezas(string $modalidad): Response
    {
        $modulo = $this->moduloPublicado($modalidad);

        $refacciones = Refaccion::query()
            ->where('publicado', true)
            ->where('modulo_id', $modulo->id)
            ->with(['imagenes', 'fabricante'])
            ->orderBy('nombre')
            ->get()
            ->map(fn (Refaccion $refaccion): array => $refaccion->toCatalogCard())
            ->values()
            ->all();

        return Inertia::render('Refacciones/PiesaRefraccion', [
            'modalidad' => [
                'slug' => $modulo->slug,
                'nombre' => $modulo->modulo,
                'imagen' => $modulo->imageUrl() ?? '',
            ],
            'refacciones' => $refacciones,
        ]);
    }

    private function moduloPublicado(string $modalidad): Modulo
    {
        $modulo = Modulo::query()
            ->activos()
            ->where('slug', $modalidad)
            ->first(['id', 'modulo', 'slug', 'imagen']);

        abort_if($modulo === null, 404);

        return $modulo;
    }

    private function perteneceAlModulo(Refaccion $refaccion, Modulo $modulo): bool
    {
        return $refaccion->publicado && $refaccion->modulo_id === $modulo->id;
    }
}
