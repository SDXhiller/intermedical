<?php

namespace Database\Factories;

use App\Models\Cargo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Cargo>
 */
class CargoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nombre = fake()->unique()->words(2, true);

        return [
            'nombre' => $nombre,
            'slug' => Str::slug($nombre).'-'.fake()->unique()->numerify('###'),
        ];
    }

    public function superUsuario(): static
    {
        return $this->state(fn (): array => [
            'nombre' => 'Super usuario',
            'slug' => Cargo::SLUG_SUPER_USUARIO,
        ]);
    }

    public function gerenteVentas(): static
    {
        return $this->state(fn (): array => [
            'nombre' => 'Ventas',
            'slug' => Cargo::SLUG_GERENTE_VENTAS,
        ]);
    }

    public function equipos(): static
    {
        return $this->state(fn (): array => [
            'nombre' => 'Carga de equipos',
            'slug' => Cargo::SLUG_EQUIPOS,
        ]);
    }

    public function atencion(): static
    {
        return $this->state(fn (): array => [
            'nombre' => 'Atención a cliente',
            'slug' => Cargo::SLUG_ATENCION,
        ]);
    }
}
