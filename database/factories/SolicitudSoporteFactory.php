<?php

namespace Database\Factories;

use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\SolicitudSoporte;
use App\Models\TipoServicioMantenimiento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitudSoporte>
 */
class SolicitudSoporteFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tipo_servicio_mantenimiento_id' => TipoServicioMantenimiento::factory(),
            'modulo_id' => Modulo::factory(),
            'equipo_modulo_id' => null,
            'equipo_nombre' => null,
            'marca' => null,
            'nombre' => fake()->name(),
            'empresa' => fake()->optional()->company(),
            'codigo_pais' => '+52',
            'telefono' => '5512345678',
            'correo' => fake()->safeEmail(),
            'estado' => null,
            'latitud' => null,
            'longitud' => null,
            'descripcion' => fake()->sentence(),
            'imagenes' => [],
            'atendida_at' => null,
        ];
    }

    /**
     * Attach a sub-equipment and keep the modality in sync with it.
     */
    public function conEquipo(?EquipoModulo $equipo = null): static
    {
        return $this->state(function () use ($equipo): array {
            $equipo ??= EquipoModulo::factory()->create();

            return [
                'modulo_id' => $equipo->modulo_id,
                'equipo_modulo_id' => $equipo->id,
            ];
        });
    }
}
