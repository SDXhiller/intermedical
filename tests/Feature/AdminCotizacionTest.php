<?php

use App\Models\ClienteCotisacion;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Status;
use App\Models\UserAdmin;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);
});

test('guests cannot access the cotizaciones admin page', function () {
    $this->get(route('admin.cotizaciones.index'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view submitted quote requests', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create(['estatus_id' => $activo->id]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Ultrasonido GBP',
        'slug' => 'ultrasonido-gbp',
        'activo' => true,
    ]);

    ClienteCotisacion::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'cliente' => 'Hospital Central',
        'contacto' => 'María López',
        'correo' => 'maria@hospital.test',
        'created_at' => now()->setMonth(8)->setYear(2026),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index', [
            'mes' => 8,
            'anio' => 2026,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cotizaciones/Cotizacionview')
            ->has('cotizaciones', 1)
            ->where('cotizaciones.0.cliente', 'Hospital Central')
            ->where('filtros.mes', 8)
            ->where('filtros.anio', 2026)
            ->where('resumen.total_mes', 1)
            ->where('resumen.mes_nombre', 'Agosto')
        );
});

test('quote timestamps are formatted in the application timezone', function () {
    config(['app.timezone' => 'America/Mexico_City']);

    $admin = UserAdmin::factory()->create();

    Carbon::setTestNow(Carbon::parse('2026-08-28 21:00:00', 'UTC'));

    ClienteCotisacion::factory()->create([
        'cliente' => 'Hospital Horario',
        'created_at' => now(),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index', [
            'mes' => 8,
            'anio' => 2026,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('cotizaciones.0.created_at_formatted', '28/08/2026 15:00')
        );

    Carbon::setTestNow();
});

test('admins can filter quote requests by client name', function () {
    $admin = UserAdmin::factory()->create();
    $fecha = now()->setMonth(8)->setYear(2026);

    ClienteCotisacion::factory()->create([
        'cliente' => 'Hospital Central',
        'created_at' => $fecha,
    ]);

    ClienteCotisacion::factory()->create([
        'cliente' => 'Clínica del Norte',
        'created_at' => $fecha,
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index', [
            'mes' => 8,
            'anio' => 2026,
            'buscar' => 'Central',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('cotizaciones', 1)
            ->where('cotizaciones.0.cliente', 'Hospital Central')
            ->where('resumen.total_mes', 2)
            ->where('resumen.total_filtrado', 1)
            ->where('filtros.buscar', 'Central')
        );
});

test('admins can delete a quote request', function () {
    $admin = UserAdmin::factory()->create();
    $cotizacion = ClienteCotisacion::factory()->create([
        'cliente' => 'Clínica Sims',
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.cotizaciones.destroy', $cotizacion))
        ->assertRedirect(route('admin.cotizaciones.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('cliente_cotisacion', [
        'id' => $cotizacion->id,
    ]);
});

test('guests cannot delete quote requests', function () {
    $cotizacion = ClienteCotisacion::factory()->create();

    $this->delete(route('admin.cotizaciones.destroy', $cotizacion))
        ->assertRedirect(route('admin.login'));

    $this->assertDatabaseHas('cliente_cotisacion', [
        'id' => $cotizacion->id,
    ]);
});

test('quotes received in the last 24 hours are marked as new', function () {
    $admin = UserAdmin::factory()->create();

    $this->travelTo(Carbon::parse('2026-09-10 16:50:00', 'America/Mexico_City'));

    ClienteCotisacion::factory()->create([
        'cliente' => 'Buenos Aires',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    ClienteCotisacion::factory()->create([
        'cliente' => 'Hospital Viejo',
        'created_at' => now()->subHours(25),
        'updated_at' => now()->subHours(25),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index', [
            'mes' => 9,
            'anio' => 2026,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cotizaciones/Cotizacionview')
            ->has('cotizaciones', 2)
            ->where('cotizaciones.0.cliente', 'Buenos Aires')
            ->where('cotizaciones.0.es_nueva', true)
            ->where('cotizaciones.1.cliente', 'Hospital Viejo')
            ->where('cotizaciones.1.es_nueva', false)
        );
});
