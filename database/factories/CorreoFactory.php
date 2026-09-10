<?php

namespace Database\Factories;

use App\Models\Correo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Correo>
 */
class CorreoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->words(2, true),
            'correo' => fake()->unique()->safeEmail(),
            'activo' => true,
        ];
    }
}
