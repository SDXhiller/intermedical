<?php

use App\Enums\ServicioIcono;
use App\Models\Correo;
use App\Models\Horario;
use App\Models\Servicio;
use App\Models\Telefono;
use App\Models\TipoServicioMantenimiento;
use App\Models\UserAdmin;
use Inertia\Testing\AssertableInertia as Assert;

test('admins can view servicios page', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.servicios.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Contacto/Cargar-contacto')
            ->has('servicios')
            ->has('tiposServicio')
            ->has('telefonos')
            ->has('correos')
            ->has('horarios')
        );
});

test('admins can store a servicio linked to contact data', function () {
    $admin = UserAdmin::factory()->create();
    $tipo = TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-preventivo')
        ->firstOrFail();
    $telefono = Telefono::factory()->create();
    $correo = Correo::factory()->create();
    $horario = Horario::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.servicios.store'), [
            'tipo_servicio_mantenimiento_id' => $tipo->id,
            'nombre' => 'Atención telefónica',
            'descripcion' => 'Servicio de revisión periódica',
            'icono' => ServicioIcono::Soporte->value,
            'telefono_id' => $telefono->id,
            'correo_id' => $correo->id,
            'horario_id' => $horario->id,
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.servicios.index'))
        ->assertSessionHas('success');

    $servicio = Servicio::query()
        ->where('tipo_servicio_mantenimiento_id', $tipo->id)
        ->first();

    expect($servicio)->not->toBeNull()
        ->and($servicio->nombre)->toBe('Atención telefónica')
        ->and($servicio->slug)->toBe('atencion-telefonica')
        ->and($servicio->icono)->toBe(ServicioIcono::Soporte)
        ->and($servicio->telefono_id)->toBe($telefono->id)
        ->and($servicio->correo_id)->toBe($correo->id)
        ->and($servicio->horario_id)->toBe($horario->id);
});

test('admins can store a servicio with whatsapp icon', function () {
    $admin = UserAdmin::factory()->create();
    $tipo = TipoServicioMantenimiento::query()->firstOrFail();
    $telefono = Telefono::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.servicios.store'), [
            'tipo_servicio_mantenimiento_id' => $tipo->id,
            'nombre' => 'WhatsApp ventas',
            'descripcion' => null,
            'icono' => ServicioIcono::Whatsapp->value,
            'telefono_id' => $telefono->id,
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.servicios.index'));

    expect(Servicio::query()->where('nombre', 'WhatsApp ventas')->first())
        ->not->toBeNull()
        ->icono->toBe(ServicioIcono::Whatsapp);
});

test('tipo_servicio_mantenimiento seeds the four support types', function () {
    $nombres = TipoServicioMantenimiento::query()
        ->orderBy('id')
        ->pluck('nombre')
        ->all();

    expect($nombres)->toBe([
        'Mantenimiento preventivo',
        'Mantenimiento correctivo',
        'Instalación y puesta en marcha',
        'Capacitación técnica',
    ]);
});
