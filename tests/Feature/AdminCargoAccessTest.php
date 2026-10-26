<?php

use App\Models\Cargo;
use App\Models\UserAdmin;
use Inertia\Testing\AssertableInertia as Assert;

test('sales managers can access quotes and spare-part quotes but not support or equipment', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.admin.permisos.0', Cargo::AREA_COTIZACIONES)
            ->where('auth.admin.permisos.1', Cargo::AREA_COTIZACIONES_REFACCIONES)
            ->has('auth.admin.permisos', 2)
        );

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index'))
        ->assertForbidden();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.equipos.create'))
        ->assertForbidden();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.usuarios.create'))
        ->assertForbidden();
});

test('equipment managers can access equipment catalog but not quotes or contact data', function () {
    $admin = UserAdmin::factory()->equipos()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.equipos.create'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.modelos-equipos'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.fabricantes.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index'))
        ->assertForbidden();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertForbidden();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index'))
        ->assertForbidden();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.datos-contacto.index'))
        ->assertForbidden();
});

test('customer service can access support and spare-part quotes but not equipment quotes', function () {
    $admin = UserAdmin::factory()->atencion()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.datos-contacto.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.servicios.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.equipos.create'))
        ->assertForbidden();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index'))
        ->assertForbidden();
});

test('super usuario cargo can access every admin area', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.usuarios.create'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.equipos.create'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones-refacciones.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index'))
        ->assertOk();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.servicios.index'))
        ->assertOk();
});
