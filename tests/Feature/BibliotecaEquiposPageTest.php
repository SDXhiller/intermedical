<?php

use App\Models\Modulo;
use App\Models\Status;
use Database\Seeders\StatusSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('guests can view the biblioteca equipos page with active main modules', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();

    Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'descripcion' => 'Diagnóstico por ultrasonido',
        'imagen' => 'Imagen/Maquinas/ultrasonido.webp',
        'estatus_id' => $activo->id,
    ]);

    Modulo::factory()->create([
        'modulo' => 'Oculto',
        'slug' => 'oculto',
        'estatus_id' => $inactivo->id,
    ]);

    $this->get(route('biblioteca.equipos'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Biblioteca/ListaBibliotecaequipos')
            ->has('equipos', 1)
            ->where('equipos.0.name', 'Ultrasonido')
            ->where('equipos.0.slug', 'ultrasonido')
            ->where('equipos.0.image', '/Imagen/Maquinas/ultrasonido.webp')
            ->where('equipos.0.applications', 'Diagnóstico por ultrasonido')
        );
});

test('the modalidades page uses the modalidades hero and card copy', function () {
    $page = file_get_contents(resource_path('js/pages/Biblioteca/ListaBibliotecaequipos.tsx'));

    expect($page)
        ->toContain('Head title="Modalidades"')
        ->toContain("'/Imagen/Body/Body.png'")
        ->toContain('Equipos que cuidan más vidas')
        ->toContain('Ver soporte →')
        ->toContain('Ver equipos')
        ->toContain('soporte.url')
        ->toContain('rounded-full')
        ->toContain('bg-white')
        ->toContain('lg:grid-cols-4')
        ->toContain('h-28')
        ->not->toContain('aspect-[4/3]')
        ->not->toContain('sm:flex-row')
        ->not->toContain('Biblioteca de equipos')
        ->not->toContain('>Biblioteca<');
});
