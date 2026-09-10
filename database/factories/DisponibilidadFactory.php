<?php

namespace Database\Factories;

use App\Models\Disponibilidad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Disponibilidad>
 */
class DisponibilidadFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->randomElement(['Disponible', 'Bajo pedido', 'Agotado']),
            'color' => fake()->randomElement(['Verde', 'Naranja', 'Rojo']),
        ];
    }
}
