<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Status::query()->updateOrCreate(
            ['id' => 1],
            ['nombre' => 'Activo'],
        );

        Status::query()->updateOrCreate(
            ['id' => 2],
            ['nombre' => 'Inactivo'],
        );
    }
}
