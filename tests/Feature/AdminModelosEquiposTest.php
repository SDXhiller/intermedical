<?php

use App\Models\UserAdmin;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access the modelos de equipos admin page', function () {
    $this->get(route('admin.modelos-equipos'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view the modelos de equipos registration page', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.modelos-equipos'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Registro-equipos-modelos')
            ->has('modulos')
            ->has('fabricantes')
            ->has('tiposEquipos')
            ->has('disponibilidades')
            ->has('equipos')
        );
});
