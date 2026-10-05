<?php

use App\Models\ClienteCotisacion;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\SolicitudSoporte;
use App\Models\UserAdmin;
use Database\Seeders\StatusSeeder;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
    $this->travelTo(Carbon::parse('2026-09-10 12:00:00', 'America/Mexico_City'));
});

test('guests cannot access the admin dashboard', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view live dashboard counts for equipment models support and incoming quotes', function () {
    $admin = UserAdmin::factory()->create();

    $modulos = Modulo::factory()->count(2)->create();
    EquipoModulo::factory()->count(3)->create();
    SolicitudSoporte::factory()->count(2)->create([
        'modulo_id' => $modulos->first()->id,
    ]);
    SolicitudSoporte::factory()->create([
        'modulo_id' => $modulos->first()->id,
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
        'atendida_at' => now()->subDay(),
    ]);
    SolicitudSoporte::factory()->create([
        'modulo_id' => $modulos->first()->id,
        'created_at' => now()->subMonth(),
        'updated_at' => now()->subMonth(),
    ]);
    ClienteCotisacion::factory()->count(5)->create();
    ClienteCotisacion::factory()->count(3)->create([
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->has('stats', 4)
            ->where('stats.0.key', 'equipos')
            ->where('stats.0.title', 'Módulos')
            ->where('stats.0.value', 5)
            ->where('stats.1.key', 'modelos')
            ->where('stats.1.title', 'Equipos')
            ->where('stats.1.value', 3)
            ->where('stats.2.key', 'soporte')
            ->where('stats.2.title', 'Soporte')
            ->where('stats.2.value', 4)
            ->where('stats.2.status', '3 pendientes')
            ->where('stats.2.trend', '3 nuevas este mes')
            ->where('stats.3.key', 'cotizaciones')
            ->where('stats.3.value', 5)
            ->where('stats.3.status', 'Recibidas hoy')
            ->where('stats.3.trend', '8 esta semana')
            ->missing('stats.4')
            ->has('acciones', 4)
            ->where('mantenimientoSitio.enabled', false)
            ->where('resumenMensual.total', 8)
            ->where('resumenMensual.dias.9.dia', 10)
            ->where('resumenMensual.dias.9.total', 5)
            ->where('resumenMensual.dias.9.esHoy', true)
            ->where('resumenMensual.dias.8.total', 3)
            ->has('actividad')
        );
});

test('recent activity lists registered equipment models and support requests', function () {
    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'created_at' => now()->subHours(3),
        'updated_at' => now()->subHours(3),
    ]);
    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Acuson NX3',
        'created_at' => now()->subHour(),
        'updated_at' => now()->subHour(),
    ]);
    SolicitudSoporte::factory()->create([
        'modulo_id' => $modulo->id,
        'nombre' => 'Ana López',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->has('actividad', 3)
            ->where('actividad.0.title', 'Se registró la solicitud de soporte de Ana López')
            ->where('actividad.1.title', 'Se registró el equipo Acuson NX3')
            ->where('actividad.2.title', 'Se registró el módulo Ultrasonido')
        );
});

test('sales managers see support requests and incoming quotes on the dashboard', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    Modulo::factory()->create();
    SolicitudSoporte::factory()->create([
        'nombre' => 'Ana López',
    ]);
    ClienteCotisacion::factory()->count(2)->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->has('stats', 2)
            ->where('stats.0.key', 'soporte')
            ->where('stats.0.value', 1)
            ->where('stats.1.key', 'cotizaciones')
            ->where('stats.1.value', 2)
            ->has('acciones', 2)
            ->where('acciones.0.key', 'soporte')
            ->where('acciones.1.key', 'cotizaciones')
            ->where('mantenimientoSitio', null)
            ->has('actividad', 1)
            ->where('actividad.0.title', 'Se registró la solicitud de soporte de Ana López')
            ->where('resumenMensual.total', 2)
        );
});
