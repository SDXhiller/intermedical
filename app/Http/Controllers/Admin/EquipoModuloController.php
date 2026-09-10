<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEquipoModuloRequest;
use App\Http\Requests\Admin\UpdateEquipoModuloRequest;
use App\Models\Disponibilidad;
use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Imagen360;
use App\Models\Modulo;
use App\Models\TipoEquipo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EquipoModuloController extends Controller
{
    /**
     * Show the equipment model registration form and listing data.
     */
    public function index(): Response
    {
        $equipos = EquipoModulo::query()
            ->with([
                'modulo:id,modulo',
                'fabricante:id,nombre',
                'tipoEquipo:id,tipo,slug',
                'disponibilidad:id,nombre,color',
                'imagenes360.puntos',
            ])
            ->latest()
            ->get([
                'id',
                'modulo_id',
                'fabricante_id',
                'modelo',
                'imagen',
                'descripcion_corta',
                'estado',
                'modalidad',
                'aplicaciones',
                'anio',
                'tipo_equipo_id',
                'disponibilidad_id',
                'precio',
                'activo',
                'created_at',
            ]);

        foreach ($equipos as $equipo) {
            if ($equipo->imagen && $equipo->imagenes360->isEmpty()) {
                $created = Imagen360::query()->create([
                    'equipo_modulo_id' => $equipo->id,
                    'imagen' => $equipo->imagen,
                    'es_principal' => true,
                    'orden' => 0,
                    'titulo' => 'Principal',
                ]);
                $created->setRelation('puntos', collect());
                $equipo->setRelation('imagenes360', collect([$created]));
            }
        }

        return Inertia::render('Modulos/Registro-equipos-modelos', [
            'modulos' => Modulo::query()
                ->orderBy('modulo')
                ->get(['id', 'modulo']),
            'fabricantes' => Fabricante::query()
                ->where('activo', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
            'tiposEquipos' => TipoEquipo::query()
                ->where('activo', true)
                ->orderBy('tipo')
                ->get(['id', 'tipo', 'slug']),
            'disponibilidades' => Disponibilidad::query()
                ->orderBy('id')
                ->get(['id', 'nombre', 'color']),
            'equipos' => $equipos->map(fn (EquipoModulo $equipo): array => [
                'id' => $equipo->id,
                'modulo_id' => $equipo->modulo_id,
                'fabricante_id' => $equipo->fabricante_id,
                'modelo' => $equipo->modelo,
                'imagen' => $equipo->imagen,
                'descripcion_corta' => $equipo->descripcion_corta,
                'estado' => $equipo->estado,
                'modalidad' => $equipo->modalidad,
                'aplicaciones' => $equipo->aplicaciones,
                'anio' => $equipo->anio,
                'tipo_equipo_id' => $equipo->tipo_equipo_id,
                'disponibilidad_id' => $equipo->disponibilidad_id,
                'precio' => $equipo->precio,
                'activo' => $equipo->activo,
                'created_at' => $equipo->created_at,
                'modulo' => $equipo->modulo,
                'fabricante' => $equipo->fabricante,
                'tipo_equipo' => $equipo->tipoEquipo,
                'disponibilidad' => $equipo->disponibilidad,
                'imagenes_360' => $equipo->imagenes360->map(fn (Imagen360 $imagen): array => [
                    'id' => $imagen->id,
                    'imagen' => $imagen->imagen,
                    'es_principal' => $imagen->es_principal,
                    'orden' => $imagen->orden,
                    'titulo' => $imagen->titulo,
                    'puntos' => $imagen->puntos->map(fn ($punto): array => [
                        'id' => $punto->id,
                        'pos_x' => (float) $punto->pos_x,
                        'pos_y' => (float) $punto->pos_y,
                        'etiqueta' => $punto->etiqueta,
                        'destino_imagen_360_id' => $punto->destino_imagen_360_id,
                    ])->values()->all(),
                ])->values()->all(),
            ]),
        ]);
    }

    /**
     * Store a newly created equipment model.
     */
    public function store(StoreEquipoModuloRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $imagenPath = null;

        if ($request->hasFile('imagen')) {
            $filename = $request->file('imagen')->storeAsWebp('', 'maquinas');
            $imagenPath = 'Imagen/Maquinas/'.$filename;
        }

        $equipo = EquipoModulo::query()->create([
            'modulo_id' => $validated['modulo_id'],
            'fabricante_id' => $validated['fabricante_id'],
            'modelo' => $validated['modelo'],
            'imagen' => $imagenPath,
            'descripcion_corta' => $validated['descripcion_corta'] ?? null,
            'estado' => $validated['estado'] ?? null,
            'modalidad' => $validated['modalidad'],
            'aplicaciones' => $validated['aplicaciones'],
            'anio' => $validated['anio'] ?? null,
            'tipo_equipo_id' => $validated['tipo_equipo_id'],
            'disponibilidad_id' => $validated['disponibilidad_id'] ?? null,
            'precio' => $validated['precio'] ?? null,
            'activo' => $validated['activo'],
        ]);

        if ($imagenPath !== null) {
            Imagen360::query()->create([
                'equipo_modulo_id' => $equipo->id,
                'imagen' => $imagenPath,
                'es_principal' => true,
                'orden' => 0,
                'titulo' => 'Principal',
            ]);
        }

        return redirect()
            ->route('admin.modelos-equipos')
            ->with('success', 'Modelo de equipo registrado correctamente.')
            ->with('open_360_equipo_id', $imagenPath !== null ? $equipo->id : null);
    }

    /**
     * Update an existing equipment model.
     */
    public function update(UpdateEquipoModuloRequest $request, EquipoModulo $equipoModulo): RedirectResponse
    {
        $validated = $request->validated();
        $imagenPath = $equipoModulo->imagen;

        if ($request->hasFile('imagen')) {
            if ($equipoModulo->imagen) {
                $oldFilename = basename($equipoModulo->imagen);

                if (Storage::disk('maquinas')->exists($oldFilename)) {
                    Storage::disk('maquinas')->delete($oldFilename);
                }
            }

            $filename = $request->file('imagen')->storeAsWebp('', 'maquinas');
            $imagenPath = 'Imagen/Maquinas/'.$filename;
        }

        $equipoModulo->update([
            'modulo_id' => $validated['modulo_id'],
            'fabricante_id' => $validated['fabricante_id'],
            'modelo' => $validated['modelo'],
            'imagen' => $imagenPath,
            'descripcion_corta' => $validated['descripcion_corta'] ?? null,
            'estado' => $validated['estado'] ?? null,
            'modalidad' => $validated['modalidad'],
            'aplicaciones' => $validated['aplicaciones'],
            'anio' => $validated['anio'] ?? null,
            'tipo_equipo_id' => $validated['tipo_equipo_id'],
            'disponibilidad_id' => $validated['disponibilidad_id'] ?? null,
            'precio' => $validated['precio'] ?? null,
            'activo' => $validated['activo'],
        ]);

        if ($request->hasFile('imagen') && $imagenPath !== null) {
            $principal = $equipoModulo->imagenes360()
                ->where('es_principal', true)
                ->first();

            if ($principal) {
                $principal->update(['imagen' => $imagenPath]);
            } else {
                Imagen360::query()->create([
                    'equipo_modulo_id' => $equipoModulo->id,
                    'imagen' => $imagenPath,
                    'es_principal' => true,
                    'orden' => 0,
                    'titulo' => 'Principal',
                ]);
            }
        }

        return redirect()
            ->route('admin.modelos-equipos')
            ->with('success', 'Modelo de equipo actualizado correctamente.');
    }

    /**
     * Toggle the equipment model active state.
     */
    public function toggleStatus(EquipoModulo $equipoModulo): RedirectResponse
    {
        $equipoModulo->update([
            'activo' => ! $equipoModulo->activo,
        ]);

        $estado = $equipoModulo->activo ? 'Activo' : 'Inactivo';

        return redirect()
            ->route('admin.modelos-equipos')
            ->with('success', "Modelo marcado como {$estado}.");
    }

    /**
     * Delete an equipment model and its image.
     */
    public function destroy(EquipoModulo $equipoModulo): RedirectResponse
    {
        $equipoModulo->load('imagenes360');

        foreach ($equipoModulo->imagenes360 as $imagen360) {
            $filename = basename($imagen360->imagen);

            if (Storage::disk('imagen_360')->exists($filename)) {
                Storage::disk('imagen_360')->delete($filename);
            }

            if (Storage::disk('maquinas')->exists($filename)) {
                Storage::disk('maquinas')->delete($filename);
            }
        }

        if ($equipoModulo->imagen) {
            $filename = basename($equipoModulo->imagen);

            if (Storage::disk('maquinas')->exists($filename)) {
                Storage::disk('maquinas')->delete($filename);
            }
        }

        $equipoModulo->delete();

        return redirect()
            ->route('admin.modelos-equipos')
            ->with('success', 'Modelo de equipo eliminado correctamente.');
    }
}
