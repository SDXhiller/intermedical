<?php

namespace Database\Seeders;

use App\Models\Disponibilidad;
use Illuminate\Database\Seeder;

class DisponibilidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Disponibilidad::query()->updateOrCreate(
            ['id' => 1],
            [
                'nombre' => 'Disponible',
                'color' => 'Verde',
            ],
        );

        Disponibilidad::query()->updateOrCreate(
            ['id' => 2],
            [
                'nombre' => 'Bajo pedido',
                'color' => 'Naranja',
            ],
        );

        Disponibilidad::query()->updateOrCreate(
            ['id' => 3],
            [
                'nombre' => 'Agotado',
                'color' => 'Rojo',
            ],
        );
    }
}
