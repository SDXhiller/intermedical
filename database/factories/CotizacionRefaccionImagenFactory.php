<?php

namespace Database\Factories;

use App\Models\CotizacionRefaccion;
use App\Models\CotizacionRefaccionImagen;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CotizacionRefaccionImagen>
 */
class CotizacionRefaccionImagenFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cotizacion_id' => CotizacionRefaccion::factory(),
            'ruta' => 'Imagen/Cotizaciones/referencia.webp',
            'nombre_original' => 'referencia.png',
            'orden' => 0,
        ];
    }
}
