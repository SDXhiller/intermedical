<?php

namespace App\Models;

use Database\Factories\MibrafaccionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $equipo_modulo_id
 * @property int $fabricante_id
 * @property int $modulo_id
 * @property string $refaccion_requerida
 * @property string $numero_parte
 * @property string|null $descripcion
 * @property list<string>|null $fotografias
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read EquipoModulo $equipoModulo
 * @property-read Fabricante $fabricante
 * @property-read Modulo $modulo
 */
#[Fillable([
    'equipo_modulo_id',
    'fabricante_id',
    'modulo_id',
    'refaccion_requerida',
    'numero_parte',
    'descripcion',
    'fotografias',
    'activo',
])]
class Mibrafaccion extends Model
{
    /** @use HasFactory<MibrafaccionFactory> */
    use HasFactory;

    protected $table = 'mibrafacciones';

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'activo' => true,
    ];

    protected static function booted(): void
    {
        static::saving(function (Mibrafaccion $refaccion): void {
            $equipo = $refaccion->equipoModulo()->first()
                ?? EquipoModulo::query()->find($refaccion->equipo_modulo_id);

            if ($equipo === null) {
                return;
            }

            $refaccion->modulo_id = $equipo->modulo_id;
            $refaccion->fabricante_id = $equipo->fabricante_id;
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fotografias' => 'array',
            'activo' => 'boolean',
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
     * @return BelongsTo<Fabricante, $this>
     */
    public function fabricante(): BelongsTo
    {
        return $this->belongsTo(Fabricante::class, 'fabricante_id');
    }

    /**
     * @return BelongsTo<Modulo, $this>
     */
    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * @return list<string>
     */
    public function fotografiaUrls(): array
    {
        return collect($this->fotografias ?? [])
            ->filter(fn (mixed $path): bool => is_string($path) && $path !== '')
            ->map(function (string $path): string {
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    return $path;
                }

                return '/'.ltrim($path, '/');
            })
            ->values()
            ->all();
    }

    /**
     * @return array{
     *     id: int,
     *     refaccion_requerida: string,
     *     numero_parte: string,
     *     descripcion: string,
     *     equipo: string,
     *     marca: string,
     *     modelo: string,
     *     fotografias: list<string>,
     *     imagen: string
     * }
     */
    public function toPublicCard(): array
    {
        $fotografias = $this->fotografiaUrls();
        $imagen = $fotografias[0] ?? $this->equipoModulo?->imageUrl() ?? '';

        return [
            'id' => $this->id,
            'refaccion_requerida' => $this->refaccion_requerida,
            'numero_parte' => $this->numero_parte,
            'descripcion' => $this->descripcion ?? '',
            'equipo' => $this->modulo?->modulo ?? $this->equipoModulo?->modulo?->modulo ?? '',
            'marca' => $this->fabricante?->nombre ?? $this->equipoModulo?->fabricante?->nombre ?? '',
            'modelo' => $this->equipoModulo?->modelo ?? '',
            'fotografias' => $fotografias,
            'imagen' => $imagen,
        ];
    }
}
