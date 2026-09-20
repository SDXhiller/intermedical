<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClienteCotisacionRequest;
use App\Models\ClienteCotisacion;
use App\Models\EquipoModulo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClienteCotisacionController extends Controller
{
    /**
     * Show the public quote request form.
     */
    public function create(Request $request): Response
    {
        $equipoSlug = $request->string('equipo')->toString();
        $equipoModulo = $equipoSlug !== ''
            ? EquipoModulo::query()
                ->where('activo', true)
                ->where('slug', $equipoSlug)
                ->with('modulo:id,modulo,slug')
                ->first(['id', 'slug', 'modelo', 'imagen', 'modulo_id'])
            : null;

        return Inertia::render('Cliente', [
            'equipo' => $equipoModulo === null
                ? null
                : [
                    'id' => $equipoModulo->id,
                    'slug' => $equipoModulo->slug,
                    'nombre' => $equipoModulo->modelo,
                    'categoria' => $equipoModulo->modulo?->modulo,
                    'categoria_slug' => $equipoModulo->modulo?->slug,
                    'imagen' => $equipoModulo->imageUrl(),
                ],
        ]);
    }

    /**
     * Store a public quote request.
     */
    public function store(StoreClienteCotisacionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        ClienteCotisacion::query()->create($validated);

        $equipoModulo = isset($validated['equipo_modulo_id'])
            ? EquipoModulo::query()->find($validated['equipo_modulo_id'])
            : null;

        $redirect = redirect()
            ->route('cliente-cotisacion.create', $equipoModulo !== null ? ['equipo' => $equipoModulo->slug] : [])
            ->with('cotizacion_enviada', true)
            ->with('cotizacion_cliente', $validated['cliente']);

        return $redirect;
    }
}
