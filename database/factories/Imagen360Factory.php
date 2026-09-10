<?php

namespace Database\Factories;

use App\Models\EquipoModulo;
use App\Models\Imagen360;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Imagen360>
 */
class Imagen360Factory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'equipo_modulo_id' => EquipoModulo::factory(),
            'imagen' => 'Imagen/Maquinas/360/'.fake()->uuid().'.webp',
            'es_principal' => false,
            'orden' => 0,
            'titulo' => null,
        ];
    }

    public function principal(): static
    {
        return $this->state(fn (): array => [
            'es_principal' => true,
            'orden' => 0,
        ]);
    }
}
