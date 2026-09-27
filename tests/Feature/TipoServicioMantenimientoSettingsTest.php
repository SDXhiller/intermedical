<?php

use App\Models\Servicio;
use App\Models\TipoServicioMantenimiento;
use App\Models\UserAdmin;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access configuration settings', function () {
    $this->get(route('admin.configuracion'))
        ->assertRedirect(route('admin.login'));
});

test('admins without configuration access cannot open settings', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.configuracion'))
        ->assertForbidden();
});

test('admins with configuration access can view tipo de servicio settings', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.configuracion'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/equipos-ajustes')
            ->has('tiposServicio')
        );
});

test('admins can store a tipo de servicio', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.configuracion.tipos-servicio.store'), [
            'nombre' => 'Calibración de equipos',
            'descripcion' => 'Ajuste técnico para conservar la precisión de los equipos.',
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.configuracion'))
        ->assertInertiaFlash('toast', [
            'type' => 'success',
            'message' => 'Calibración de equipos se registró correctamente.',
        ]);

    $tipo = TipoServicioMantenimiento::query()
        ->where('nombre', 'Calibración de equipos')
        ->first();

    expect($tipo)->not->toBeNull()
        ->and($tipo->slug)->toBe('calibracion-de-equipos')
        ->and($tipo->descripcion)->toBe('Ajuste técnico para conservar la precisión de los equipos.')
        ->and($tipo->activo)->toBeTrue();
});

test('admins cannot store a tipo de servicio without a card description', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.configuracion.tipos-servicio.store'), [
            'nombre' => 'Servicio sin descripción',
            'activo' => '1',
        ])
        ->assertSessionHasErrors('descripcion');
});

test('admins cannot store a duplicate tipo de servicio name', function () {
    $admin = UserAdmin::factory()->create();
    $tipo = TipoServicioMantenimiento::factory()->create([
        'nombre' => 'Servicio especial',
        'slug' => 'servicio-especial',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.configuracion.tipos-servicio.store'), [
            'nombre' => $tipo->nombre,
            'descripcion' => 'Texto de tarjeta',
            'activo' => '1',
        ])
        ->assertSessionHasErrors('nombre');
});

test('admins can update a tipo de servicio', function () {
    $admin = UserAdmin::factory()->create();
    $tipo = TipoServicioMantenimiento::factory()->create([
        'nombre' => 'Servicio original',
        'slug' => 'servicio-original',
        'activo' => true,
    ]);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.configuracion.tipos-servicio.update', $tipo), [
            'nombre' => 'Servicio actualizado',
            'descripcion' => 'Nueva descripción de la tarjeta.',
            'activo' => '0',
        ])
        ->assertRedirect(route('admin.configuracion'))
        ->assertInertiaFlash('toast', [
            'type' => 'success',
            'message' => 'Servicio actualizado se actualizó correctamente.',
        ]);

    $tipo->refresh();

    expect($tipo->nombre)->toBe('Servicio actualizado')
        ->and($tipo->slug)->toBe('servicio-actualizado')
        ->and($tipo->descripcion)->toBe('Nueva descripción de la tarjeta.')
        ->and($tipo->activo)->toBeFalse();
});

test('admins can toggle a tipo de servicio status', function () {
    $admin = UserAdmin::factory()->create();
    $tipo = TipoServicioMantenimiento::factory()->create([
        'nombre' => 'Diagnóstico clínico',
        'activo' => true,
    ]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.configuracion.tipos-servicio.toggle-status', $tipo))
        ->assertRedirect(route('admin.configuracion'))
        ->assertInertiaFlash('toast', [
            'type' => 'success',
            'message' => 'Diagnóstico clínico se marcó como Inactivo.',
        ]);

    expect($tipo->refresh()->activo)->toBeFalse();
});

test('admins can delete a tipo de servicio without related servicios', function () {
    $admin = UserAdmin::factory()->create();
    $tipo = TipoServicioMantenimiento::factory()->create([
        'nombre' => 'Servicio temporal',
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.configuracion.tipos-servicio.destroy', $tipo))
        ->assertRedirect(route('admin.configuracion'))
        ->assertInertiaFlash('toast', [
            'type' => 'success',
            'message' => 'Servicio temporal se eliminó correctamente.',
        ]);

    $this->assertModelMissing($tipo);
});

test('admins cannot delete a tipo de servicio with related servicios', function () {
    $admin = UserAdmin::factory()->create();
    $tipo = TipoServicioMantenimiento::factory()->create([
        'nombre' => 'Servicio con dependencias',
    ]);
    Servicio::factory()->create([
        'tipo_servicio_mantenimiento_id' => $tipo->id,
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.configuracion.tipos-servicio.destroy', $tipo))
        ->assertRedirect(route('admin.configuracion'))
        ->assertInertiaFlash('toast', [
            'type' => 'error',
            'message' => 'Servicio con dependencias no se puede eliminar porque tiene servicios asociados.',
        ]);

    $this->assertModelExists($tipo);
});

test('the configuration sidebar item points to equipos ajustes', function () {
    $sidebar = file_get_contents(resource_path('js/components/admin-sidebar.tsx'));

    expect($sidebar)->not->toBeFalse();
    expect($sidebar)
        ->toContain('Configuración')
        ->toContain('configuracion as adminConfiguracion')
        ->toContain('href: adminConfiguracion()')
        ->toContain('prefetch="hover"');
});

test('the tipos table actions are icon-only edit delete and toggle', function () {
    $page = file_get_contents(resource_path('js/pages/settings/equipos-ajustes.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('Descripción de la tarjeta')
        ->toContain('Pencil')
        ->toContain('Power')
        ->toContain('Trash2')
        ->toContain('Editar tipo de servicio')
        ->toContain('Desactivar tipo de servicio')
        ->toContain('Activar tipo de servicio')
        ->toContain('Eliminar tipo de servicio')
        ->not->toContain('flash?.success');
});
