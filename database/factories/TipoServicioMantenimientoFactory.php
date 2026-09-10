<?php

namespace Database\Factories;

use App\Models\TipoServicioMantenimiento;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TipoServicioMantenimiento>
 */
class TipoServicioMantenimientoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nombre = fake()->unique()->sentence(3);

        return [
            'nombre' => $nombre,
            'slug' => Str::slug($nombre),
            'activo' => true,
        ];
    }
}
