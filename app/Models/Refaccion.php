<?php

namespace App\Models;

use Database\Factories\RefaccionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Refaccion extends Model
{
    /** @use HasFactory<RefaccionFactory> */
    use HasFactory;

    protected $table = 'tb_refacciones';

    protected $fillable = [
        'modulo_id',
        'nombre',
        'numero_parte',
        'fabricante_id',
        'categoria',
        'descripcion',
        'condicion',
        'disponibilidad',
        'especificaciones',
        'publicado',
    ];

    protected $casts = [
        'modulo_id' => 'integer',
        'fabricante_id' => 'integer',
        'especificaciones' => 'array',
        'publicado' => 'boolean',
    ];

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
     * @return HasMany<RefaccionImagen, $this>
     */
    public function imagenes(): HasMany
    {
        return $this->hasMany(RefaccionImagen::class, 'refaccion_id')
            ->orderByDesc('es_principal')
            ->orderBy('orden')
            ->orderBy('id');
    }

    /**
     * @return HasMany<CotizacionRefaccion, $this>
     */
    public function cotizaciones(): HasMany
    {
        return $this->hasMany(CotizacionRefaccion::class, 'refaccion_id');
    }

    /**
     * @return array{
     *     id: int,
     *     nombre: string,
     *     parte: string,
     *     marca: string,
     *     categoria: string,
     *     descripcion: string,
     *     imagen: string
     * }
     */
    public function toCatalogCard(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'parte' => $this->numero_parte ?? '',
            'marca' => $this->fabricante?->nombre ?? '',
            'categoria' => $this->categoria,
            'descripcion' => $this->descripcion ?? '',
            'imagen' => $this->imagenes->first()?->publicUrl() ?? '',
        ];
    }

    /**
     * @return array{
     *     id: int,
     *     nombre: string,
     *     parte: string,
     *     marca: string,
     *     categoria: string,
     *     descripcion: string,
     *     condicion: string,
     *     disponibilidad: string,
     *     modalidad: array{slug: string, nombre: string},
     *     imagenes: list<array{id: int, url: string, es_principal: bool}>
     * }
     */
    public function toDetailPayload(): array
    {
        $this->loadMissing(['imagenes', 'fabricante', 'modulo']);

        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'parte' => $this->numero_parte ?? '',
            'marca' => $this->fabricante?->nombre ?? '',
            'categoria' => $this->categoria,
            'descripcion' => $this->descripcion ?? '',
            'condicion' => $this->condicionLabel(),
            'disponibilidad' => $this->disponibilidadLabel(),
            'modalidad' => [
                'slug' => $this->modulo?->slug ?? '',
                'nombre' => $this->modulo?->modulo ?? '',
            ],
            'imagenes' => $this->imagenes
                ->map(fn (RefaccionImagen $imagen): array => [
                    'id' => $imagen->id,
                    'url' => $imagen->publicUrl(),
                    'es_principal' => $imagen->es_principal,
                ])
                ->values()
                ->all(),
        ];
    }

    public function condicionLabel(): string
    {
        return match ($this->condicion) {
            'nueva' => 'Nueva',
            'usada' => 'Usada',
            'reacondicionada' => 'Reacondicionada',
            default => $this->condicion,
        };
    }

    public function disponibilidadLabel(): string
    {
        return match ($this->disponibilidad) {
            'disponible' => 'Disponible',
            'bajo_pedido' => 'Bajo pedido',
            'consultar' => 'Consultar',
            default => $this->disponibilidad,
        };
    }
}
