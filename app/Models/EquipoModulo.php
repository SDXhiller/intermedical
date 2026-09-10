<?php

namespace App\Models;

use Database\Factories\EquipoModuloFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $modulo_id
 * @property int $fabricante_id
 * @property string $modelo
 * @property string $slug
 * @property string|null $imagen
 * @property string|null $descripcion_corta
 * @property string|null $estado
 * @property string|null $modalidad
 * @property string|null $aplicaciones
 * @property int|null $anio
 * @property int $tipo_equipo_id
 * @property int|null $disponibilidad_id
 * @property string|null $precio
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Modulo $modulo
 * @property-read Fabricante $fabricante
 * @property-read TipoEquipo $tipoEquipo
 * @property-read Disponibilidad|null $disponibilidad
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Imagen360> $imagenes360
 */
#[Fillable([
    'modulo_id',
    'fabricante_id',
    'modelo',
    'slug',
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
])]
class EquipoModulo extends Model
{
    /** @use HasFactory<EquipoModuloFactory> */
    use HasFactory;

    protected $table = 'equipos_modulos';

    protected static function booted(): void
    {
        static::saving(function (EquipoModulo $equipo): void {
            if ($equipo->slug !== null && $equipo->slug !== '' && ! $equipo->isDirty('modelo')) {
                return;
            }

            $equipo->slug = static::uniqueSlugFromModelo(
                $equipo->modelo,
                $equipo->exists ? $equipo->id : null,
            );
        });
    }

    /**
     * Build a unique public slug from the model name.
     */
    public static function uniqueSlugFromModelo(string $modelo, ?int $ignoreId = null): string
    {
        $base = Str::slug($modelo);
        $base = $base !== '' ? $base : 'equipo';
        $slug = $base;
        $suffix = 2;

        while (
            static::query()
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('slug', $slug)
                ->exists()
            || Modulo::query()->where('slug', $slug)->exists()
        ) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'anio' => 'integer',
            'activo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Modulo, $this>
     */
    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * @return BelongsTo<Fabricante, $this>
     */
    public function fabricante(): BelongsTo
    {
        return $this->belongsTo(Fabricante::class, 'fabricante_id');
    }

    /**
     * @return BelongsTo<TipoEquipo, $this>
     */
    public function tipoEquipo(): BelongsTo
    {
        return $this->belongsTo(TipoEquipo::class, 'tipo_equipo_id');
    }

    /**
     * @return BelongsTo<Disponibilidad, $this>
     */
    public function disponibilidad(): BelongsTo
    {
        return $this->belongsTo(Disponibilidad::class, 'disponibilidad_id');
    }

    /**
     * @return HasMany<Imagen360, $this>
     */
    public function imagenes360(): HasMany
    {
        return $this->hasMany(Imagen360::class, 'equipo_modulo_id')
            ->orderBy('orden')
            ->orderBy('id');
    }

    /**
     * @return HasMany<ClienteCotisacion, $this>
     */
    public function cotizaciones(): HasMany
    {
        return $this->hasMany(ClienteCotisacion::class, 'equipo_modulo_id');
    }

    /**
     * Public slug used in listing and detail routes.
     */
    public function publicSlug(): string
    {
        return $this->slug;
    }

    /**
     * Public image URL for this equipment model.
     */
    public function imageUrl(): ?string
    {
        if ($this->imagen === null || $this->imagen === '') {
            return null;
        }

        return '/'.ltrim($this->imagen, '/');
    }

    /**
     * Map availability to the public listing status key.
     */
    public function listingStatus(): string
    {
        return match ($this->disponibilidad?->nombre) {
            'Bajo pedido' => 'on_order',
            'Agotado' => 'out_of_stock',
            default => 'available',
        };
    }

    /**
     * Payload for a public listing card.
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
    public function toListingProduct(string $categorySlug): array
    {
        return [
            'slug' => $this->publicSlug(),
            'name' => $this->modelo,
            'brand' => $this->fabricante?->nombre ?? 'Sin fabricante',
            'type' => $this->tipoEquipo?->tipo ?? 'Equipo médico',
            'applications' => $this->aplicaciones
                ?: ($this->descripcion_corta ?: 'Imagen médica'),
            'status' => $this->listingStatus(),
            'image' => $this->imageUrl() ?? '',
            'category' => $categorySlug,
        ];
    }

    /**
     * Payload for the public detail page including 360 images.
     *
     * @return array<string, mixed>
     */
    public function toDetailPayload(): array
    {
        $this->loadMissing([
            'fabricante:id,nombre',
            'disponibilidad:id,nombre,color',
            'modulo:id,modulo,slug',
            'imagenes360.puntos.destino:id,imagen,titulo,orden',
        ]);

        return [
            'slug' => $this->publicSlug(),
            'name' => $this->modelo,
            'image' => $this->imageUrl() ?? '',
            'brand' => $this->fabricante?->nombre,
            'description' => $this->descripcion_corta,
            'estado' => $this->estado,
            'disponibilidad' => $this->disponibilidad?->nombre,
            'modalidad' => $this->modalidad,
            'aplicaciones' => $this->aplicaciones,
            'anio' => $this->anio,
            'sku' => 'MIG-EM-'.$this->id,
            'category' => $this->modulo?->slug,
            'category_name' => $this->modulo?->modulo,
            'imagenes_360' => $this->imagenes360->map(fn (Imagen360 $imagen): array => [
                'id' => $imagen->id,
                'url' => $imagen->imageUrl(),
                'es_principal' => $imagen->es_principal,
                'orden' => $imagen->orden,
                'titulo' => $imagen->titulo,
                'puntos' => $imagen->puntos->map(fn (PuntoImagen360 $punto): array => [
                    'id' => $punto->id,
                    'pos_x' => (float) $punto->pos_x,
                    'pos_y' => (float) $punto->pos_y,
                    'etiqueta' => $punto->etiqueta,
                    'destino_id' => $punto->destino_imagen_360_id,
                ])->values()->all(),
            ])->values()->all(),
        ];
    }
}
