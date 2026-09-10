<?php

use App\Models\Cargo;
use App\Models\UserAdmin;
use Inertia\Testing\AssertableInertia as Assert;

test('sales managers can access quotes but not equipment or users', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.admin.permisos.0', Cargo::AREA_COTIZACIONES)
            ->has('auth.admin.permisos', 1)
        );

    $this->actingAs($admin, 'admin')
        ->get(route('admin.cotizaciones.index'))
        ->assertOk();

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
        ->get(route('admin.datos-contacto.index'))
        ->assertForbidden();
});

test('attention service managers can access contact data and services but not equipment', function () {
    $admin = UserAdmin::factory()->atencion()->create();

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
        ->get(route('admin.servicios.index'))
        ->assertOk();
});
