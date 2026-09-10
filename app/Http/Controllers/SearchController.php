<?php

namespace App\Http\Controllers;

use App\Enums\ServicioIcono;
use App\Models\Correo;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Servicio;
use App\Models\Telefono;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    private const SUGGESTION_LIMIT = 8;

    /**
     * Search public catalog content across equipment, services and contacts.
     */
    public function index(Request $request): Response
    {
        $query = trim($request->string('q')->toString());

        return Inertia::render('Search', [
            'query' => $query,
            'results' => $query === '' ? [] : $this->search($query)->values()->all(),
        ]);
    }

    /**
     * Return quick search suggestions for the header autocomplete.
     */
    public function suggest(Request $request): JsonResponse
    {
        $query = trim($request->string('q')->toString());

        if (mb_strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        return response()->json([
            'suggestions' => $this->search($query)
                ->take(self::SUGGESTION_LIMIT)
                ->values()
                ->all(),
        ]);
    }

    /**
     * @return Collection<int, array{
     *     id: string,
     *     tipo: string,
     *     tipo_label: string,
     *     nombre: string,
     *     detalle: string|null,
     *     imagen: string|null,
     *     url: string
     * }>
     */
    protected function search(string $query): Collection
    {
        $term = $this->likeTerm($query);

        return collect()
            ->merge($this->searchModulos($term))
            ->merge($this->searchEquipos($term))
            ->merge($this->searchServicios($term))
            ->merge($this->searchTelefonos($term))
            ->merge($this->searchCorreos($term))
            ->sortBy([
                ['tipo_label', 'asc'],
                ['nombre', 'asc'],
            ])
            ->values();
    }

    private function likeTerm(string $query): string
    {
        return '%'.addcslashes($query, '%_\\').'%';
    }

    /**
     * @return Collection<int, array{id: string, tipo: string, tipo_label: string, nombre: string, detalle: string|null, imagen: string|null, url: string}>
     */
    private function searchModulos(string $term): Collection
    {
        return Modulo::query()
            ->activos()
            ->where(function (Builder $builder) use ($term): void {
                $builder
                    ->where('modulo', 'like', $term)
                    ->orWhere('descripcion', 'like', $term)
                    ->orWhere('slug', 'like', $term);
            })
            ->orderBy('modulo')
            ->get(['id', 'modulo', 'slug', 'descripcion', 'imagen'])
            ->map(fn (Modulo $modulo): array => [
                'id' => "equipo-{$modulo->id}",
                'tipo' => 'equipo',
                'tipo_label' => 'Equipo',
                'nombre' => $modulo->modulo,
                'detalle' => $modulo->descripcion,
                'imagen' => $modulo->imageUrl(),
                'url' => route('equipos.index', $modulo->slug),
            ]);
    }

    /**
     * @return Collection<int, array{id: string, tipo: string, tipo_label: string, nombre: string, detalle: string|null, url: string}>
     */
    private function searchEquipos(string $term): Collection
    {
        return EquipoModulo::query()
            ->where('activo', true)
            ->whereHas('modulo', fn (Builder $builder) => $builder->activos())
            ->with([
                'fabricante:id,nombre',
                'modulo:id,modulo,slug',
            ])
            ->where(function (Builder $builder) use ($term): void {
                $builder
                    ->where('modelo', 'like', $term)
                    ->orWhere('descripcion_corta', 'like', $term)
                    ->orWhere('aplicaciones', 'like', $term)
                    ->orWhere('modalidad', 'like', $term)
                    ->orWhereHas(
                        'fabricante',
                        fn (Builder $fabricanteQuery) => $fabricanteQuery->where('nombre', 'like', $term),
                    );
            })
            ->orderBy('modelo')
            ->get()
            ->map(function (EquipoModulo $equipo): array {
                $fabricante = $equipo->fabricante?->nombre;
                $categoria = $equipo->modulo?->modulo;
                $detalle = collect([$categoria, $fabricante])
                    ->filter()
                    ->implode(' · ');

                return [
                    'id' => "sub-equipo-{$equipo->id}",
                    'tipo' => 'sub_equipo',
                    'tipo_label' => 'Sub-equipo',
                    'nombre' => $equipo->modelo,
                    'detalle' => $detalle !== '' ? $detalle : $equipo->descripcion_corta,
                    'imagen' => $equipo->imageUrl(),
                    'url' => route('modulos.show', $equipo->slug),
                ];
            });
    }

    /**
     * @return Collection<int, array{id: string, tipo: string, tipo_label: string, nombre: string, detalle: string|null, imagen: string|null, url: string}>
     */
    private function searchServicios(string $term): Collection
    {
        return Servicio::query()
            ->where('activo', true)
            ->with('tipoServicioMantenimiento:id,nombre,slug')
            ->where(function (Builder $builder) use ($term): void {
                $builder
                    ->where('nombre', 'like', $term)
                    ->orWhere('descripcion', 'like', $term);
            })
            ->orderBy('nombre')
            ->get()
            ->map(function (Servicio $servicio): array {
                $tipoSlug = $servicio->tipoServicioMantenimiento?->slug;

                return [
                    'id' => "servicio-{$servicio->id}",
                    'tipo' => 'servicio',
                    'tipo_label' => 'Servicio',
                    'nombre' => $servicio->nombre,
                    'detalle' => $servicio->descripcion
                        ?? $servicio->tipoServicioMantenimiento?->nombre,
                    'imagen' => null,
                    'url' => $tipoSlug !== null && $tipoSlug !== ''
                        ? route('contacto', ['tipo' => $tipoSlug])
                        : route('contacto'),
                ];
            });
    }

    /**
     * @return Collection<int, array{id: string, tipo: string, tipo_label: string, nombre: string, detalle: string|null, imagen: string|null, url: string}>
     */
    private function searchTelefonos(string $term): Collection
    {
        return Telefono::query()
            ->where('activo', true)
            ->whereHas(
                'servicios',
                fn (Builder $builder) => $this->applyVisibleTelefonoServicioConstraints($builder),
            )
            ->where(function (Builder $builder) use ($term): void {
                $builder
                    ->where('nombre', 'like', $term)
                    ->orWhere('numero', 'like', $term)
                    ->orWhere('tipo', 'like', $term);
            })
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'numero', 'tipo'])
            ->map(function (Telefono $telefono): ?array {
                $url = $this->contactUrlForTelefono($telefono);

                if ($url === null) {
                    return null;
                }

                return [
                    'id' => "telefono-{$telefono->id}",
                    'tipo' => 'telefono',
                    'tipo_label' => 'Teléfono',
                    'nombre' => $telefono->nombre,
                    'detalle' => "{$telefono->numero} · {$telefono->tipo}",
                    'imagen' => null,
                    'url' => $url,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * @return Collection<int, array{id: string, tipo: string, tipo_label: string, nombre: string, detalle: string|null, imagen: string|null, url: string}>
     */
    private function searchCorreos(string $term): Collection
    {
        return Correo::query()
            ->where('activo', true)
            ->whereHas(
                'servicios',
                fn (Builder $builder) => $this->applyVisibleCorreoServicioConstraints($builder),
            )
            ->where(function (Builder $builder) use ($term): void {
                $builder
                    ->where('nombre', 'like', $term)
                    ->orWhere('correo', 'like', $term);
            })
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'correo'])
            ->map(function (Correo $correo): ?array {
                $url = $this->contactUrlForCorreo($correo);

                if ($url === null) {
                    return null;
                }

                return [
                    'id' => "correo-{$correo->id}",
                    'tipo' => 'correo',
                    'tipo_label' => 'Correo',
                    'nombre' => $correo->nombre,
                    'detalle' => $correo->correo,
                    'imagen' => null,
                    'url' => $url,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * @param  Builder<Servicio>  $builder
     */
    private function applyVisibleContactServicioConstraints(Builder $builder): void
    {
        $builder
            ->where('activo', true)
            ->whereHas(
                'tipoServicioMantenimiento',
                fn (Builder $tipoQuery) => $tipoQuery->where('activo', true),
            );
    }

    /**
     * @param  Builder<Servicio>  $builder
     */
    private function applyVisibleTelefonoServicioConstraints(Builder $builder): void
    {
        $this->applyVisibleContactServicioConstraints($builder);

        $builder->whereIn('icono', [
            ServicioIcono::Telefono->value,
            ServicioIcono::Soporte->value,
            ServicioIcono::Whatsapp->value,
        ]);
    }

    /**
     * @param  Builder<Servicio>  $builder
     */
    private function applyVisibleCorreoServicioConstraints(Builder $builder): void
    {
        $this->applyVisibleContactServicioConstraints($builder);

        $builder->where('icono', ServicioIcono::Correo->value);
    }

    private function contactUrlForTelefono(Telefono $telefono): ?string
    {
        $servicio = Servicio::query()
            ->where('telefono_id', $telefono->id)
            ->tap(fn (Builder $builder) => $this->applyVisibleTelefonoServicioConstraints($builder))
            ->with('tipoServicioMantenimiento:id,slug')
            ->orderBy('nombre')
            ->first();

        return $this->contactUrlForServicio($servicio);
    }

    private function contactUrlForCorreo(Correo $correo): ?string
    {
        $servicio = Servicio::query()
            ->where('correo_id', $correo->id)
            ->tap(fn (Builder $builder) => $this->applyVisibleCorreoServicioConstraints($builder))
            ->with('tipoServicioMantenimiento:id,slug')
            ->orderBy('nombre')
            ->first();

        return $this->contactUrlForServicio($servicio);
    }

    private function contactUrlForServicio(?Servicio $servicio): ?string
    {
        if ($servicio === null) {
            return null;
        }

        $tipoSlug = $servicio->tipoServicioMantenimiento?->slug;

        if ($tipoSlug === null || $tipoSlug === '') {
            return null;
        }

        return route('contacto', ['tipo' => $tipoSlug]);
    }
}
