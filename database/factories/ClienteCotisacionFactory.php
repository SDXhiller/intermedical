<?php

namespace Database\Factories;

use App\Models\ClienteCotisacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClienteCotisacion>
 */
class ClienteCotisacionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'equipo_modulo_id' => null,
            'cliente' => fake()->company(),
            'calle' => fake()->streetName(),
            'numero' => (string) fake()->buildingNumber(),
            'colonia' => fake()->citySuffix().' '.fake()->lastName(),
            'cp' => fake()->numerify('#####'),
            'ciudad' => fake()->city(),
            'latitud' => null,
            'longitud' => null,
            'contacto' => fake()->name(),
            'area' => fake()->randomElement(['Compras', 'Ingeniería Clínica', 'Dirección', 'Mantenimiento']),
            'telefono' => fake()->numerify('55 #### ####'),
            'correo' => fake()->unique()->companyEmail(),
        ];
    }
}
