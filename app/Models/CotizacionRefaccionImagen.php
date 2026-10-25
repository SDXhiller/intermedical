<?php

namespace App\Models;

use Database\Factories\CotizacionRefaccionImagenFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $cotizacion_id
 * @property string $ruta
 * @property string|null $nombre_original
 * @property int $orden
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read CotizacionRefaccion $cotizacion
 */
class CotizacionRefaccionImagen extends Model
{
    /** @use HasFactory<CotizacionRefaccionImagenFactory> */
    use HasFactory;

    protected $table = 'tb_cotizacion_refaccion_imagenes';

    protected $fillable = [
        'cotizacion_id',
        'ruta',
        'nombre_original',
        'orden',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cotizacion_id' => 'integer',
            'orden' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<CotizacionRefaccion, $this>
     */
    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(CotizacionRefaccion::class, 'cotizacion_id');
    }

    public function publicUrl(): string
    {
        if (str_starts_with($this->ruta, 'http://') || str_starts_with($this->ruta, 'https://')) {
            return $this->ruta;
        }

        return '/'.ltrim($this->ruta, '/');
    }
}
