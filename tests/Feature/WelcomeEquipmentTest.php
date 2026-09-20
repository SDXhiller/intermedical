<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Status;
use Database\Seeders\StatusSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('home shows only active modules from the database', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();

    Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'imagen' => 'Imagen/Maquinas/ultrasonido.webp',
        'estatus_id' => $activo->id,
    ]);

    Modulo::factory()->create([
        'modulo' => 'Oculto',
        'slug' => 'oculto',
        'estatus_id' => $inactivo->id,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('equipmentItems', 1)
            ->where('equipmentItems.0.name', 'Ultrasonido')
            ->where('equipmentItems.0.slug', 'ultrasonido')
            ->where('equipmentItems.0.image', '/Imagen/Maquinas/ultrasonido.webp')
            ->where('equipmentItems.0.hasListing', true)
        );
});

test('home shares sub equipment items labeled with the modality and model', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $moduloOculto = Modulo::factory()->create([
        'modulo' => 'Oculto',
        'slug' => 'oculto',
        'estatus_id' => $inactivo->id,
    ]);

    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'imagen' => 'Imagen/Maquinas/logiq.webp',
        'activo' => true,
    ]);
    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Inactivo',
        'slug' => 'logiq-inactivo',
        'activo' => false,
    ]);
    EquipoModulo::factory()->create([
        'modulo_id' => $moduloOculto->id,
        'modelo' => 'Modelo oculto',
        'slug' => 'modelo-oculto',
        'activo' => true,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('subEquipmentItems', 1)
            ->where('subEquipmentItems.0.name', 'Ultrasonido/LOGIQ E')
            ->where('subEquipmentItems.0.slug', 'logiq-e')
            ->where('subEquipmentItems.0.image', '/Imagen/Maquinas/logiq.webp')
        );
});

test('clicking a module opens the database-backed listing page', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();

    Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'descripcion' => 'Equipos de rayos X médicos',
        'imagen' => 'Imagen/Maquinas/rayos.webp',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('equipos.index', 'rayos-x'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/ListadoView')
            ->where('category.slug', 'rayos-x')
            ->where('category.name', 'Rayos X')
            ->where('category.plural_title', 'Rayos X disponibles')
            ->where('category.description', 'Equipos de rayos X médicos')
            ->where('category.image', '/Imagen/Maquinas/rayos.webp')
            ->where('category.status', 'Activo')
            ->has('products', 0)
        );
});

test('ultrasonido listing stays empty until models are registered', function () {
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
            ->has('products', 0)
        );
});

test('inactive modules cannot open the listing page', function () {
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();

    Modulo::factory()->create([
        'slug' => 'modulo-inactivo',
        'estatus_id' => $inactivo->id,
    ]);

    $this->get(route('equipos.index', 'modulo-inactivo'))
        ->assertNotFound();
});

test('active database modules are visible on the public detail page', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();

    $modulo = Modulo::factory()->create([
        'modulo' => 'Equipo personalizado',
        'slug' => 'equipo-personalizado',
        'imagen' => 'Imagen/Maquinas/custom.webp',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('modulos.show', $modulo->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Modulosview')
            ->where('module.slug', 'equipo-personalizado')
            ->where('module.name', 'Equipo personalizado')
            ->where('module.image', '/Imagen/Maquinas/custom.webp')
        );
});

test('inactive database modules are not publicly visible', function () {
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();

    $modulo = Modulo::factory()->create([
        'slug' => 'modulo-inactivo',
        'estatus_id' => $inactivo->id,
    ]);

    $this->get(route('modulos.show', $modulo->slug))
        ->assertNotFound();
});

test('the home hero places the main banner in the imaging solutions panel', function () {
    $hero = file_get_contents(resource_path('js/pages/welcome.tsx'));

    expect($hero)->not->toBeFalse();
    expect($hero)
        ->toContain('Tecnología que impulsa la salud')
        ->toContain('Soluciones en Imagenología Médica')
        ->toContain('banner principal.jpg')
        ->toContain('Conocer nuestros servicios')
        ->toContain('grid-cols-4')
        ->toContain('blur-2xl')
        ->not->toContain('blur-3xl')
        ->not->toContain('¿Qué necesita hoy?');
});

test('the home page shows nosotros and mision spotlight cards below the hero', function () {
    $hero = file_get_contents(resource_path('js/pages/welcome.tsx'));

    expect($hero)
        ->toContain('NOSOTROS')
        ->toContain('NUESTRA MISIÓN')
        ->toContain('/Imagen/Body/Body.png')
        ->toContain('ChatGPT Image 20 sept 2026, 01_19_34 p.m..png')
        ->not->toContain('/Imagen/empresa/mision.jpg')
        ->toContain('Conocer más')
        ->toContain('Conocer nuestra visión')
        ->toContain('transparent_46%,black_74%')
        ->toContain('from-neutral-900')
        ->toContain('mt-[10px]')
        ->not->toContain('-mt-4')
        ->not->toContain('sm:-mt-6');
});

test('home shows only active manufacturers in the brands carousel', function () {
    Fabricante::factory()->create([
        'nombre' => 'Siemens Healthineers',
        'logo' => 'Imagen/Fabricantes/siemens.webp',
        'activo' => true,
    ]);

    Fabricante::factory()->create([
        'nombre' => 'Oculto',
        'logo' => 'Imagen/Fabricantes/oculto.webp',
        'activo' => false,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('manufacturerItems', 1)
            ->where('manufacturerItems.0.name', 'Siemens Healthineers')
            ->where('manufacturerItems.0.image', '/Imagen/Fabricantes/siemens.webp')
        );
});
