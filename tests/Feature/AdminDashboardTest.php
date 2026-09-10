<?php

use App\Models\ClienteCotisacion;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Servicio;
use App\Models\UserAdmin;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);
    $this->travelTo(Carbon::parse('2026-09-10 12:00:00', 'America/Mexico_City'));
});

test('guests cannot access the admin dashboard', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view live dashboard counts for equipment models services and incoming quotes', function () {
    $admin = UserAdmin::factory()->create();

    Modulo::factory()->count(2)->create();
    EquipoModulo::factory()->count(3)->create();
    Servicio::factory()->count(2)->create();
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
            ->where('stats.0.value', 5)
            ->where('stats.1.key', 'modelos')
            ->where('stats.1.value', 3)
            ->where('stats.2.key', 'servicios')
            ->where('stats.2.value', 2)
            ->where('stats.3.key', 'cotizaciones')
            ->where('stats.3.value', 5)
            ->where('stats.3.status', 'Recibidas hoy')
            ->where('stats.3.trend', '8 esta semana')
            ->missing('stats.4')
            ->has('acciones', 4)
            ->where('resumenMensual.total', 8)
            ->where('resumenMensual.dias.9.dia', 10)
            ->where('resumenMensual.dias.9.total', 5)
            ->where('resumenMensual.dias.9.esHoy', true)
            ->where('resumenMensual.dias.8.total', 3)
            ->has('actividad')
        );
});

test('recent activity lists registered equipment models and services', function () {
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
    Servicio::factory()->create([
        'nombre' => 'Mantenimiento preventivo',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->has('actividad', 3)
            ->where('actividad.0.title', 'Se registró el servicio Mantenimiento preventivo')
            ->where('actividad.1.title', 'Se registró el modelo Acuson NX3')
            ->where('actividad.2.title', 'Se registró el equipo Ultrasonido')
        );
});

test('sales managers only see incoming quotes on the dashboard', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    Modulo::factory()->create();
    Servicio::factory()->create();
    ClienteCotisacion::factory()->count(2)->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->has('stats', 1)
            ->where('stats.0.key', 'cotizaciones')
            ->where('stats.0.value', 2)
            ->has('acciones', 1)
            ->where('acciones.0.key', 'cotizaciones')
            ->has('actividad', 0)
            ->where('resumenMensual.total', 2)
        );
});
