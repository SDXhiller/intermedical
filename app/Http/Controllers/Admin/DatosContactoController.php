<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCorreoRequest;
use App\Http\Requests\Admin\StoreHorarioRequest;
use App\Http\Requests\Admin\StoreTelefonoRequest;
use App\Models\Correo;
use App\Models\Horario;
use App\Models\Telefono;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DatosContactoController extends Controller
{
    /**
     * Show forms and listings for telefonos, correos and horarios.
     */
    public function index(): Response
    {
        return Inertia::render('Contacto/Cargar-datos-contactos', [
            'telefonos' => Telefono::query()
                ->latest()
                ->get(['id', 'nombre', 'numero', 'tipo', 'activo', 'created_at']),
            'correos' => Correo::query()
                ->latest()
                ->get(['id', 'nombre', 'correo', 'activo', 'created_at']),
            'horarios' => Horario::query()
                ->latest()
                ->get(['id', 'dias', 'hora_inicio', 'hora_fin', 'activo', 'created_at']),
        ]);
    }

    public function storeTelefono(StoreTelefonoRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Telefono::query()->create($validated);

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', 'Teléfono registrado correctamente.');
    }

    public function storeCorreo(StoreCorreoRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Correo::query()->create($validated);

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', 'Correo registrado correctamente.');
    }

    public function storeHorario(StoreHorarioRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Horario::query()->create($validated);

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', 'Horario registrado correctamente.');
    }

    public function toggleTelefono(Telefono $telefono): RedirectResponse
    {
        $telefono->update(['activo' => ! $telefono->activo]);

        $estado = $telefono->activo ? 'Activo' : 'Inactivo';

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', "Teléfono marcado como {$estado}.");
    }

    public function toggleCorreo(Correo $correo): RedirectResponse
    {
        $correo->update(['activo' => ! $correo->activo]);

        $estado = $correo->activo ? 'Activo' : 'Inactivo';

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', "Correo marcado como {$estado}.");
    }

    public function toggleHorario(Horario $horario): RedirectResponse
    {
        $horario->update(['activo' => ! $horario->activo]);

        $estado = $horario->activo ? 'Activo' : 'Inactivo';

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', "Horario marcado como {$estado}.");
    }

    public function destroyTelefono(Telefono $telefono): RedirectResponse
    {
        $telefono->delete();

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', 'Teléfono eliminado correctamente.');
    }

    public function destroyCorreo(Correo $correo): RedirectResponse
    {
        $correo->delete();

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', 'Correo eliminado correctamente.');
    }

    public function destroyHorario(Horario $horario): RedirectResponse
    {
        $horario->delete();

        return redirect()
            ->route('admin.datos-contacto.index')
            ->with('success', 'Horario eliminado correctamente.');
    }
}
