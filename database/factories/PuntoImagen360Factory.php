<?php

namespace Database\Factories;

use App\Models\Imagen360;
use App\Models\PuntoImagen360;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PuntoImagen360>
 */
class PuntoImagen360Factory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'imagen_360_id' => Imagen360::factory(),
            'destino_imagen_360_id' => null,
            'pos_x' => fake()->randomFloat(2, 10, 90),
            'pos_y' => fake()->randomFloat(2, 10, 90),
            'etiqueta' => fake()->optional()->word(),
        ];
    }
}
