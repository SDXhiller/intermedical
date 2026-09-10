<?php

namespace Database\Seeders;

use App\Models\Cargo;
use Illuminate\Database\Seeder;

class CargoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Cargo::query()->updateOrCreate(
            ['slug' => Cargo::SLUG_SUPER_USUARIO],
            ['nombre' => 'Super usuario'],
        );

        Cargo::query()->updateOrCreate(
            ['slug' => Cargo::SLUG_GERENTE_VENTAS],
            ['nombre' => 'Gerente de ventas'],
        );

        Cargo::query()->updateOrCreate(
            ['slug' => Cargo::SLUG_EQUIPOS],
            ['nombre' => 'Cargo de equipos'],
        );

        Cargo::query()->updateOrCreate(
            ['slug' => Cargo::SLUG_ATENCION],
            ['nombre' => 'Servicio a atención'],
        );
    }
}
