<?php

namespace App\Http\Controllers;

use App\Models\EquipoModulo;
use App\Models\Modulo;
use Inertia\Inertia;
use Inertia\Response;

class BibliotecaEquipoController extends Controller
{
    /**
     * Show the public library of main equipment categories.
     */
    public function index(): Response
    {
        $equipos = Modulo::query()
            ->activos()
            ->with('estatus:id,nombre')
            ->orderBy('modulo')
            ->get()
            ->map(fn (Modulo $modulo): array => $modulo->toListingProduct())
            ->values();

        return Inertia::render('Biblioteca/ListaBibliotecaequipos', [
            'equipos' => $equipos,
        ]);
    }

    /**
     * Show every active equipment model in one list, without grouping.
     */
    public function disponibles(): Response
    {
        $equipos = EquipoModulo::query()
            ->where('activo', true)
            ->whereHas('modulo', fn ($query) => $query->activos())
            ->with([
                'fabricante:id,nombre',
                'modulo:id,modulo,slug',
                'tipoEquipo:id,tipo',
                'disponibilidad:id,nombre,color',
            ])
            ->orderBy('modelo')
            ->get()
            ->map(fn (EquipoModulo $equipo): array => [
                ...$equipo->toListingProduct($equipo->modulo?->slug ?? ''),
                'category_name' => $equipo->modulo?->modulo ?? '',
            ])
            ->values();

        return Inertia::render('Biblioteca/listaequiposjuntos', [
            'equipos' => $equipos,
        ]);
    }
}
