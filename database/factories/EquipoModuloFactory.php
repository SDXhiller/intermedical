<?php

namespace Database\Factories;

use App\Models\Disponibilidad;
use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\TipoEquipo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EquipoModulo>
 */
class EquipoModuloFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'modulo_id' => Modulo::factory(),
            'fabricante_id' => Fabricante::factory(),
            'modelo' => fake()->bothify('Model-###??'),
            'slug' => null,
            'imagen' => null,
            'descripcion_corta' => fake()->sentence(),
            'estado' => fake()->randomElement(['Nuevo', 'Reacondicionado', 'Demostración']),
            'modalidad' => 'Diagnóstico por imagen',
            'aplicaciones' => 'Hospitalario, ambulatorio y clínica especializada',
            'anio' => fake()->numberBetween(2018, (int) date('Y')),
            'tipo_equipo_id' => TipoEquipo::query()->value('id') ?? TipoEquipo::factory(),
            'disponibilidad_id' => Disponibilidad::query()->value('id') ?? Disponibilidad::factory(),
            'precio' => fake()->randomFloat(2, 1000, 250000),
            'activo' => true,
        ];
    }
}
