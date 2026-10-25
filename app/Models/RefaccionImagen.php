<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefaccionImagen extends Model
{
    protected $table = 'tb_refaccion_imagenes';

    protected $fillable = [
        'refaccion_id',
        'ruta',
        'orden',
        'es_principal',
    ];

    protected $casts = [
        'refaccion_id' => 'integer',
        'orden' => 'integer',
        'es_principal' => 'boolean',
    ];

    /**
     * @return BelongsTo<Refaccion, $this>
     */
    public function refaccion(): BelongsTo
    {
        return $this->belongsTo(Refaccion::class, 'refaccion_id');
    }

    public function publicUrl(): string
    {
        if (str_starts_with($this->ruta, 'http://') || str_starts_with($this->ruta, 'https://')) {
            return $this->ruta;
        }

        return '/'.ltrim($this->ruta, '/');
    }
}
