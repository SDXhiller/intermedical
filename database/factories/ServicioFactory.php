<?php

namespace Database\Factories;

use App\Enums\ServicioIcono;
use App\Models\Correo;
use App\Models\Horario;
use App\Models\Servicio;
use App\Models\Telefono;
use App\Models\TipoServicioMantenimiento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Servicio>
 */
class ServicioFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipo = TipoServicioMantenimiento::query()->inRandomOrder()->first()
            ?? TipoServicioMantenimiento::factory()->create();

        return [
            'tipo_servicio_mantenimiento_id' => $tipo->id,
            'nombre' => fake()->unique()->words(3, true),
            'slug' => fake()->unique()->slug(),
            'descripcion' => fake()->paragraph(),
            'icono' => fake()->randomElement(ServicioIcono::cases()),
            'telefono_id' => Telefono::factory(),
            'correo_id' => Correo::factory(),
            'horario_id' => Horario::factory(),
            'activo' => true,
        ];
    }
}
