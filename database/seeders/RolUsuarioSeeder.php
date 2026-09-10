<?php

namespace Database\Seeders;

use App\Models\RolUsuario;
use Illuminate\Database\Seeder;

class RolUsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RolUsuario::query()->updateOrCreate(
            ['slug' => 'super-usuario'],
            ['nombre' => 'Super usuario'],
        );

        RolUsuario::query()->updateOrCreate(
            ['slug' => 'administrador'],
            ['nombre' => 'Administrador'],
        );

        RolUsuario::query()->updateOrCreate(
            ['slug' => 'usuarios'],
            ['nombre' => 'Usuarios'],
        );
    }
}
