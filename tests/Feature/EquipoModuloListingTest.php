<?php

use App\Models\Disponibilidad;
use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Status;
use App\Models\TipoEquipo;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\StatusSeeder::class,
        \Database\Seeders\DisponibilidadSeeder::class,
        \Database\Seeders\TipoEquipoSeeder::class,
    ]);
});

test('listing shows equipos_modulos from the database for the category', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create([
        'nombre' => 'Siemens Healthineers',
        'activo' => true,
    ]);
    $tipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();
    $disponibilidad = Disponibilidad::query()->where('nombre', 'Disponible')->firstOrFail();

    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'tipo_equipo_id' => $tipo->id,
        'disponibilidad_id' => $disponibilidad->id,
        'modelo' => 'ACUSON Sequoia',
        'descripcion_corta' => 'Resumen técnico',
        'aplicaciones' => 'Cardiología, Vascular, Imagen general',
        'imagen' => 'Imagen/Maquinas/sequoia.webp',
        'activo' => true,
    ]);

    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'activo' => false,
        'modelo' => 'Modelo inactivo',
    ]);

    $this->get(route('equipos.index', 'ultrasonido'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/ListadoView')
            ->has('products', 1)
            ->where('products.0.slug', 'acuson-sequoia')
            ->where('products.0.name', 'ACUSON Sequoia')
            ->where('products.0.brand', 'Siemens Healthineers')
            ->where('products.0.type', 'Tipo carro')
            ->where('products.0.status', 'available')
            ->where('products.0.image', '/Imagen/Maquinas/sequoia.webp')
            ->where('products.0.applications', 'Cardiología, Vascular, Imagen general')
        );
});

test('equipment detail page resolves database equipos_modulos by public slug', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create(['nombre' => 'Philips', 'activo' => true]);
    $disponibilidad = Disponibilidad::query()->where('nombre', 'Disponible')->firstOrFail();
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'disponibilidad_id' => $disponibilidad->id,
        'modelo' => 'EPIQ Elite',
        'descripcion_corta' => 'Resumen del equipo EPIQ',
        'estado' => 'Reacondicionado',
        'modalidad' => 'Diagnóstico por imagen',
        'aplicaciones' => 'Cardiología, Pediatría, Vascular',
        'anio' => 2022,
        'activo' => true,
    ]);

    $this->get(route('modulos.show', $equipo->fresh()->publicSlug()))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Modulosview')
            ->where('module.slug', 'epiq-elite')
            ->where('module.name', 'EPIQ Elite')
            ->where('module.brand', 'Philips')
            ->where('module.estado', 'Reacondicionado')
            ->where('module.disponibilidad', 'Disponible')
            ->where('module.modalidad', 'Diagnóstico por imagen')
            ->where('module.aplicaciones', 'Cardiología, Pediatría, Vascular')
            ->where('module.anio', 2022)
            ->where('module.sku', 'MIG-EM-'.$equipo->id)
            ->where('module.category', 'ultrasonido')
            ->where('module.category_name', 'Ultrasonido')
            ->where('module.description', 'Resumen del equipo EPIQ')
        );
});

test('legacy em-id equipment urls redirect to the model name slug', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Ultra sonido GBP',
        'activo' => true,
    ]);

    $this->get(route('modulos.show', 'em-'.$equipo->id))
        ->assertRedirect(route('modulos.show', 'ultra-sonido-gbp'));
});
