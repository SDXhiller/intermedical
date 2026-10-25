<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Mibrafaccion;
use App\Models\Modulo;
use App\Models\Refaccion;
use App\Models\RefaccionImagen;
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
            ->where('modalidades.0.slug', 'ultrasonido')
            ->where('modalidades.0.nombre', 'Ultrasonido')
        );
});

test('choosing a modality opens the pieces page with its models', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    Refaccion::factory()->create([
        'modulo_id' => $modulo->id,
        'nombre' => 'Transductor lineal',
        'numero_parte' => 'PN-TL-12L',
        'categoria' => 'Módulos',
        'publicado' => true,
    ]);
    Refaccion::factory()->unpublished()->create([
        'modulo_id' => $modulo->id,
        'nombre' => 'Pieza oculta',
    ]);

    $this->get(route('refacciones.piezas', ['modalidad' => 'ultrasonido']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Refacciones/PiesaRefraccion')
            ->where('modalidad.nombre', 'Ultrasonido')
            ->has('refacciones', 1)
            ->where('refacciones.0.nombre', 'Transductor lineal')
            ->where('refacciones.0.parte', 'PN-TL-12L')
            ->where('refacciones.0.categoria', 'Módulos')
        );
});

test('choosing a model lists spare parts with catalog fields', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create([
        'nombre' => 'GE',
    ]);
    $refaccion = Refaccion::factory()->create([
        'modulo_id' => $modulo->id,
        'nombre' => 'Transductor lineal',
        'numero_parte' => 'PN-TL-12L',
        'fabricante_id' => $fabricante->id,
        'categoria' => 'Módulos',
        'descripcion' => 'Transductor compatible con el equipo.',
        'publicado' => true,
    ]);
    RefaccionImagen::query()->create([
        'refaccion_id' => $refaccion->id,
        'ruta' => 'Imagen/Refacciones/transductor.webp',
        'orden' => 0,
        'es_principal' => true,
    ]);

    $this->get(route('refacciones.piezas', 'ultrasonido'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('modalidad.nombre', 'Ultrasonido')
            ->has('refacciones', 1)
            ->where('refacciones.0.nombre', 'Transductor lineal')
            ->where('refacciones.0.parte', 'PN-TL-12L')
            ->where('refacciones.0.marca', 'GE')
            ->where('refacciones.0.descripcion', 'Transductor compatible con el equipo.')
            ->where('refacciones.0.imagen', '/Imagen/Refacciones/transductor.webp')
        );
});

test('a published spare part opens its detail and quote pages', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create([
        'nombre' => 'GE',
    ]);
    $refaccion = Refaccion::factory()->create([
        'modulo_id' => $modulo->id,
        'nombre' => 'Transductor lineal',
        'numero_parte' => 'PN-TL-12L',
        'fabricante_id' => $fabricante->id,
        'categoria' => 'Módulos',
        'descripcion' => 'Transductor compatible con el equipo.',
        'condicion' => 'nueva',
        'disponibilidad' => 'disponible',
        'publicado' => true,
    ]);
    RefaccionImagen::query()->create([
        'refaccion_id' => $refaccion->id,
        'ruta' => 'Imagen/Refacciones/transductor.webp',
        'orden' => 0,
        'es_principal' => true,
    ]);
    $oculta = Refaccion::factory()->unpublished()->create([
        'modulo_id' => $modulo->id,
        'nombre' => 'Pieza oculta',
    ]);

    $this->get(route('refacciones.show', ['modalidad' => 'ultrasonido', 'refaccion' => $refaccion]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Refacciones/vistarefraccionview')
            ->where('refaccion.nombre', 'Transductor lineal')
            ->where('refaccion.parte', 'PN-TL-12L')
            ->where('refaccion.marca', 'GE')
            ->where('refaccion.categoria', 'Módulos')
            ->where('refaccion.condicion', 'Nueva')
            ->where('refaccion.disponibilidad', 'Disponible')
            ->where('refaccion.modalidad.nombre', 'Ultrasonido')
            ->where('refaccion.imagenes.0.url', '/Imagen/Refacciones/transductor.webp')
        );

    $this->get(route('refacciones.cotizacion', ['modalidad' => 'ultrasonido', 'refaccion' => $refaccion]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Refacciones/cotizacionesViewPiesasReffaciones')
            ->where('refaccion.nombre', 'Transductor lineal')
            ->where('refaccion.modalidad.slug', 'ultrasonido')
        );

    $this->get(route('refacciones.show', ['modalidad' => 'ultrasonido', 'refaccion' => $oculta]))
        ->assertNotFound();
    $this->get(route('refacciones.cotizacion', ['modalidad' => 'rayos-x', 'refaccion' => $refaccion]))
        ->assertNotFound();
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
    $landing = file_get_contents(resource_path('js/pages/Refacciones/ViewPiesasReffaciones.tsx'));
    $pieces = file_get_contents(resource_path('js/pages/Refacciones/PiesaRefraccion.tsx'));

    expect($landing)->not->toBeFalse();
    expect($pieces)->not->toBeFalse();
    expect($landing)
        ->toContain('CatalogImageCard')
        ->toContain('piezas.url(item.slug)')
        ->toContain('lg:grid-cols-4')
        ->toContain('bg-black')
        ->not->toContain('Equipo:');
    expect($pieces)
        ->toContain('{modalidad.nombre}')
        ->toContain('Encuentra piezas y módulos compatibles con este equipo.')
        ->toContain('Categorías')
        ->toContain('refacciones.map')
        ->toContain('Ver detalles')
        ->toContain('show.url({')
        ->toContain('cotizacion.url({')
        ->not->toContain('CatalogImageCard')
        ->not->toContain('Elija el modelo')
        ->not->toContain('Equipo:');
});

test('the mantenimiento refaccion card links to the refacciones page', function () {
    $page = file_get_contents(resource_path('js/pages/Mantenimiento/Mantenimiento.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('lg:col-span-3')
        ->toContain('refacciones.url()')
        ->toContain('Solicitar refacción');
});
