<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCotizacionRefaccionRequest;
use App\Models\CotizacionRefaccion;
use App\Models\CotizacionRefaccionImagen;
use App\Models\UserAdmin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
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
            'puedeEliminar' => $this->administradorTotal(),
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

    /**
     * Delete a spare-part quote. Only the full administrator can do this.
     */
    public function destroy(CotizacionRefaccion $cotizacionRefaccion): RedirectResponse
    {
        abort_unless($this->administradorTotal(), 403);

        $cotizacionRefaccion->load('imagenes');

        foreach ($cotizacionRefaccion->imagenes as $imagen) {
            $this->eliminarArchivo($imagen);
        }

        $cotizacionRefaccion->delete();

        return redirect()
            ->route('admin.cotizaciones-refacciones.index')
            ->with('success', 'Solicitud eliminada correctamente.');
    }

    private function administradorTotal(): bool
    {
        $admin = auth('admin')->user();

        if (! $admin instanceof UserAdmin) {
            return false;
        }

        $admin->loadMissing(['cargo', 'rolUsuario']);

        return $admin->isSuperUsuario() || ($admin->cargo?->isSuperUsuario() ?? false);
    }

    private function eliminarArchivo(CotizacionRefaccionImagen $imagen): void
    {
        $archivo = basename($imagen->ruta);

        if ($archivo === '') {
            return;
        }

        Storage::disk('cotizaciones')->delete($archivo);
    }
}
