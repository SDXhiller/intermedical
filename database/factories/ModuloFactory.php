<?php

namespace Database\Factories;

use App\Models\Modulo;
use App\Models\Status;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Modulo>
 */
class ModuloFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $modulo = fake()->unique()->words(2, true);

        return [
            'modulo' => Str::title($modulo),
            'slug' => Str::slug($modulo),
            'imagen' => null,
            'descripcion' => fake()->sentence(),
            'estatus_id' => Status::query()->value('id') ?? Status::factory(),
        ];
    }
}
