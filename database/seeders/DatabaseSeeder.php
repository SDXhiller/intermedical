<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolUsuarioSeeder::class,
            CargoSeeder::class,
            UserAdminSeeder::class,
            UserUsuarioSeeder::class,
            StatusSeeder::class,
            DisponibilidadSeeder::class,
            TipoEquipoSeeder::class,
        ]);
    }
}
