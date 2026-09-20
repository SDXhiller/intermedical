<?php

namespace App\Http\Controllers;

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
}
