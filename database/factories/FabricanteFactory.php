<?php

namespace Database\Factories;

use App\Models\Fabricante;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Fabricante>
 */
class FabricanteFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->company(),
            'logo' => null,
            'activo' => true,
        ];
    }
}
