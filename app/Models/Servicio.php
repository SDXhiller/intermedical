<?php

namespace App\Models;

use App\Enums\ServicioIcono;
use Database\Factories\ServicioFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $tipo_servicio_mantenimiento_id
 * @property string $nombre
 * @property string $slug
 * @property string|null $descripcion
 * @property ServicioIcono $icono
 * @property int|null $telefono_id
 * @property int|null $correo_id
 * @property int|null $horario_id
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read TipoServicioMantenimiento|null $tipoServicioMantenimiento
 * @property-read Telefono|null $telefono
 * @property-read Correo|null $correo
 * @property-read Horario|null $horario
 */
#[Fillable([
    'tipo_servicio_mantenimiento_id',
    'nombre',
    'slug',
    'descripcion',
    'icono',
    'telefono_id',
    'correo_id',
    'horario_id',
    'activo',
])]
class Servicio extends Model
{
    /** @use HasFactory<ServicioFactory> */
    use HasFactory;

    protected $table = 'servicios';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'icono' => ServicioIcono::class,
        ];
    }

    /**
     * @return BelongsTo<TipoServicioMantenimiento, $this>
     */
    public function tipoServicioMantenimiento(): BelongsTo
    {
        return $this->belongsTo(TipoServicioMantenimiento::class, 'tipo_servicio_mantenimiento_id');
    }

    /**
     * @return BelongsTo<Telefono, $this>
     */
    public function telefono(): BelongsTo
    {
        return $this->belongsTo(Telefono::class, 'telefono_id');
    }

    /**
     * @return BelongsTo<Correo, $this>
     */
    public function correo(): BelongsTo
    {
        return $this->belongsTo(Correo::class, 'correo_id');
    }

    /**
     * @return BelongsTo<Horario, $this>
     */
    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class, 'horario_id');
    }
}
