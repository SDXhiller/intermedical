<?php

namespace Database\Factories;

use App\Models\Cargo;
use App\Models\RolUsuario;
use App\Models\UserAdmin;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<UserAdmin>
 */
class UserAdminFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'cargo_id' => fn (): mixed => Cargo::query()->where('slug', Cargo::SLUG_SUPER_USUARIO)->value('id')
                ?? Cargo::factory()->superUsuario(),
            'rol_usuario_id' => fn (): mixed => RolUsuario::query()->where('slug', 'administrador')->value('id')
                ?? RolUsuario::factory(),
            'activo' => true,
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function gerenteVentas(): static
    {
        return $this->state(fn (): array => [
            'cargo_id' => Cargo::query()->where('slug', Cargo::SLUG_GERENTE_VENTAS)->value('id')
                ?? Cargo::factory()->gerenteVentas(),
        ]);
    }

    public function equipos(): static
    {
        return $this->state(fn (): array => [
            'cargo_id' => Cargo::query()->where('slug', Cargo::SLUG_EQUIPOS)->value('id')
                ?? Cargo::factory()->equipos(),
        ]);
    }

    public function atencion(): static
    {
        return $this->state(fn (): array => [
            'cargo_id' => Cargo::query()->where('slug', Cargo::SLUG_ATENCION)->value('id')
                ?? Cargo::factory()->atencion(),
        ]);
    }
}
