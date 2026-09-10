<?php

namespace App\Models;

use Database\Factories\DisponibilidadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property string $color
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nombre', 'color'])]
class Disponibilidad extends Model
{
    /** @use HasFactory<DisponibilidadFactory> */
    use HasFactory;

    protected $table = 'disponibilidad';

    /**
     * @return HasMany<EquipoModulo, $this>
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(EquipoModulo::class, 'disponibilidad_id');
    }
}
