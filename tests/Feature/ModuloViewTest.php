<?php

use App\Models\Modulo;
use App\Models\Status;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);
});

test('shows the ultrasonido listing page without products when none are registered', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();

    Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('equipos.index', 'ultrasonido'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/ListadoView')
            ->where('category.slug', 'ultrasonido')
            ->where('category.name', 'Ultrasonido')
            ->has('products', 0)
        );
});

test('redirects category ultrasonido detail to the listing', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();

    Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('modulos.show', 'ultrasonido'))
        ->assertRedirect(route('equipos.index', 'ultrasonido'));
});

test('shows a selected ultrasound product detail', function () {
    $this->get(route('modulos.show', 'acuson-sequoia'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Modulosview')
            ->where('module.slug', 'acuson-sequoia')
            ->where('module.name', 'ACUSON Sequoia')
            ->where('module.brand', 'Siemens Healthineers')
            ->where('module.category', 'ultrasonido')
        );
});

test('returns not found for an unknown module', function () {
    $this->get(route('modulos.show', 'equipo-inexistente'))
        ->assertNotFound();
});

test('returns not found for a category without an active module', function () {
    $this->get(route('equipos.index', 'rayos-x'))
        ->assertNotFound();
});
