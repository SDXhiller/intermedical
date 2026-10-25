<?php

namespace Database\Factories;

use App\Models\CotizacionRefaccion;
use App\Models\Fabricante;
use App\Models\Modulo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CotizacionRefaccion>
 */
class CotizacionRefaccionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'refaccion_id' => null,
            'modulo_id' => Modulo::factory(),
            'cliente' => fake()->company(),
            'direccion' => fake()->address(),
            'contacto' => fake()->name(),
            'area' => 'Ingeniería biomédica',
            'telefono' => '771 123 4567',
            'correo' => fake()->unique()->companyEmail(),
            'equipo' => 'Equipo de rayos X',
            'fabricante_id' => Fabricante::factory(),
            'marca' => 'GE Healthcare',
            'refaccion' => 'Cable de conexión',
            'numero_parte' => 'GE-RX-005',
            'descripcion' => fake()->sentence(),
            'estatus' => 'pendiente',
        ];
    }
}
