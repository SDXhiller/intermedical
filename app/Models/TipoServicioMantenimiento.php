<?php

namespace App\Models;

use Database\Factories\TipoServicioMantenimientoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property string $slug
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nombre', 'slug', 'activo'])]
class TipoServicioMantenimiento extends Model
{
    /** @use HasFactory<TipoServicioMantenimientoFactory> */
    use HasFactory;

    protected $table = 'tipo_servicio_mantenimiento';

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
}
