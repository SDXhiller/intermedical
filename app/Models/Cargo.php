<?php

namespace App\Models;

use Database\Factories\CargoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property string $slug
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nombre', 'slug'])]
class Cargo extends Model
{
    public const SLUG_SUPER_USUARIO = 'super-usuario';

    public const SLUG_GERENTE_VENTAS = 'gerente-ventas';

    public const SLUG_EQUIPOS = 'equipos';

    public const SLUG_ATENCION = 'atencion';

    public const AREA_EQUIPOS = 'equipos';

    public const AREA_MODELOS_EQUIPOS = 'modelos-equipos';

    public const AREA_FABRICANTES = 'fabricantes';

    public const AREA_DATOS_CONTACTO = 'datos-contacto';

    public const AREA_SERVICIOS = 'servicios';

    public const AREA_COTIZACIONES = 'cotizaciones';

    public const AREA_USUARIOS = 'usuarios';

    public const AREA_CONFIGURACION = 'configuracion';

    /** @use HasFactory<CargoFactory> */
    use HasFactory;

    protected $table = 'cargos';

    /**
     * @return list<string>
     */
    public static function allAreas(): array
    {
        return [
            self::AREA_EQUIPOS,
            self::AREA_MODELOS_EQUIPOS,
            self::AREA_FABRICANTES,
            self::AREA_DATOS_CONTACTO,
            self::AREA_SERVICIOS,
            self::AREA_COTIZACIONES,
            self::AREA_USUARIOS,
            self::AREA_CONFIGURACION,
        ];
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeAsignables(Builder $query): Builder
    {
        return $query->where('slug', '!=', self::SLUG_SUPER_USUARIO);
    }

    public function isSuperUsuario(): bool
    {
        return $this->slug === self::SLUG_SUPER_USUARIO;
    }

    /**
     * @return list<string>
     */
    public function areas(): array
    {
        return match ($this->slug) {
            self::SLUG_SUPER_USUARIO => self::allAreas(),
            self::SLUG_GERENTE_VENTAS => [self::AREA_COTIZACIONES],
            self::SLUG_EQUIPOS => [
                self::AREA_EQUIPOS,
                self::AREA_MODELOS_EQUIPOS,
                self::AREA_FABRICANTES,
            ],
            self::SLUG_ATENCION => [
                self::AREA_DATOS_CONTACTO,
                self::AREA_SERVICIOS,
            ],
            default => [],
        };
    }

    /**
     * @return HasMany<UserAdmin, $this>
     */
    public function admins(): HasMany
    {
        return $this->hasMany(UserAdmin::class, 'cargo_id');
    }
}
