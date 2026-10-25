<?php

namespace Database\Factories;

use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Refaccion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Refaccion>
 */
class RefaccionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'modulo_id' => Modulo::factory(),
            'nombre' => fake()->randomElement([
                'Cable de conexión',
                'Fuente de alimentación',
                'Módulo de alta tensión',
                'Panel de control',
                'Tarjeta de control principal',
            ]),
            'numero_parte' => strtoupper(fake()->bothify('GE-RX-###')),
            'fabricante_id' => Fabricante::factory(),
            'categoria' => fake()->randomElement([
                'Cables',
                'Fuentes de poder',
                'Módulos',
                'Paneles',
                'Tarjetas electrónicas',
            ]),
            'descripcion' => fake()->sentence(),
            'condicion' => 'nueva',
            'disponibilidad' => 'disponible',
            'especificaciones' => null,
            'publicado' => true,
        ];
    }

    public function unpublished(): static
    {
        return $this->state([
            'publicado' => false,
        ]);
    }
}
