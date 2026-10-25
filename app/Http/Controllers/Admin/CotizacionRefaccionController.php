<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCotizacionRefaccionRequest;
use App\Models\CotizacionRefaccion;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CotizacionRefaccionController extends Controller
{
    /**
     * List spare-part quotes submitted from the public catalog.
     */
    public function index(): Response
    {
        $cotizaciones = CotizacionRefaccion::query()
            ->with(['modulo:id,modulo', 'fabricante:id,nombre', 'imagenes'])
            ->latest()
            ->get()
            ->map(fn (CotizacionRefaccion $cotizacion): array => $cotizacion->toAdminPayload())
            ->values()
            ->all();

        return Inertia::render('Refacciones/cotizacion-listrado-view', [
            'cotizaciones' => $cotizaciones,
        ]);
    }

    /**
     * Update the administrative follow-up of a spare-part quote.
     */
    public function update(UpdateCotizacionRefaccionRequest $request, CotizacionRefaccion $cotizacionRefaccion): RedirectResponse
    {
        $validated = $request->validated();

        $cotizacionRefaccion->update([
            'estatus' => $validated['estado'],
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        return redirect()
            ->route('admin.cotizaciones-refacciones.index')
            ->with('success', 'Seguimiento guardado correctamente.');
    }
}
