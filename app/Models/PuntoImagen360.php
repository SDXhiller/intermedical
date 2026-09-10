<?php

namespace App\Models;

use Database\Factories\PuntoImagen360Factory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $imagen_360_id
 * @property int|null $destino_imagen_360_id
 * @property string $pos_x
 * @property string $pos_y
 * @property string|null $etiqueta
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Imagen360 $imagen360
 * @property-read Imagen360|null $destino
 */
#[Fillable([
    'imagen_360_id',
    'destino_imagen_360_id',
    'pos_x',
    'pos_y',
    'etiqueta',
])]
class PuntoImagen360 extends Model
{
    /** @use HasFactory<PuntoImagen360Factory> */
    use HasFactory;

    protected $table = 'punto_imagen_360';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pos_x' => 'decimal:2',
            'pos_y' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Imagen360, $this>
     */
    public function imagen360(): BelongsTo
    {
        return $this->belongsTo(Imagen360::class, 'imagen_360_id');
    }

    /**
     * @return BelongsTo<Imagen360, $this>
     */
    public function destino(): BelongsTo
    {
        return $this->belongsTo(Imagen360::class, 'destino_imagen_360_id');
    }
}
