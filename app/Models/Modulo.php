<?php

namespace App\Models;

use Database\Factories\ModuloFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $modulo
 * @property string $slug
 * @property string|null $imagen
 * @property string|null $descripcion
 * @property int $estatus_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Status $estatus
 */
#[Fillable(['modulo', 'slug', 'imagen', 'descripcion', 'estatus_id'])]
class Modulo extends Model
{
    /** @use HasFactory<ModuloFactory> */
    use HasFactory;

    protected $table = 'modulos';

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->whereHas(
            'estatus',
            fn (Builder $estatusQuery) => $estatusQuery->where('nombre', 'Activo'),
        );
    }

    /**
     * Active modules formatted for the public equipment grid and menus.
     *
     * @return list<array{name: string, slug: string, image: string|null, hasListing: bool}>
     */
    public static function catalogItems(): array
    {
        return static::query()
            ->activos()
            ->orderBy('modulo')
            ->get(['modulo', 'slug', 'imagen'])
            ->map(fn (self $modulo): array => [
                'name' => $modulo->modulo,
                'slug' => $modulo->slug,
                'image' => $modulo->imagen !== null
                    ? '/'.ltrim($modulo->imagen, '/')
                    : null,
                'hasListing' => true,
            ])
            ->all();
    }

    /**
     * Public image URL for this module.
     */
    public function imageUrl(): ?string
    {
        if ($this->imagen === null || $this->imagen === '') {
            return null;
        }

        return '/'.ltrim($this->imagen, '/');
    }

    /**
     * Category payload for the public listing page.
     *
     * @return array{slug: string, name: string, plural_title: string, image: string, description: string|null, status: string}
     */
    public function toListingCategory(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->modulo,
            'plural_title' => $this->modulo.' disponibles',
            'image' => $this->imageUrl() ?? '',
            'description' => $this->descripcion,
            'status' => $this->estatus?->nombre ?? 'Activo',
        ];
    }

    /**
     * Fallback product card when the category has no catalog products yet.
     *
     * @return array{
     *     slug: string,
     *     name: string,
     *     brand: string,
     *     type: string,
     *     applications: string,
     *     status: string,
     *     image: string,
     *     category: string
     * }
     */
    public function toListingProduct(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->modulo,
            'brand' => (string) config('app.name', 'Medical Imaging Group'),
            'type' => 'Equipo médico',
            'applications' => $this->descripcion ?: 'Imagen médica',
            'status' => 'available',
            'image' => $this->imageUrl() ?? '',
            'category' => $this->slug,
        ];
    }

    /**
     * Active equipment models formatted for the public listing page.
     *
     * @return list<array{
     *     slug: string,
     *     name: string,
     *     brand: string,
     *     type: string,
     *     applications: string,
     *     status: string,
     *     image: string,
     *     category: string
     * }>
     */
    public function listingProducts(): array
    {
        return $this->equipos()
            ->where('activo', true)
            ->with([
                'fabricante:id,nombre',
                'tipoEquipo:id,tipo',
                'disponibilidad:id,nombre,color',
            ])
            ->latest()
            ->get()
            ->map(fn (EquipoModulo $equipo): array => $equipo->toListingProduct($this->slug))
            ->all();
    }

    /**
     * @return BelongsTo<Status, $this>
     */
    public function estatus(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'estatus_id');
    }

    /**
     * @return HasMany<EquipoModulo, $this>
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(EquipoModulo::class, 'modulo_id');
    }
}
