<?php

namespace App\Models;

use Database\Factories\SolicitudSoporteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $tipo_servicio_mantenimiento_id
 * @property int $modulo_id
 * @property int|null $equipo_modulo_id
 * @property string|null $equipo_nombre
 * @property string|null $marca
 * @property string $nombre
 * @property string|null $empresa
 * @property string $codigo_pais
 * @property string $telefono
 * @property string $correo
 * @property string|null $estado
 * @property float|null $latitud
 * @property float|null $longitud
 * @property string $descripcion
 * @property list<string>|null $imagenes
 * @property Carbon|null $atendida_at
 * @property string $estatus
 * @property string|null $observaciones
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read TipoServicioMantenimiento $servicio
 * @property-read Modulo $modalidad
 * @property-read EquipoModulo|null $equipo
 */
#[Fillable([
    'tipo_servicio_mantenimiento_id',
    'modulo_id',
    'equipo_modulo_id',
    'equipo_nombre',
    'marca',
    'nombre',
    'empresa',
    'codigo_pais',
    'telefono',
    'correo',
    'estado',
    'latitud',
    'longitud',
    'descripcion',
    'imagenes',
    'atendida_at',
    'estatus',
    'observaciones',
])]
class SolicitudSoporte extends Model
{
    public const DIRECTORIO_PUBLICO = 'Imagen/Soporte';

    /** @use HasFactory<SolicitudSoporteFactory> */
    use HasFactory;

    protected $table = 'solicitudes_soporte';

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'estatus' => 'en_espera',
    ];

    protected static function booted(): void
    {
        static::deleting(function (SolicitudSoporte $solicitud): void {
            $solicitud->eliminarImagenes();
        });
    }

    /**
     * Delete the photos stored with this support request.
     */
    public function eliminarImagenes(): void
    {
        $rutas = collect($this->imagenes ?? [])
            ->filter(fn (mixed $ruta): bool => is_string($ruta) && $ruta !== '')
            ->values()
            ->all();

        if ($rutas === []) {
            return;
        }

        $prefijo = self::DIRECTORIO_PUBLICO.'/';
        $enImagen = [];
        $anteriores = [];

        foreach ($rutas as $ruta) {
            if (str_starts_with($ruta, $prefijo)) {
                $enImagen[] = substr($ruta, strlen($prefijo));
            } else {
                $anteriores[] = $ruta;
            }
        }

        if ($enImagen !== []) {
            Storage::disk('soporte')->delete($enImagen);
        }

        if ($anteriores !== []) {
            Storage::disk('public')->delete($anteriores);
        }
    }

    /**
     * Public URLs for the photos attached to this request.
     *
     * @return list<string>
     */
    public function urlsImagenes(): array
    {
        return collect($this->imagenes ?? [])
            ->filter(fn (mixed $ruta): bool => is_string($ruta) && $ruta !== '')
            ->map(fn (string $ruta): string => str_starts_with($ruta, self::DIRECTORIO_PUBLICO.'/')
                ? '/'.$ruta
                : Storage::disk('public')->url($ruta))
            ->values()
            ->all();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitud' => 'float',
            'longitud' => 'float',
            'imagenes' => 'array',
            'atendida_at' => 'datetime',
        ];
    }

    /**
     * Maintenance service selected on the support form.
     *
     * @return BelongsTo<TipoServicioMantenimiento, $this>
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(TipoServicioMantenimiento::class, 'tipo_servicio_mantenimiento_id');
    }

    /**
     * Imaging modality selected on the support form.
     *
     * @return BelongsTo<Modulo, $this>
     */
    public function modalidad(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * Equipment or sub-equipment selected on the support form.
     *
     * @return BelongsTo<EquipoModulo, $this>
     */
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(EquipoModulo::class, 'equipo_modulo_id');
    }

    public function isNueva(): bool
    {
        return $this->estatus === 'en_espera'
            && $this->atendida_at === null
            && $this->created_at !== null
            && $this->created_at->gte(now()->subDay());
    }
}
