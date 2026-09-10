<?php

namespace Database\Factories;

use App\Models\Telefono;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Telefono>
 */
class TelefonoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->words(2, true),
            'numero' => '+52 (55) '.fake()->numerify('#### ####'),
            'tipo' => fake()->randomElement(['ventas', 'soporte', 'general']),
            'activo' => true,
        ];
    }
}
