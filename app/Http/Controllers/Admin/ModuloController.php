<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreModuloRequest;
use App\Models\Modulo;
use App\Models\Status;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ModuloController extends Controller
{
    /**
     * Show the module registration form inside the admin panel.
     */
    public function create(): Response
    {
        return Inertia::render('Modulos/Registrar-modulo', [
            'statuses' => Status::query()
                ->orderBy('id')
                ->get(['id', 'nombre']),
            'modulos' => Modulo::query()
                ->with('estatus:id,nombre')
                ->latest()
                ->get(['id', 'modulo', 'slug', 'imagen', 'descripcion', 'estatus_id', 'created_at']),
        ]);
    }

    /**
     * Store a newly created module.
     */
    public function store(StoreModuloRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $imagenPath = null;

        if ($request->hasFile('imagen')) {
            $filename = $request->file('imagen')->storeAsWebp('', 'maquinas');
            $imagenPath = 'Imagen/Maquinas/'.$filename;
        }

        Modulo::query()->create([
            'modulo' => $validated['modulo'],
            'slug' => $validated['slug'],
            'imagen' => $imagenPath,
            'descripcion' => $validated['descripcion'] ?? null,
            'estatus_id' => $validated['estatus_id'],
        ]);

        return redirect()
            ->route('admin.equipos.create')
            ->with('success', 'Módulo registrado correctamente.');
    }

    /**
     * Toggle the module between Activo and Inactivo.
     */
    public function toggleStatus(Modulo $modulo): RedirectResponse
    {
        $activoId = Status::query()->where('nombre', 'Activo')->value('id');
        $inactivoId = Status::query()->where('nombre', 'Inactivo')->value('id');

        abort_unless($activoId && $inactivoId, 500, 'Estatus Activo/Inactivo no configurados.');

        $modulo->update([
            'estatus_id' => $modulo->estatus_id === $activoId
                ? $inactivoId
                : $activoId,
        ]);

        $estado = $modulo->fresh('estatus')?->estatus?->nombre ?? 'actualizado';

        return redirect()
            ->route('admin.equipos.create')
            ->with('success', "Módulo marcado como {$estado}.");
    }

    /**
     * Delete a module and its associated image.
     */
    public function destroy(Modulo $modulo): RedirectResponse
    {
        if ($modulo->imagen) {
            $filename = basename($modulo->imagen);

            if (Storage::disk('maquinas')->exists($filename)) {
                Storage::disk('maquinas')->delete($filename);
            }
        }

        $modulo->delete();

        return redirect()
            ->route('admin.equipos.create')
            ->with('success', 'Módulo eliminado correctamente.');
    }
}
