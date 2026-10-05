<?php

use App\Models\EquipoModulo;
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
        ->toContain('bg-neutral-900')
        ->toContain('shadow-none')
        ->toContain('hover:shadow-[0_10px_28px_rgba(255,255,255,0.16)]')
        ->not->toContain(' shadow-[0_10px_28px_rgba(255,255,255,0.16)]')
        ->not->toContain('bg-white ')
        ->not->toContain('bg-white"')
        ->toContain('lg:grid-cols-4')
        ->toContain('h-24')
        ->not->toContain('aspect-[4/3]')
        ->not->toContain('sm:flex-row')
        ->not->toContain('Biblioteca de equipos')
        ->not->toContain('>Biblioteca<');
});

test('guests can view every active equipment model in one list', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();

    $ultrasonido = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $rayos = Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);
    $oculto = Modulo::factory()->create([
        'modulo' => 'Oculto',
        'slug' => 'oculto',
        'estatus_id' => $inactivo->id,
    ]);
    $logiq = EquipoModulo::factory()->create([
        'modulo_id' => $ultrasonido->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);

    EquipoModulo::factory()->create([
        'modulo_id' => $rayos->id,
        'modelo' => 'Definium',
        'slug' => 'definium',
        'activo' => true,
    ]);
    EquipoModulo::factory()->create([
        'modulo_id' => $ultrasonido->id,
        'modelo' => 'Oculto',
        'slug' => 'oculto-equipo',
        'activo' => false,
    ]);
    EquipoModulo::factory()->create([
        'modulo_id' => $oculto->id,
        'modelo' => 'Fuera',
        'slug' => 'fuera',
        'activo' => true,
    ]);

    $this->get(route('biblioteca.equipos-disponibles'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Biblioteca/listaequiposjuntos')
            ->has('equipos', 2)
            ->where('equipos.0.name', 'Definium')
            ->where('equipos.0.category_name', 'Rayos X')
            ->where('equipos.1.name', 'LOGIQ E')
            ->where('equipos.1.category_name', 'Ultrasonido')
            ->where('equipos.1.brand', $logiq->fabricante->nombre)
        );
});

test('the available equipment page offers search suggestions and filters', function () {
    $page = file_get_contents(resource_path('js/pages/Biblioteca/listaequiposjuntos.tsx'));

    expect($page)
        ->toContain('Buscar por nombre, marca o modalidad')
        ->toContain('sugerencias-equipos')
        ->toContain('Todas las modalidades')
        ->toContain('Todas las marcas')
        ->toContain('No hay equipos con esa búsqueda.')
        ->toContain('Solicitar cotización')
        ->toContain('Aplicaciones:')
        ->toContain('clienteCotisacionCreate.url(');
});
