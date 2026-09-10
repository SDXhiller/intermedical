<?php

use App\Models\Correo;
use App\Models\Horario;
use App\Models\Telefono;
use App\Models\UserAdmin;
use Inertia\Testing\AssertableInertia as Assert;

test('admins can view datos de contacto page', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.datos-contacto.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Contacto/Cargar-datos-contactos')
            ->has('telefonos')
            ->has('correos')
            ->has('horarios')
        );
});

test('admins can store telefono correo and horario', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.datos-contacto.telefonos.store'), [
            'nombre' => 'Atención telefónica',
            'numero' => '+52 (55) 1234 5678',
            'tipo' => 'ventas',
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.datos-contacto.index'));

    $this->actingAs($admin, 'admin')
        ->post(route('admin.datos-contacto.correos.store'), [
            'nombre' => 'Ventas',
            'correo' => 'ventas@medicalimaging.com.mx',
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.datos-contacto.index'));

    $this->actingAs($admin, 'admin')
        ->post(route('admin.datos-contacto.horarios.store'), [
            'dias' => 'Lunes a viernes',
            'hora_inicio' => '09:00',
            'hora_fin' => '18:00',
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.datos-contacto.index'));

    expect(Telefono::query()->where('numero', '+52 (55) 1234 5678')->exists())->toBeTrue()
        ->and(Correo::query()->where('correo', 'ventas@medicalimaging.com.mx')->exists())->toBeTrue()
        ->and(Horario::query()->where('dias', 'Lunes a viernes')->exists())->toBeTrue();
});
