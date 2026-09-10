<?php

namespace App\Models;

use Database\Factories\StatusFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nombre'])]
class Status extends Model
{
    /** @use HasFactory<StatusFactory> */
    use HasFactory;

    protected $table = 'status';

    /**
     * @return HasMany<Modulo, $this>
     */
    public function modulos(): HasMany
    {
        return $this->hasMany(Modulo::class, 'estatus_id');
    }
}
