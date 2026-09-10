<?php

namespace App\Models;

use Database\Factories\UserAdminFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $apellidos
 * @property string $username
 * @property string $email
 * @property int|null $cargo_id
 * @property int|null $rol_usuario_id
 * @property bool $activo
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Cargo|null $cargo
 * @property-read RolUsuario|null $rolUsuario
 * @property-read list<string> $permisos
 * @property-read bool $es_super_usuario
 */
#[Fillable(['name', 'apellidos', 'username', 'email', 'cargo_id', 'rol_usuario_id', 'activo', 'password'])]
#[Hidden(['password', 'remember_token'])]
class UserAdmin extends Authenticatable
{
    /** @use HasFactory<UserAdminFactory> */
    use HasFactory, Notifiable;

    protected $table = 'user_admins';

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'activo' => true,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'activo' => 'boolean',
        ];
    }

    public function isSuperUsuario(): bool
    {
        return $this->rolUsuario?->isSuperUsuario() ?? false;
    }

    public function canAccess(string $area): bool
    {
        return in_array($area, $this->allowedAreas(), true);
    }

    /**
     * @return list<string>
     */
    public function allowedAreas(): array
    {
        if ($this->isSuperUsuario() || $this->cargo?->isSuperUsuario()) {
            return Cargo::allAreas();
        }

        return $this->cargo?->areas() ?? [];
    }

    /**
     * @return BelongsTo<Cargo, $this>
     */
    public function cargo(): BelongsTo
    {
        return $this->belongsTo(Cargo::class, 'cargo_id');
    }

    /**
     * @return BelongsTo<RolUsuario, $this>
     */
    public function rolUsuario(): BelongsTo
    {
        return $this->belongsTo(RolUsuario::class, 'rol_usuario_id');
    }

    /**
     * @return Attribute<list<string>, never>
     */
    protected function permisos(): Attribute
    {
        return Attribute::get(fn (): array => $this->allowedAreas());
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function esSuperUsuario(): Attribute
    {
        return Attribute::get(fn (): bool => $this->isSuperUsuario());
    }
}
