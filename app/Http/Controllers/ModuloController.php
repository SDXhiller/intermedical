<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Support\EquipmentCatalog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ModuloController extends Controller
{
    /**
     * Public equipment listing for a module category.
     */
    public function index(string $category): Response
    {
        $modulo = Modulo::query()
            ->activos()
            ->with('estatus:id,nombre')
            ->where('slug', $category)
            ->first();

        if ($modulo === null) {
            throw new NotFoundHttpException;
        }

        return Inertia::render('Modulos/ListadoView', [
            'category' => $modulo->toListingCategory(),
            'products' => $modulo->listingProducts(),
        ]);
    }

    /**
     * Public equipment detail page.
     */
    public function show(string $slug): Response|RedirectResponse
    {
        if (preg_match('/^em-(\d+)$/', $slug, $matches) === 1) {
            $legacyEquipo = EquipoModulo::query()
                ->where('activo', true)
                ->find((int) $matches[1]);

            if ($legacyEquipo === null) {
                throw new NotFoundHttpException;
            }

            return redirect()->route('modulos.show', $legacyEquipo->publicSlug(), 301);
        }

        $equipo = EquipoModulo::query()
            ->where('activo', true)
            ->where('slug', $slug)
            ->with([
                'fabricante:id,nombre',
                'modulo:id,modulo,slug',
                'tipoEquipo:id,tipo',
                'disponibilidad:id,nombre,color',
            ])
            ->first();

        if ($equipo !== null && $equipo->modulo !== null) {
            $moduloActivo = Modulo::query()
                ->activos()
                ->whereKey($equipo->modulo_id)
                ->exists();

            if (! $moduloActivo) {
                throw new NotFoundHttpException;
            }

            return Inertia::render('Modulos/Modulosview', [
                'module' => $equipo->toDetailPayload(),
            ]);
        }

        $product = EquipmentCatalog::findProduct($slug);

        if ($product !== null) {
            return Inertia::render('Modulos/Modulosview', [
                'module' => [
                    'slug' => $product['slug'],
                    'name' => $product['name'],
                    'image' => $product['image'],
                    'brand' => $product['brand'],
                    'category' => $product['category'],
                    'category_name' => EquipmentCatalog::findCategory($product['category'])['name']
                        ?? Modulo::query()->where('slug', $product['category'])->value('modulo')
                        ?? $product['category'],
                ],
            ]);
        }

        $dbModulo = Modulo::query()
            ->activos()
            ->where('slug', $slug)
            ->first();

        if ($dbModulo !== null) {
            if (EquipmentCatalog::hasListing($slug)) {
                return redirect()->route('equipos.index', $slug);
            }

            return Inertia::render('Modulos/Modulosview', [
                'module' => [
                    'slug' => $dbModulo->slug,
                    'name' => $dbModulo->modulo,
                    'image' => $dbModulo->imageUrl() ?? '',
                    'description' => $dbModulo->descripcion,
                    'category' => $dbModulo->slug,
                    'category_name' => $dbModulo->modulo,
                ],
            ]);
        }

        $module = EquipmentCatalog::find($slug);

        if ($module === null) {
            throw new NotFoundHttpException;
        }

        return Inertia::render('Modulos/Modulosview', [
            'module' => $module,
        ]);
    }
}
