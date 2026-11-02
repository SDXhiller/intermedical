<?php

namespace App\Models;

use Database\Factories\TipoServicioMantenimientoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $nombre
 * @property string $slug
 * @property string|null $descripcion
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nombre', 'slug', 'descripcion', 'activo'])]
class TipoServicioMantenimiento extends Model
{
    /** @use HasFactory<TipoServicioMantenimientoFactory> */
    use HasFactory;

    /**
     * Public support services that require a failure description.
     *
     * @var list<string>
     */
    public const SERVICIOS_CON_DESCRIPCION_FALLA = [
        'mantenimiento-correctivo',
        'diagnostico',
        'diagnostico-tecnico',
        'servicio-a-inyectores',
        'control-de-calidad-de-imagen',
    ];

    protected $table = 'tipo_servicio_mantenimiento';

    /**
     * Whether the public support form should ask for a failure description.
     */
    public static function requiereDescripcionFalla(?string $slug): bool
    {
        if ($slug === null || $slug === '') {
            return false;
        }

        return in_array($slug, self::SERVICIOS_CON_DESCRIPCION_FALLA, true);
    }

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'descripcion' => '',
        'activo' => true,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Servicio, $this>
     */
    public function servicios(): HasMany
    {
        return $this->hasMany(Servicio::class, 'tipo_servicio_mantenimiento_id');
    }

    /**
     * @return HasMany<SolicitudSoporte, $this>
     */
    public function solicitudesSoporte(): HasMany
    {
        return $this->hasMany(SolicitudSoporte::class, 'tipo_servicio_mantenimiento_id');
    }

    /**
     * Active service types formatted for public pages and menus.
     *
     * @return list<array{title: string, slug: string, description: string, group: string}>
     */
    public static function catalogItems(): array
    {
        return static::query()
            ->where('activo', true)
            ->orderBy('id')
            ->get(['id', 'nombre', 'slug', 'descripcion'])
            ->map(fn (self $tipo): array => $tipo->toPublicCard())
            ->all();
    }

    /**
     * @return array{title: string, slug: string, description: string, group: string}
     */
    public function toPublicCard(): array
    {
        return [
            'title' => $this->nombre,
            'slug' => $this->slug,
            'description' => $this->descripcion ?? '',
            'group' => self::serviceGroup($this->slug),
        ];
    }

    public static function serviceGroup(string $slug): string
    {
        return match ($slug) {
            'mantenimiento-preventivo',
            'mantenimiento-correctivo',
            'diagnostico' => 'mantenimiento',
            'instalacion',
            'desinstalacion',
            'puesta-en-marcha' => 'instalacion',
            'renta-de-equipos-medicos' => 'renta',
            default => 'otros',
        };
    }

    public static function uniqueSlug(string $nombre, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($nombre);
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'tipo-servicio';
        $slug = $baseSlug;
        $suffix = 1;

        while (
            static::query()
                ->where('slug', $slug)
                ->when(
                    $ignoreId !== null,
                    fn (Builder $query): Builder => $query->whereKeyNot($ignoreId),
                )
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
