<?php

use App\Models\ClienteCotisacion;
use App\Models\CotizacionRefaccion;
use App\Models\CotizacionRefaccionImagen;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Status;
use App\Models\UserAdmin;
use Database\Seeders\StatusSeeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('guests cannot access the cotizaciones admin page', function () {
    $this->get(route('admin.cotizaciones.index'))
        ->assertRedirect(route('admin.login'));
});

test('admins with cotizaciones access can open the spare part quote registry', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Refacciones/cotizacion-listrado-view')
            ->has('cotizaciones', 0)
            ->where('puedeEliminar', true)
        );
});

test('the spare part quote registry lists requests sent from the public form', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Arcos C',
        'estatus_id' => $activo->id,
    ]);
    $cotizacion = CotizacionRefaccion::factory()->create([
        'modulo_id' => $modulo->id,
        'cliente' => 'Hospital de prueba',
        'contacto' => 'Ana López',
        'equipo' => 'Arco en C móvil',
        'marca' => 'SIEMENS',
        'refaccion' => 'Tubo de rayos X',
        'numero_parte' => 'SC-ARC-01',
        'descripcion' => 'Falla intermitente.',
        'estatus' => 'pendiente',
    ]);
    CotizacionRefaccionImagen::factory()->create([
        'cotizacion_id' => $cotizacion->id,
        'ruta' => 'Imagen/Cotizaciones/tubo.webp',
        'orden' => 0,
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('cotizaciones', 1)
            ->where('cotizaciones.0.folio', 'COT-'.str_pad((string) $cotizacion->id, 4, '0', STR_PAD_LEFT))
            ->where('cotizaciones.0.cliente', 'Hospital de prueba')
            ->where('cotizaciones.0.contacto', 'Ana López')
            ->where('cotizaciones.0.equipo', 'Arco en C móvil')
            ->where('cotizaciones.0.marca', 'SIEMENS')
            ->where('cotizaciones.0.modulo', 'Arcos C')
            ->where('cotizaciones.0.refaccion', 'Tubo de rayos X')
            ->where('cotizaciones.0.numero_parte', 'SC-ARC-01')
            ->where('cotizaciones.0.estado', 'pendiente')
            ->where('cotizaciones.0.observaciones', '')
            ->where('cotizaciones.0.imagenes.0', '/Imagen/Cotizaciones/tubo.webp')
        );
});

