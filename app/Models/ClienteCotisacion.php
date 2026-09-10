<?php

namespace App\Models;

use Database\Factories\ClienteCotisacionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $equipo_modulo_id
 * @property string $cliente
 * @property string $calle
 * @property string $numero
 * @property string $colonia
 * @property string $cp
 * @property string $ciudad
 * @property string|null $latitud
 * @property string|null $longitud
 * @property string $contacto
 * @property string $area
 * @property string $telefono
 * @property string $correo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read EquipoModulo|null $equipoModulo
 */
#[Fillable([
    'equipo_modulo_id',
    'cliente',
    'calle',
    'numero',
    'colonia',
    'cp',
    'ciudad',
    'latitud',
    'longitud',
    'contacto',
    'area',
    'telefono',
    'correo',
])]
class ClienteCotisacion extends Model
{
    /** @use HasFactory<ClienteCotisacionFactory> */
    use HasFactory;

    protected $table = 'cliente_cotisacion';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
        ];
    }

    /**
     * @return BelongsTo<EquipoModulo, $this>
     */
    public function equipoModulo(): BelongsTo
    {
        return $this->belongsTo(EquipoModulo::class, 'equipo_modulo_id');
    }

    public function isNueva(): bool
    {
        return $this->created_at !== null
            && $this->created_at->gte(now()->subDay());
    }
}
