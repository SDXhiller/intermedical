<?php

namespace App\Http\Controllers;

use App\Models\TipoServicioMantenimiento;
use Inertia\Inertia;
use Inertia\Response;

class MantenimientoController extends Controller
{
    /**
     * Show the public maintenance services page.
     */
    public function index(): Response
    {
        return Inertia::render('Mantenimiento/Mantenimiento', [
            'servicios' => TipoServicioMantenimiento::catalogItems(),
        ]);
    }
}
