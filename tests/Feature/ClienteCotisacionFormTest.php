<?php

use App\Models\ClienteCotisacion;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Status;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);
});

test('public quote form page is accessible', function () {
    $this->get(route('cliente-cotisacion.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cliente')
            ->where('equipo', null)
        );
});

test('public quote form page resolves equipment from slug query string', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create(['estatus_id' => $activo->id]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Ultrasonido GBP',
        'slug' => 'ultrasonido-gbp',
        'activo' => true,
    ]);

    $this->get(route('cliente-cotisacion.create', ['equipo' => $equipo->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cliente')
            ->where('equipo.id', $equipo->id)
            ->where('equipo.slug', 'ultrasonido-gbp')
            ->where('equipo.nombre', 'Ultrasonido GBP')
        );
});

test('public quote form stores cliente cotisacion records with equipment relation', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create(['estatus_id' => $activo->id]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'EPIQ Elite',
        'slug' => 'epiq-elite',
        'activo' => true,
    ]);

    $payload = [
        'equipo_modulo_id' => $equipo->id,
        'cliente' => 'Hospital Central',
        'calle' => 'Av. Reforma',
        'numero' => '100',
        'colonia' => 'Centro',
        'cp' => '06000',
        'ciudad' => 'Ciudad de México',
        'contacto' => 'Ing. Ana López',
        'area' => 'Ingeniería Clínica',
        'telefono' => '55 1234 5678',
        'correo' => 'ana.lopez@hospitalcentral.mx',
    ];

    $this->post(route('cliente-cotisacion.store'), $payload)
        ->assertRedirect(route('cliente-cotisacion.create', ['equipo' => $equipo->slug]))
        ->assertSessionHas('cotizacion_enviada', true)
        ->assertSessionHas('cotizacion_cliente', 'Hospital Central');

    $this->assertDatabaseHas('cliente_cotisacion', $payload);

    $cotizacion = ClienteCotisacion::query()->first();
    expect($cotizacion?->equipoModulo?->modelo)->toBe('EPIQ Elite');
});

test('public quote form without equipment redirects back to the form', function () {
    $this->post(route('cliente-cotisacion.store'), [
        'cliente' => 'Hospital Central',
        'calle' => 'Av. Reforma',
        'numero' => '100',
        'colonia' => 'Centro',
        'cp' => '06000',
        'ciudad' => 'Ciudad de México',
        'contacto' => 'Ing. Ana López',
        'area' => 'Ingeniería Clínica',
        'telefono' => '55 1234 5678',
        'correo' => 'ana.lopez@hospitalcentral.mx',
    ])
        ->assertRedirect(route('cliente-cotisacion.create'))
        ->assertSessionHas('cotizacion_enviada', true)
        ->assertSessionHas('cotizacion_cliente', 'Hospital Central');
});

test('public quote form validates required fields', function () {
    $this->post(route('cliente-cotisacion.store'), [])
        ->assertSessionHasErrors([
            'cliente',
            'calle',
            'numero',
            'colonia',
            'cp',
            'ciudad',
            'contacto',
            'area',
            'telefono',
            'correo',
        ]);

    expect(ClienteCotisacion::query()->count())->toBe(0);
});

test('public quote form stores optional coordinates when provided', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create(['estatus_id' => $activo->id]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'slug' => 'equipo-coords',
        'activo' => true,
    ]);

    $this->post(route('cliente-cotisacion.store'), [
        'equipo_modulo_id' => $equipo->id,
        'cliente' => 'Hospital Central',
        'calle' => 'Av. Reforma',
        'numero' => '100',
        'colonia' => 'Centro',
        'cp' => '06000',
        'ciudad' => 'Ciudad de México',
        'latitud' => 19.432608,
        'longitud' => -99.133209,
        'contacto' => 'Ing. Ana López',
        'area' => 'Ingeniería Clínica',
        'telefono' => '55 1234 5678',
        'correo' => 'ana.lopez@hospitalcentral.mx',
    ])->assertRedirect(route('cliente-cotisacion.create', ['equipo' => $equipo->slug]))
        ->assertSessionHas('cotizacion_enviada', true);

    expect((float) ClienteCotisacion::query()->value('latitud'))->toBe(19.432608)
        ->and((float) ClienteCotisacion::query()->value('longitud'))->toBe(-99.133209);
});

test('public quote form rejects inactive equipment ids', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create(['estatus_id' => $activo->id]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'activo' => false,
    ]);

    $this->post(route('cliente-cotisacion.store'), [
        'equipo_modulo_id' => $equipo->id,
        'cliente' => 'Hospital Central',
        'calle' => 'Av. Reforma',
        'numero' => '100',
        'colonia' => 'Centro',
        'cp' => '06000',
        'ciudad' => 'Ciudad de México',
        'contacto' => 'Ing. Ana López',
        'area' => 'Ingeniería Clínica',
        'telefono' => '55 1234 5678',
        'correo' => 'ana.lopez@hospitalcentral.mx',
    ])->assertSessionHasErrors('equipo_modulo_id');
});
