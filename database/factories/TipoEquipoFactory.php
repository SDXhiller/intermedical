<?php

namespace Database\Factories;

use App\Models\TipoEquipo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TipoEquipo>
 */
class TipoEquipoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipo = fake()->unique()->words(2, true);

        return [
            'tipo' => Str::title($tipo),
            'slug' => Str::slug($tipo),
            'descripcion' => fake()->optional()->sentence(),
            'activo' => true,
        ];
    }
}
