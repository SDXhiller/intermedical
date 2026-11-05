<?php

use App\Enums\ServicioIcono;
use App\Models\Correo;
use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Horario;
use App\Models\Modulo;
use App\Models\Servicio;
use App\Models\Status;
use App\Models\Telefono;
use App\Models\TipoServicioMantenimiento;
use Database\Seeders\StatusSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('search page is accessible', function () {
    $this->get(route('search.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Search')
            ->where('query', '')
            ->has('results', 0)
        );
});

test('search finds modalities equipment maintenance services and contacts', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);

    $fabricante = Fabricante::factory()->create([
        'nombre' => 'GE Healthcare',
        'activo' => true,
    ]);

    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'modelo' => 'Logiq E Portátil',
        'slug' => 'logiq-e-portatil',
        'activo' => true,
    ]);

    $tipoServicio = TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-preventivo')
        ->firstOrFail();

    $tipoServicio->update([
        'nombre' => 'Mantenimiento preventivo',
        'descripcion' => 'Revisiones programadas para conservar el equipo.',
        'activo' => true,
    ]);

    TipoServicioMantenimiento::query()
        ->where('slug', 'suministro-y-venta-de-refacciones')
        ->update([
            'nombre' => 'Servicio de suministro y venta de refacciones',
            'activo' => true,
        ]);

    $telefono = Telefono::factory()->create([
        'nombre' => 'Ventas corporativas',
        'numero' => '55 1234 5678',
        'tipo' => 'Ventas',
        'activo' => true,
    ]);

    Servicio::factory()->create([
        'tipo_servicio_mantenimiento_id' => $tipoServicio->id,
        'nombre' => 'Ventas telefónicas',
        'slug' => 'ventas-telefonicas',
        'icono' => ServicioIcono::Telefono,
        'telefono_id' => $telefono->id,
        'activo' => true,
    ]);

    $correo = Correo::factory()->create([
        'nombre' => 'Soporte técnico',
        'correo' => 'soporte@medical.test',
        'activo' => true,
    ]);

    Servicio::factory()->create([
        'tipo_servicio_mantenimiento_id' => $tipoServicio->id,
        'nombre' => 'Soporte por correo',
        'slug' => 'soporte-por-correo',
        'icono' => ServicioIcono::Correo,
        'correo_id' => $correo->id,
        'activo' => true,
    ]);

    $this->get(route('search.index', ['q' => 'Ultrasonido']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('query', 'Ultrasonido')
            ->where('results.0.tipo', 'modalidad')
            ->where('results.0.tipo_label', 'Modalidad')
            ->where('results.0.nombre', 'Ultrasonido')
            ->where('results.0.url', route('mantenimiento.soporte', ['modalidad' => 'ultrasonido']))
        );

    $this->get(route('search.index', ['q' => 'Logiq']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('query', 'Logiq')
            ->where('results.0.tipo', 'equipo')
            ->where('results.0.tipo_label', 'Equipo')
            ->where('results.0.nombre', 'Logiq E Portátil')
            ->where('results.0.url', route('modulos.show', 'logiq-e-portatil'))
        );

    $this->get(route('search.index', ['q' => 'preventivo']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('results.0.tipo', 'servicio')
            ->where('results.0.nombre', 'Mantenimiento preventivo')
            ->where('results.0.url', route('mantenimiento.soporte', ['servicio' => 'mantenimiento-preventivo']))
        );

    $this->get(route('search.index', ['q' => 'refacciones']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('results.0.tipo', 'servicio')
            ->where('results.0.url', route('refacciones'))
        );

    $this->get(route('search.index', ['q' => 'Ventas corporativas']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('results.0.tipo', 'telefono')
            ->where('results.0.tipo_label', 'Teléfono')
            ->where('results.0.url', route('contacto', ['tipo' => 'mantenimiento-preventivo']))
        );

    $this->get(route('search.index', ['q' => 'soporte@medical']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('results.0.tipo', 'correo')
            ->where('results.0.tipo_label', 'Correo')
            ->where('results.0.detalle', 'soporte@medical.test')
            ->where('results.0.url', route('contacto', ['tipo' => 'mantenimiento-preventivo']))
        );
});

test('search excludes horarios and unlinked contact records', function () {
    $tipoServicio = TipoServicioMantenimiento::query()
        ->where('slug', 'instalacion')
        ->firstOrFail();

    $tipoServicio->update(['activo' => true]);

    Horario::factory()->create([
        'dias' => 'Lunes a viernes',
        'activo' => true,
    ]);

    Telefono::factory()->create([
        'nombre' => 'Teléfono sin servicio',
        'numero' => '55 9999 0000',
        'tipo' => 'General',
        'activo' => true,
    ]);

    Correo::factory()->create([
        'nombre' => 'Correo sin servicio',
        'correo' => 'sin-servicio@medical.test',
        'activo' => true,
    ]);

    Servicio::factory()->create([
        'tipo_servicio_mantenimiento_id' => $tipoServicio->id,
        'nombre' => 'Servicio oculto',
        'slug' => 'servicio-oculto',
        'icono' => ServicioIcono::Correo,
        'activo' => false,
    ]);

    $this->get(route('search.index', ['q' => 'Lunes']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('results', 0));

    $this->get(route('search.index', ['q' => 'Teléfono sin servicio']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('results', 0));

    $this->get(route('search.index', ['q' => 'sin-servicio@medical']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('results', 0));
});

test('search returns empty results when nothing matches', function () {
    $this->get(route('search.index', ['q' => 'xyz-sin-resultados']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('query', 'xyz-sin-resultados')
            ->has('results', 0)
        );
});

test('search suggestions endpoint returns limited json results', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);

    EquipoModulo::factory()->count(10)->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Logiq E Portátil',
        'slug' => 'logiq-e-portatil',
        'activo' => true,
    ]);

    $this->getJson(route('search.suggest', ['q' => 'Logiq']))
        ->assertOk()
        ->assertJsonCount(8, 'suggestions')
        ->assertJsonPath('suggestions.0.tipo', 'equipo');

    $this->getJson(route('search.suggest', ['q' => 'a']))
        ->assertOk()
        ->assertJson(['suggestions' => []]);
});
