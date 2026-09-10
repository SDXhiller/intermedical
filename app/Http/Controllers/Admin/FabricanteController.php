<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFabricanteRequest;
use App\Models\Fabricante;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FabricanteController extends Controller
{
    /**
     * Show the fabricante registration form and listing.
     */
    public function index(): Response
    {
        return Inertia::render('Modulos/Crear-fabricante', [
            'fabricantes' => Fabricante::query()
                ->latest()
                ->get(['id', 'nombre', 'logo', 'activo', 'created_at']),
        ]);
    }

    /**
     * Store a newly created fabricante.
     */
    public function store(StoreFabricanteRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $logoPath = null;

        if ($request->hasFile('logo')) {
            $filename = $request->file('logo')->storeAsWebp('', 'fabricantes');
            $logoPath = 'Imagen/Fabricantes/'.$filename;
        }

        Fabricante::query()->create([
            'nombre' => $validated['nombre'],
            'logo' => $logoPath,
            'activo' => $validated['activo'],
        ]);

        return redirect()
            ->route('admin.fabricantes.index')
            ->with('success', 'Fabricante registrado correctamente.');
    }

    /**
     * Toggle the fabricante active state.
     */
    public function toggleStatus(Fabricante $fabricante): RedirectResponse
    {
        $fabricante->update([
            'activo' => ! $fabricante->activo,
        ]);

        $estado = $fabricante->activo ? 'Activo' : 'Inactivo';

        return redirect()
            ->route('admin.fabricantes.index')
            ->with('success', "Fabricante marcado como {$estado}.");
    }

    /**
     * Delete a fabricante and its logo.
     */
    public function destroy(Fabricante $fabricante): RedirectResponse
    {
        if ($fabricante->logo) {
            $filename = basename($fabricante->logo);

            if (Storage::disk('fabricantes')->exists($filename)) {
                Storage::disk('fabricantes')->delete($filename);
            }
        }

        $fabricante->delete();

        return redirect()
            ->route('admin.fabricantes.index')
            ->with('success', 'Fabricante eliminado correctamente.');
    }
}
