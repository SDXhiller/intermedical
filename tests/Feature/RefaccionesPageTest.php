<?php

use App\Models\EquipoModulo;
use App\Models\Mibrafaccion;
use App\Models\Modulo;
use App\Models\Status;
use Database\Seeders\StatusSeeder;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('guests can view the refacciones page', function () {
    $this->get(route('refacciones'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Refacciones/ViewPiesasReffaciones')
            ->has('modalidades')
            ->where('modalidad', null)
            ->where('modelo', null)
            ->where('refacciones', [])
        );
});

test('the mibrafacciones table stores the spare part catalog fields', function () {
    expect(Schema::hasTable('mibrafacciones'))->toBeTrue()
        ->and(Schema::hasColumns('mibrafacciones', [
            'id',
            'equipo_modulo_id',
            'fabricante_id',
            'modulo_id',
            'refaccion_requerida',
            'numero_parte',
            'descripcion',
            'fotografias',
            'activo',
        ]))->toBeTrue();
});

test('the refacciones landing page only lists modality cards', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);
    Mibrafaccion::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'refaccion_requerida' => 'Transductor lineal',
        'numero_parte' => 'PN-TL-12L',
    ]);

    $this->get(route('refacciones'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('modalidad', null)
            ->where('modelo', null)
            ->where('refacciones', [])
            ->where('modalidades.0.slug', 'ultrasonido')
            ->where('modalidades.0.nombre', 'Ultrasonido')
        );
});

test('choosing a modality lists equipment models before spare parts', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);
    Mibrafaccion::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'refaccion_requerida' => 'Transductor lineal',
    ]);

    $this->get(route('refacciones', ['modalidad' => 'ultrasonido']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('modalidad.slug', 'ultrasonido')
            ->where('modelo', null)
            ->where('refacciones', [])
            ->where('modelos.0.slug', 'logiq-e')
            ->where('modelos.0.nombre', 'LOGIQ E')
        );
});

test('choosing a model lists spare parts with catalog fields', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);
    Mibrafaccion::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'refaccion_requerida' => 'Transductor lineal',
        'numero_parte' => 'PN-TL-12L',
        'descripcion' => 'Transductor compatible con el equipo.',
        'fotografias' => ['Imagen/Maquinas/transductor.webp'],
    ]);

    $this->get(route('refacciones', [
        'modalidad' => 'ultrasonido',
        'modelo' => 'logiq-e',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('modelo.slug', 'logiq-e')
            ->has('refacciones', 1)
            ->where('refacciones.0.refaccion_requerida', 'Transductor lineal')
            ->where('refacciones.0.numero_parte', 'PN-TL-12L')
            ->where('refacciones.0.descripcion', 'Transductor compatible con el equipo.')
            ->where('refacciones.0.equipo', 'Ultrasonido')
            ->where('refacciones.0.marca', $equipo->fabricante->nombre)
            ->where('refacciones.0.modelo', 'LOGIQ E')
            ->where('refacciones.0.fotografias.0', '/Imagen/Maquinas/transductor.webp')
        );
});

test('a spare part keeps the brand and modality linked to its equipment model', function () {
    $equipo = EquipoModulo::factory()->create();

    $refaccion = Mibrafaccion::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'modulo_id' => 999999,
        'fabricante_id' => 999999,
    ]);

    expect($refaccion->modulo_id)->toBe($equipo->modulo_id)
        ->and($refaccion->fabricante_id)->toBe($equipo->fabricante_id)
        ->and($refaccion->equipoModulo->is($equipo))->toBeTrue()
        ->and($equipo->mibrafacciones()->whereKey($refaccion)->exists())->toBeTrue();
});

test('the refacciones page source uses modality cards and spare-part fields', function () {
    $page = file_get_contents(resource_path('js/pages/Refacciones/ViewPiesasReffaciones.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('CatalogImageCard')
        ->toContain('Equipo:')
        ->toContain('Marca:')
        ->toContain('Modelo:')
        ->toContain('Refacción requerida:')
        ->toContain('Número de parte / P.N.')
        ->toContain('Descripción o comentarios:')
        ->toContain('lg:grid-cols-4')
        ->toContain('bg-black')
        ->toContain('border-gray-500')
        ->toContain('CardHoverGlow')
        ->toContain('group-hover:bg-white/30')
        ->not->toContain('bg-neutral-100');
});

test('the mantenimiento refaccion card links to the refacciones page', function () {
    $page = file_get_contents(resource_path('js/pages/Mantenimiento/Mantenimiento.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('lg:col-span-3')
        ->toContain('refacciones.url()')
        ->toContain('Solicitar refacción');
});
