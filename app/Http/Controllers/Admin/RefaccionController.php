<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRefaccionRequest;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Refaccion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class RefaccionController extends Controller
{
    public function create(): Response
    {
        $modelos = Modulo::query()
            ->activos()
            ->orderBy('modulo')
            ->get(['id', 'modulo'])
            ->map(fn (Modulo $modulo): array => [
                'id' => $modulo->id,
                'nombre' => $modulo->modulo,
            ])
            ->values()
            ->all();

        $fabricantes = Fabricante::query()
            ->where('activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre'])
            ->map(fn (Fabricante $fabricante): array => [
                'id' => $fabricante->id,
                'nombre' => $fabricante->nombre,
            ])
            ->values()
            ->all();

        return Inertia::render('Refacciones/FormularioPiesasReffaciones', [
            'modelos' => $modelos,
            'fabricantes' => $fabricantes,
        ]);
    }

    public function store(StoreRefaccionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $refaccion = Refaccion::query()->create([
            'modulo_id' => $validated['modulo_id'],
            'nombre' => $validated['nombre'],
            'numero_parte' => $validated['numero_parte'] ?? null,
            'fabricante_id' => $validated['fabricante_id'],
            'categoria' => $validated['categoria'],
            'descripcion' => $validated['descripcion'] ?? null,
            'condicion' => $validated['condicion'],
            'disponibilidad' => $validated['disponibilidad'],
            'publicado' => true,
        ]);

        $imagenes = $request->file('imagenes', []);

        if (is_array($imagenes)) {
            foreach (array_values($imagenes) as $index => $imagen) {
                if (! $imagen instanceof UploadedFile) {
                    continue;
                }

                $filename = $imagen->storeAsWebp('', 'refacciones');

                $refaccion->imagenes()->create([
                    'ruta' => 'Imagen/Refacciones/'.$filename,
                    'orden' => $index,
                    'es_principal' => $index === 0,
                ]);
            }
        }

        return redirect()
            ->route('admin.refacciones.create')
            ->with('success', 'Refacción registrada correctamente.');
    }
}
