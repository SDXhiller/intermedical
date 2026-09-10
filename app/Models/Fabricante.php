<?php

namespace App\Models;

use Database\Factories\FabricanteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property string|null $logo
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nombre', 'logo', 'activo'])]
class Fabricante extends Model
{
    /** @use HasFactory<FabricanteFactory> */
    use HasFactory;

    protected $table = 'fabricantes';

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
     * @return HasMany<EquipoModulo, $this>
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(EquipoModulo::class, 'fabricante_id');
    }

    /**
     * Public logo URL for this manufacturer.
     */
    public function logoUrl(): ?string
    {
        if ($this->logo === null || $this->logo === '') {
            return null;
        }

        return '/'.ltrim($this->logo, '/');
    }

    /**
     * Active manufacturers formatted for the public brands carousel.
     *
     * @return list<array{id: int, name: string, image: string|null}>
     */
    public static function catalogItems(): array
    {
        return static::query()
            ->where('activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'logo'])
            ->map(fn (self $fabricante): array => [
                'id' => $fabricante->id,
                'name' => $fabricante->nombre,
                'image' => $fabricante->logoUrl(),
            ])
            ->all();
    }
}
