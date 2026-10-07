<?php

namespace Database\Factories;

use App\Models\EquipoModulo;
use App\Models\Mibrafaccion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mibrafaccion>
 */
class MibrafaccionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'equipo_modulo_id' => EquipoModulo::factory(),
            'modulo_id' => fn (array $attributes): int => (int) EquipoModulo::query()
                ->findOrFail($attributes['equipo_modulo_id'])
                ->modulo_id,
            'fabricante_id' => fn (array $attributes): int => (int) EquipoModulo::query()
                ->findOrFail($attributes['equipo_modulo_id'])
                ->fabricante_id,
            'refaccion_requerida' => fake()->randomElement([
                'Transductor lineal',
                'Tubo de rayos X',
                'Colimador',
                'Bomba de contraste',
                'Fuente de poder',
            ]),
            'numero_parte' => strtoupper(fake()->bothify('PN-####??')),
            'descripcion' => fake()->sentence(),
            'fotografias' => [],
            'activo' => true,
        ];
    }
}
