<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServicioRequest;
use App\Models\Correo;
use App\Models\Horario;
use App\Models\Servicio;
use App\Models\Telefono;
use App\Models\TipoServicioMantenimiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServicioController extends Controller
{
    /**
     * Show the servicio registration form and listing.
     */
    public function index(): Response
    {
        return Inertia::render('Contacto/Cargar-contacto', [
            'servicios' => Servicio::query()
                ->with([
                    'tipoServicioMantenimiento:id,nombre,slug',
                    'telefono:id,nombre,numero',
                    'correo:id,nombre,correo',
                    'horario:id,dias,hora_inicio,hora_fin',
                ])
                ->latest()
                ->get(),
            'tiposServicio' => TipoServicioMantenimiento::query()
                ->where('activo', true)
                ->orderBy('id')
                ->get(['id', 'nombre', 'slug']),
            'telefonos' => Telefono::query()
                ->where('activo', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'numero', 'tipo']),
            'correos' => Correo::query()
                ->where('activo', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'correo']),
            'horarios' => Horario::query()
                ->where('activo', true)
                ->orderBy('dias')
                ->get(['id', 'dias', 'hora_inicio', 'hora_fin']),
        ]);
    }

    /**
     * Store a newly created servicio.
     */
    public function store(StoreServicioRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $tipo = TipoServicioMantenimiento::query()
            ->whereKey($validated['tipo_servicio_mantenimiento_id'])
            ->firstOrFail();

        $baseSlug = Str::slug($validated['nombre']);

        if ($baseSlug === '') {
            $baseSlug = $tipo->slug !== '' ? $tipo->slug : 'servicio';
        }

        $slug = $baseSlug;
        $suffix = 1;

        while (Servicio::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        Servicio::query()->create([
            'tipo_servicio_mantenimiento_id' => $tipo->id,
            'nombre' => $validated['nombre'],
            'slug' => $slug,
            'descripcion' => $validated['descripcion'] ?? null,
            'icono' => $validated['icono'],
            'telefono_id' => $validated['telefono_id'] ?? null,
            'correo_id' => $validated['correo_id'] ?? null,
            'horario_id' => $validated['horario_id'] ?? null,
            'activo' => $validated['activo'],
        ]);

        return redirect()
            ->route('admin.servicios.index')
            ->with('success', 'Servicio registrado correctamente.');
    }

    /**
     * Toggle the servicio active state.
     */
    public function toggleStatus(Servicio $servicio): RedirectResponse
    {
        $servicio->update([
            'activo' => ! $servicio->activo,
        ]);

        $estado = $servicio->activo ? 'Activo' : 'Inactivo';

        return redirect()
            ->route('admin.servicios.index')
            ->with('success', "Servicio marcado como {$estado}.");
    }

    /**
     * Delete a servicio.
     */
    public function destroy(Servicio $servicio): RedirectResponse
    {
        $servicio->delete();

        return redirect()
            ->route('admin.servicios.index')
            ->with('success', 'Servicio eliminado correctamente.');
    }
}
