<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EquipoModulo;
use App\Models\Imagen360;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class Imagen360Controller extends Controller
{
    /**
     * Upload a 360 image for an equipment model.
     */
    public function store(Request $request, EquipoModulo $equipoModulo): RedirectResponse
    {
        $validated = $request->validate([
            'imagen' => ['required', 'image', 'max:5120'],
            'titulo' => ['nullable', 'string', 'max:255'],
            'es_principal' => ['sometimes', 'boolean'],
            'origen_imagen_360_id' => [
                'nullable',
                'integer',
                Rule::exists('imagen_360', 'id')->where('equipo_modulo_id', $equipoModulo->id),
            ],
            'puntos' => ['nullable', 'array'],
            'puntos.*.pos_x' => ['required_with:puntos', 'numeric', 'min:0', 'max:100'],
            'puntos.*.pos_y' => ['required_with:puntos', 'numeric', 'min:0', 'max:100'],
            'puntos.*.etiqueta' => ['nullable', 'string', 'max:255'],
            'puntos.*.destino_imagen_360_id' => [
                'nullable',
                'integer',
                Rule::exists('imagen_360', 'id')->where('equipo_modulo_id', $equipoModulo->id),
            ],
            'puntos.*.asignar_destino' => ['sometimes', 'boolean'],
        ]);

        $filename = $request->file('imagen')->storeAsWebp('', 'imagen_360');
        $path = 'Imagen/Maquinas/360/'.$filename;
        $esPrincipal = (bool) ($validated['es_principal'] ?? false);

        $imagen360 = null;

        DB::transaction(function () use ($equipoModulo, $path, $validated, $esPrincipal, &$imagen360): void {
            $isFirst = $equipoModulo->imagenes360()->count() === 0;
            $makePrincipal = $esPrincipal || $isFirst;

            if ($makePrincipal) {
                $equipoModulo->imagenes360()->update(['es_principal' => false]);
                $equipoModulo->update(['imagen' => $path]);
            }

            $orden = ((int) $equipoModulo->imagenes360()->max('orden')) + 1;

            $imagen360 = $equipoModulo->imagenes360()->create([
                'imagen' => $path,
                'es_principal' => $makePrincipal,
                'orden' => $orden,
                'titulo' => $validated['titulo'] ?? null,
            ]);

            $origenId = $validated['origen_imagen_360_id'] ?? null;

            if ($origenId && array_key_exists('puntos', $validated)) {
                $origen = Imagen360::query()
                    ->where('equipo_modulo_id', $equipoModulo->id)
                    ->whereKey($origenId)
                    ->firstOrFail();

                $origen->puntos()->delete();

                foreach ($validated['puntos'] as $punto) {
                    $asignarDestino = (bool) ($punto['asignar_destino'] ?? false);
                    $destinoId = $asignarDestino
                        ? $imagen360->id
                        : ($punto['destino_imagen_360_id'] ?? null);

                    if ($destinoId === $origen->id) {
                        $destinoId = null;
                    }

                    $origen->puntos()->create([
                        'pos_x' => $punto['pos_x'],
                        'pos_y' => $punto['pos_y'],
                        'etiqueta' => $punto['etiqueta'] ?? null,
                        'destino_imagen_360_id' => $destinoId,
                    ]);
                }
            }
        });

        return redirect()
            ->route('admin.modelos-equipos')
            ->with('success', 'Imagen 360 registrada correctamente.')
            ->with('open_360_equipo_id', $equipoModulo->id)
            ->with('nueva_imagen_360_id', $imagen360?->id);
    }

    /**
     * Replace hotspots for a 360 image.
     */
    public function syncPuntos(Request $request, EquipoModulo $equipoModulo, Imagen360 $imagen360): RedirectResponse
    {
        abort_unless($imagen360->equipo_modulo_id === $equipoModulo->id, 404);

        $puntos = collect($request->input('puntos', []))
            ->map(function (array $punto): array {
                if (($punto['destino_imagen_360_id'] ?? null) === '' || ($punto['destino_imagen_360_id'] ?? null) === 'null') {
                    $punto['destino_imagen_360_id'] = null;
                }

                return $punto;
            })
            ->all();

        $request->merge(['puntos' => $puntos]);

        $validated = $request->validate([
            'puntos' => ['present', 'array'],
            'puntos.*.pos_x' => ['required', 'numeric', 'min:0', 'max:100'],
            'puntos.*.pos_y' => ['required', 'numeric', 'min:0', 'max:100'],
            'puntos.*.etiqueta' => ['nullable', 'string', 'max:255'],
            'puntos.*.destino_imagen_360_id' => [
                'nullable',
                'integer',
                Rule::exists('imagen_360', 'id')->where('equipo_modulo_id', $equipoModulo->id),
            ],
        ]);

        DB::transaction(function () use ($imagen360, $validated): void {
            $imagen360->puntos()->delete();

            foreach ($validated['puntos'] as $punto) {
                $destinoId = $punto['destino_imagen_360_id'] ?? null;

                if ($destinoId === $imagen360->id) {
                    $destinoId = null;
                }

                $imagen360->puntos()->create([
                    'pos_x' => $punto['pos_x'],
                    'pos_y' => $punto['pos_y'],
                    'etiqueta' => $punto['etiqueta'] ?? null,
                    'destino_imagen_360_id' => $destinoId,
                ]);
            }
        });

        return redirect()
            ->route('admin.modelos-equipos')
            ->with('success', 'Puntos 360 actualizados correctamente.')
            ->with('open_360_equipo_id', $equipoModulo->id);
    }

    /**
     * Delete a 360 image and its hotspots.
     */
    public function destroy(EquipoModulo $equipoModulo, Imagen360 $imagen360): RedirectResponse
    {
        abort_unless($imagen360->equipo_modulo_id === $equipoModulo->id, 404);

        $filename = basename($imagen360->imagen);

        if (Storage::disk('imagen_360')->exists($filename)) {
            Storage::disk('imagen_360')->delete($filename);
        }

        $wasPrincipal = $imagen360->es_principal;
        $imagen360->delete();

        if ($wasPrincipal) {
            $next = $equipoModulo->imagenes360()->orderBy('orden')->first();

            if ($next) {
                $next->update(['es_principal' => true]);
                $equipoModulo->update(['imagen' => $next->imagen]);
            } else {
                $equipoModulo->update(['imagen' => null]);
            }
        }

        return redirect()
            ->route('admin.modelos-equipos')
            ->with('success', 'Imagen 360 eliminada correctamente.')
            ->with('open_360_equipo_id', $equipoModulo->id);
    }
}
