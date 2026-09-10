<?php

namespace Database\Factories;

use App\Models\Horario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Horario>
 */
class HorarioFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dias' => 'Lunes a viernes',
            'hora_inicio' => '09:00:00',
            'hora_fin' => '18:00:00',
            'activo' => true,
        ];
    }
}
