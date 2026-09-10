<?php

namespace App\Models;

use Database\Factories\RolUsuarioFactory;
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
class RolUsuario extends Model
{
    public const SLUG_SUPER_USUARIO = 'super-usuario';

    public const SLUG_ADMINISTRADOR = 'administrador';

    public const SLUG_USUARIOS = 'usuarios';

    /** @use HasFactory<RolUsuarioFactory> */
    use HasFactory;

    protected $table = 'rol_usuarios';

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
     * @return HasMany<UserAdmin, $this>
     */
    public function admins(): HasMany
    {
        return $this->hasMany(UserAdmin::class, 'rol_usuario_id');
    }
}
