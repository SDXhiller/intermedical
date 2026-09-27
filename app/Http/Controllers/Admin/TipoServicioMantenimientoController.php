<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTipoServicioMantenimientoRequest;
use App\Http\Requests\Admin\UpdateTipoServicioMantenimientoRequest;
use App\Models\TipoServicioMantenimiento;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TipoServicioMantenimientoController extends Controller
{
    /**
     * Show the tipo de servicio form and listing.
     */
    public function index(): Response
    {
        return Inertia::render('settings/equipos-ajustes', [
            'tiposServicio' => TipoServicioMantenimiento::query()
                ->withCount('servicios')
                ->latest()
                ->get(['id', 'nombre', 'slug', 'descripcion', 'activo', 'created_at']),
        ]);
    }

    /**
     * Store a newly created tipo de servicio.
     */
    public function store(StoreTipoServicioMantenimientoRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        TipoServicioMantenimiento::query()->create([
            'nombre' => $validated['nombre'],
            'slug' => TipoServicioMantenimiento::uniqueSlug($validated['nombre']),
            'descripcion' => $validated['descripcion'],
            'activo' => $validated['activo'],
        ]);

        $this->flashToast('success', "{$validated['nombre']} se registró correctamente.");

        return redirect()
            ->route('admin.configuracion');
    }

    /**
     * Update an existing tipo de servicio.
     */
    public function update(
        UpdateTipoServicioMantenimientoRequest $request,
        TipoServicioMantenimiento $tipoServicioMantenimiento,
    ): RedirectResponse {
        $validated = $request->validated();

        $tipoServicioMantenimiento->update([
            'nombre' => $validated['nombre'],
            'slug' => TipoServicioMantenimiento::uniqueSlug(
                $validated['nombre'],
                $tipoServicioMantenimiento->id,
            ),
            'descripcion' => $validated['descripcion'],
            'activo' => $validated['activo'],
        ]);

        $this->flashToast('success', "{$tipoServicioMantenimiento->nombre} se actualizó correctamente.");

        return redirect()
            ->route('admin.configuracion');
    }

    /**
     * Toggle the tipo de servicio active state.
     */
    public function toggleStatus(TipoServicioMantenimiento $tipoServicioMantenimiento): RedirectResponse
    {
        $tipoServicioMantenimiento->update([
            'activo' => ! $tipoServicioMantenimiento->activo,
        ]);

        $estado = $tipoServicioMantenimiento->activo ? 'Activo' : 'Inactivo';

        $this->flashToast(
            'success',
            "{$tipoServicioMantenimiento->nombre} se marcó como {$estado}.",
        );

        return redirect()
            ->route('admin.configuracion');
    }

    /**
     * Delete a tipo de servicio that has no related servicios.
     */
    public function destroy(TipoServicioMantenimiento $tipoServicioMantenimiento): RedirectResponse
    {
        $nombre = $tipoServicioMantenimiento->nombre;

        if ($tipoServicioMantenimiento->servicios()->exists()) {
            $this->flashToast(
                'error',
                "{$nombre} no se puede eliminar porque tiene servicios asociados.",
            );

            return redirect()
                ->route('admin.configuracion');
        }

        $tipoServicioMantenimiento->delete();

        $this->flashToast('success', "{$nombre} se eliminó correctamente.");

        return redirect()
            ->route('admin.configuracion');
    }

    /**
     * @param  'success'|'error'  $type
     */
    private function flashToast(string $type, string $message): void
    {
        Inertia::flash('toast', [
            'type' => $type,
            'message' => $message,
        ]);
    }
}