test('the full admin can delete a spare part quote and its photos', function () {
    Storage::fake('cotizaciones');
    Storage::disk('cotizaciones')->put('tubo.webp', 'imagen');

    $admin = UserAdmin::factory()->create();
    $cotizacion = CotizacionRefaccion::factory()->create();
    CotizacionRefaccionImagen::factory()->create([
        'cotizacion_id' => $cotizacion->id,
        'ruta' => 'Imagen/Cotizaciones/tubo.webp',
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.cotizaciones-refacciones.destroy', $cotizacion))
        ->assertRedirect(route('admin.cotizaciones-refacciones.index'));

    expect(CotizacionRefaccion::query()->whereKey($cotizacion->id)->exists())->toBeFalse()
        ->and(CotizacionRefaccionImagen::query()->where('cotizacion_id', $cotizacion->id)->exists())->toBeFalse();

    Storage::disk('cotizaciones')->assertMissing('tubo.webp');
});

test('sales and customer service can see spare part quotes but cannot delete them', function () {
    $cotizacion = CotizacionRefaccion::factory()->create();

    $this->actingAs(UserAdmin::factory()->gerenteVentas()->create(), 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('puedeEliminar', false)
        );

    $this->actingAs(UserAdmin::factory()->gerenteVentas()->create(), 'admin')
        ->delete(route('admin.cotizaciones-refacciones.destroy', $cotizacion))
        ->assertForbidden();

    $this->actingAs(UserAdmin::factory()->atencion()->create(), 'admin')
        ->delete(route('admin.cotizaciones-refacciones.destroy', $cotizacion))
        ->assertForbidden();

    expect(CotizacionRefaccion::query()->whereKey($cotizacion->id)->exists())->toBeTrue();
});

test('admins can save the follow-up status and internal notes of a spare part quote', function () {
    $admin = UserAdmin::factory()->create();
    $cotizacion = CotizacionRefaccion::factory()->create([
        'estatus' => 'pendiente',
    ]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.cotizaciones-refacciones.update', $cotizacion), [
            'estado' => 'cancelada',
            'observaciones' => 'El cliente pidió detener la solicitud.',
        ])
        ->assertRedirect(route('admin.cotizaciones-refacciones.index'));

    expect($cotizacion->fresh())
        ->estatus->toBe('cancelada')
        ->observaciones->toBe('El cliente pidió detener la solicitud.');
});

test('the spare part quote follow-up only accepts pending quoted or cancelled statuses', function () {
    $admin = UserAdmin::factory()->create();
    $cotizacion = CotizacionRefaccion::factory()->create([
        'estatus' => 'pendiente',
    ]);

    $this->actingAs($admin, 'admin')
        ->from(route('admin.cotizaciones-refacciones.index'))
        ->patch(route('admin.cotizaciones-refacciones.update', $cotizacion), [
            'estado' => 'en_revision',
            'observaciones' => 'Nota interna',
        ])
        ->assertRedirect(route('admin.cotizaciones-refacciones.index'))
        ->assertSessionHasErrors('estado');

    expect($cotizacion->fresh()->estatus)->toBe('pendiente');
});

test('admins outside cotizaciones cannot update a spare part quote follow-up', function () {
    $admin = UserAdmin::factory()->equipos()->create();
    $cotizacion = CotizacionRefaccion::factory()->create([
        'estatus' => 'pendiente',
    ]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.cotizaciones-refacciones.update', $cotizacion), [
            'estado' => 'cotizada',
            'observaciones' => 'Lista para enviar.',
        ])
        ->assertForbidden();

    expect($cotizacion->fresh()->estatus)->toBe('pendiente');
});

test('admins outside cotizaciones cannot open the spare part quote registry', function () {
    $admin = UserAdmin::factory()->equipos()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertForbidden();
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
            ->where('cotizaciones.0.estado', 'en_espera')
            ->where('cotizaciones.0.observaciones', '')
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

test('admins can save the follow-up status and internal notes of an equipment quote', function () {
    $admin = UserAdmin::factory()->create();
    $cotizacion = ClienteCotisacion::factory()->create([
        'estatus' => 'en_espera',
    ]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.cotizaciones.update', [
            'clienteCotisacion' => $cotizacion,
            'mes' => 8,
            'anio' => 2026,
        ]), [
            'estado' => 'atendida',
            'observaciones' => 'Se envió la propuesta al hospital.',
        ])
        ->assertRedirect(route('admin.cotizaciones.index', [
            'mes' => 8,
            'anio' => 2026,
        ]));

    expect($cotizacion->fresh())
        ->estatus->toBe('atendida')
        ->observaciones->toBe('Se envió la propuesta al hospital.');
});

test('the equipment quote follow-up only accepts waiting attended or cancelled statuses', function () {
    $admin = UserAdmin::factory()->create();
    $cotizacion = ClienteCotisacion::factory()->create([
        'estatus' => 'en_espera',
    ]);

    $this->actingAs($admin, 'admin')
        ->from(route('admin.cotizaciones.index'))
        ->patch(route('admin.cotizaciones.update', $cotizacion), [
            'estado' => 'pendiente',
            'observaciones' => 'Nota interna',
        ])
        ->assertRedirect(route('admin.cotizaciones.index'))
        ->assertSessionHasErrors('estado');

    expect($cotizacion->fresh()->estatus)->toBe('en_espera');
});

test('admins outside cotizaciones cannot update an equipment quote follow-up', function () {
    $admin = UserAdmin::factory()->equipos()->create();
    $cotizacion = ClienteCotisacion::factory()->create([
        'estatus' => 'en_espera',
    ]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.cotizaciones.update', $cotizacion), [
            'estado' => 'cancelada',
            'observaciones' => 'El cliente canceló.',
        ])
        ->assertForbidden();

    expect($cotizacion->fresh()->estatus)->toBe('en_espera');
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
