<?php

namespace App\Models;

use Database\Factories\CotizacionRefaccionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $refaccion_id
 * @property int $modulo_id
 * @property string $cliente
 * @property string|null $direccion
 * @property string $contacto
 * @property string|null $area
 * @property string $telefono
 * @property string $correo
 * @property string $equipo
 * @property int|null $fabricante_id
 * @property string|null $marca
 * @property string $refaccion
 * @property string|null $numero_parte
 * @property string|null $descripcion
 * @property string|null $observaciones
 * @property string $estatus
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Modulo $modulo
 * @property-read Fabricante|null $fabricante
 * @property-read Refaccion|null $pieza
 */
class CotizacionRefaccion extends Model
{
    /** @use HasFactory<CotizacionRefaccionFactory> */
    use HasFactory;

    protected $table = 'tb_cotizaciones_refacciones';

    protected $fillable = [
        'refaccion_id',
        'modulo_id',
        'cliente',
        'direccion',
        'contacto',
        'area',
        'telefono',
        'correo',
        'equipo',
        'fabricante_id',
        'marca',
        'refaccion',
        'numero_parte',
        'descripcion',
        'observaciones',
        'estatus',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'refaccion_id' => 'integer',
            'modulo_id' => 'integer',
            'fabricante_id' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Refaccion, $this>
     */
    public function pieza(): BelongsTo
    {
        return $this->belongsTo(Refaccion::class, 'refaccion_id');
    }

    /**
     * @return BelongsTo<Modulo, $this>
     */
    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * @return BelongsTo<Fabricante, $this>
     */
    public function fabricante(): BelongsTo
    {
        return $this->belongsTo(Fabricante::class, 'fabricante_id');
    }

    /**
     * @return HasMany<CotizacionRefaccionImagen, $this>
     */
    public function imagenes(): HasMany
    {
        return $this->hasMany(CotizacionRefaccionImagen::class, 'cotizacion_id')
            ->orderBy('orden')
            ->orderBy('id');
    }

    /**
     * @return array{
     *     id: int,
     *     folio: string,
     *     fecha: string,
     *     cliente: string,
     *     contacto: string,
     *     direccion: string,
     *     area: string,
     *     telefono: string,
     *     correo: string,
     *     equipo: string,
     *     marca: string,
     *     modulo: string,
     *     refaccion: string,
     *     numero_parte: string,
     *     descripcion: string,
     *     observaciones: string,
     *     estado: string,
     *     imagenes: list<string>
     * }
     */
    public function toAdminPayload(): array
    {
        $this->loadMissing(['modulo', 'fabricante', 'imagenes']);

        return [
            'id' => $this->id,
            'folio' => 'COT-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT),
            'fecha' => $this->created_at?->toDateString() ?? '',
            'cliente' => $this->cliente,
            'contacto' => $this->contacto,
            'direccion' => $this->direccion ?? '',
            'area' => $this->area ?? '',
            'telefono' => $this->telefono,
            'correo' => $this->correo,
            'equipo' => $this->equipo,
            'marca' => $this->marca ?? $this->fabricante?->nombre ?? '',
            'modulo' => $this->modulo?->modulo ?? '',
            'refaccion' => $this->refaccion,
            'numero_parte' => $this->numero_parte ?? '',
            'descripcion' => $this->descripcion ?? '',
            'observaciones' => $this->observaciones ?? '',
            'estado' => $this->estatus,
            'imagenes' => $this->imagenes
                ->map(fn (CotizacionRefaccionImagen $imagen): string => $imagen->publicUrl())
                ->values()
                ->all(),
        ];
    }
}
