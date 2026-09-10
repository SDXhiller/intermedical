<?php

namespace App\Models;

use Database\Factories\TipoEquipoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $tipo
 * @property string $slug
 * @property string|null $descripcion
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['tipo', 'slug', 'descripcion', 'activo'])]
class TipoEquipo extends Model
{
    /** @use HasFactory<TipoEquipoFactory> */
    use HasFactory;

    protected $table = 'tipos_equipos';

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
     * @return HasMany<EquipoModulo, $this>
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(EquipoModulo::class, 'tipo_equipo_id');
    }
}
