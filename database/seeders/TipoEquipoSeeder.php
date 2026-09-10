<?php

namespace Database\Seeders;

use App\Models\TipoEquipo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TipoEquipoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            'Tipo carro',
            'Portátil',
            'Laptop',
            'De mano (Handheld)',
            'Fijo',
            'Móvil',
            'Compacto',
            'Abierto (Open MRI)',
            'Cerrado',
            'Alta gama',
            'Básico',
            'Veterinario',
        ];

        foreach ($tipos as $tipo) {
            TipoEquipo::query()->updateOrCreate(
                ['slug' => Str::slug($tipo)],
                [
                    'tipo' => $tipo,
                    'descripcion' => null,
                    'activo' => true,
                ],
            );
        }
    }
}
