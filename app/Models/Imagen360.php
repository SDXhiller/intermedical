<?php

namespace App\Models;

use Database\Factories\Imagen360Factory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $equipo_modulo_id
 * @property string $imagen
 * @property bool $es_principal
 * @property int $orden
 * @property string|null $titulo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read EquipoModulo $equipoModulo
 * @property-read \Illuminate\Database\Eloquent\Collection<int, PuntoImagen360> $puntos
 */
#[Fillable([
    'equipo_modulo_id',
    'imagen',
    'es_principal',
    'orden',
    'titulo',
])]
class Imagen360 extends Model
{
    /** @use HasFactory<Imagen360Factory> */
    use HasFactory;

    protected $table = 'imagen_360';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'es_principal' => 'boolean',
            'orden' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<EquipoModulo, $this>
     */
    public function equipoModulo(): BelongsTo
    {
        return $this->belongsTo(EquipoModulo::class, 'equipo_modulo_id');
    }

    /**
     * @return HasMany<PuntoImagen360, $this>
     */
    public function puntos(): HasMany
    {
        return $this->hasMany(PuntoImagen360::class, 'imagen_360_id');
    }

    /**
     * Public image URL.
     */
    public function imageUrl(): string
    {
        return '/'.ltrim($this->imagen, '/');
    }
}
