<?php

namespace Database\Factories;

use App\Models\RolUsuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<RolUsuario>
 */
class RolUsuarioFactory extends Factory
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
            'slug' => 'super-usuario',
        ]);
    }

    public function administrador(): static
    {
        return $this->state(fn (): array => [
            'nombre' => 'Administrador',
            'slug' => 'administrador',
        ]);
    }

    public function usuarios(): static
    {
        return $this->state(fn (): array => [
            'nombre' => 'Usuarios',
            'slug' => 'usuarios',
        ]);
    }
}
