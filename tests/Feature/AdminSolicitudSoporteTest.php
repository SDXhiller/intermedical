<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\SolicitudSoporte;
use App\Models\Status;
use App\Models\TipoServicioMantenimiento;
use App\Models\UserAdmin;
use Database\Seeders\StatusSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('guests cannot access the support requests admin page', function () {
    $this->get(route('admin.soporte.index'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view support requests with service modality and equipment', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create(['nombre' => 'GE']);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);
    $servicio = TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-correctivo')
        ->firstOrFail();

    SolicitudSoporte::factory()->conEquipo($equipo)->create([
        'tipo_servicio_mantenimiento_id' => $servicio->id,
        'created_at' => now()->setDate(2026, 9, 27),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index', [
            'mes' => 9,
            'anio' => 2026,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Servcios/Servcios_view_mail')
            ->has('solicitudes', 1)
            ->where('solicitudes.0.servicio.nombre', 'Mantenimiento correctivo')
            ->where('solicitudes.0.modalidad.nombre', 'Ultrasonido')
            ->where('solicitudes.0.equipo.nombre', 'LOGIQ E')
            ->where('solicitudes.0.equipo.marca', 'GE')
            ->where('filtros.mes', 9)
            ->where('filtros.anio', 2026)
            ->where('resumen.total_mes', 1)
            ->where('resumen.mes_nombre', 'Septiembre')
        );
});

test('admins can search support requests by equipment model', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'estatus_id' => $activo->id,
    ]);
    $visible = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'LOGIQ E',
    ]);
    $oculto = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Oculto X',
    ]);
    $servicio = TipoServicioMantenimiento::factory()->create();

    SolicitudSoporte::factory()->conEquipo($visible)->create([
        'tipo_servicio_mantenimiento_id' => $servicio->id,
        'created_at' => now(),
    ]);
    SolicitudSoporte::factory()->conEquipo($oculto)->create([
        'tipo_servicio_mantenimiento_id' => $servicio->id,
        'created_at' => now(),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index', [
            'buscar' => 'LOGIQ',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('solicitudes', 1)
            ->where('solicitudes.0.equipo.nombre', 'LOGIQ E')
            ->where('resumen.total_filtrado', 1)
        );
});

test('admins can mark a support request as attended and clear the new marker', function () {
    $admin = UserAdmin::factory()->create();
    $solicitud = SolicitudSoporte::factory()->create([
        'created_at' => now(),
    ]);

    expect($solicitud->isNueva())->toBeTrue();

    $solicitud->load('servicio');

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.soporte.atender', $solicitud))
        ->assertRedirect(route('admin.soporte.index'))
        ->assertSessionHas('solicitud_atendida', [
            'servicio' => $solicitud->servicio->nombre,
            'nombre' => $solicitud->nombre,
        ]);

    $solicitud->refresh();

    expect($solicitud->atendida_at)->not->toBeNull()
        ->and($solicitud->isNueva())->toBeFalse();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('solicitudes.0.atendida', true)
            ->where('solicitudes.0.es_nueva', false)
        );
});

test('guests cannot mark a support request as attended', function () {
    $solicitud = SolicitudSoporte::factory()->create();

    $this->patch(route('admin.soporte.atender', $solicitud))
        ->assertRedirect(route('admin.login'));

    expect($solicitud->fresh()->atendida_at)->toBeNull();
});

test('the support list labels each field and offers an attended action', function () {
    $page = file_get_contents(resource_path('js/pages/Servcios/Servcios_view_mail.tsx'));

    expect($page)
        ->toContain('titulo="Nombre"')
        ->toContain('titulo="Empresa"')
        ->toContain('titulo="Marca"')
        ->toContain('titulo="Modelo"')
        ->toContain('titulo="Servicio"')
        ->toContain('titulo="Modalidad"')
        ->toContain('Atendido')
        ->toContain('titulo="Teléfono"')
        ->toContain('titulo="Correo electrónico"')
        ->toContain('{solicitud.cliente.nombre}')
        ->toContain('{solicitud.servicio.nombre}')
        ->toContain('break-words whitespace-pre-wrap')
        ->toContain('Solicitud atendida')
        ->toContain('quedó atendida')
        ->toContain('Fotografía anterior')
        ->toContain('Fotografía siguiente')
        ->toContain('Acercar')
        ->toContain('Alejar')
        ->toContain('Mano para mover el zoom')
        ->not->toContain('target="_blank"');
});

test('admins can delete a support request and its uploaded images', function () {
    Storage::fake('public');
    $admin = UserAdmin::factory()->create();
    $primera = UploadedFile::fake()->image('falla-1.jpg')->store('soporte', 'public');
    $segunda = UploadedFile::fake()->image('falla-2.jpg')->store('soporte', 'public');
    $solicitud = SolicitudSoporte::factory()->create([
        'imagenes' => [$primera, $segunda],
    ]);

    Storage::disk('public')->assertExists([$primera, $segunda]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.soporte.destroy', $solicitud))
        ->assertRedirect(route('admin.soporte.index'));

    $this->assertModelMissing($solicitud);
    Storage::disk('public')->assertMissing([$primera, $segunda]);
});

test('equipment managers cannot access support requests', function () {
    $admin = UserAdmin::factory()->equipos()->create();
    $solicitud = SolicitudSoporte::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index'))
        ->assertForbidden();

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.soporte.atender', $solicitud))
        ->assertForbidden();
});

test('the support sidebar item is listed under cotizaciones', function () {
    $sidebar = file_get_contents(resource_path('js/components/admin-sidebar.tsx'));

    expect($sidebar)->not->toBeFalse();

    $cotizaciones = strpos($sidebar, "title: 'Cotizaciones'");
    $soporte = strpos($sidebar, "title: 'Soporte'");

    expect($cotizaciones)->not->toBeFalse()
        ->and($soporte)->toBeGreaterThan($cotizaciones);

    expect($sidebar)
        ->toContain('href: adminSoporte()')
        ->toContain("area: 'cotizaciones'")
        ->toContain("title: 'Módulos'");
});
