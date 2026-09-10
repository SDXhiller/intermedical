<?php

use App\Models\Cargo;
use App\Models\RolUsuario;
use App\Models\UserAdmin;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access the create user admin page', function () {
    $this->get(route('admin.usuarios.create'))
        ->assertRedirect(route('admin.login'));
});

test('guests cannot access the edit user admin page', function () {
    $this->get(route('admin.usuarios.edit'))
        ->assertRedirect(route('admin.login'));
});

test('guests cannot store an admin user', function () {
    $this->post(route('admin.usuarios.store'), [
        'nombre' => 'María',
        'apellidos' => 'Reyes',
        'nombre_usuario' => 'maria.reyes',
        'correo' => 'maria@example.com',
        'cargo_id' => gerenteVentasCargoId(),
        'rol_usuario_id' => administradorRoleId(),
        'password' => 'abcde123',
        'password_confirmation' => 'abcde123',
    ])->assertRedirect(route('admin.login'));

    expect(UserAdmin::query()->where('username', 'maria.reyes')->exists())->toBeFalse();
});

test('admins can view the create user page with assignable roles and cargos', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.usuarios.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Users/Rol-usuarios/Crear-usuarios')
            ->has('passwordRules')
            ->has('roles', 2)
            ->where('roles.0.nombre', 'Administrador')
            ->where('roles.1.nombre', 'Usuarios')
            ->has('cargos', 3)
            ->where('cargos.0.nombre', 'Gerente de ventas')
            ->where('cargos.1.nombre', 'Cargo de equipos')
            ->where('cargos.2.nombre', 'Servicio a atención')
            ->missing('admins')
        );
});

test('admins can view the edit user table', function () {
    $admin = UserAdmin::factory()->create([
        'apellidos' => null,
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.usuarios.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Users/Rol-usuarios/editar_ususarios')
            ->has('admins', 1)
            ->where('admins.0.username', $admin->username)
            ->where('admins.0.apellidos', null)
            ->where('admins.0.es_super_usuario', false)
            ->where('admins.0.cargo.nombre', 'Super usuario')
            ->has('roles', 2)
            ->has('cargos', 3)
        );
});

test('admins can create an admin user with a catalog role and cargo', function () {
    $admin = UserAdmin::factory()->create();
    $rolUsuarios = RolUsuario::query()->where('slug', 'usuarios')->firstOrFail();
    $cargoVentas = Cargo::query()->where('slug', Cargo::SLUG_GERENTE_VENTAS)->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.usuarios.store'), [
            'nombre' => 'María',
            'apellidos' => 'Reyes López',
            'nombre_usuario' => 'maria.reyes',
            'correo' => 'maria@example.com',
            'cargo_id' => $cargoVentas->id,
            'rol_usuario_id' => $rolUsuarios->id,
            'password' => 'abcde123',
            'password_confirmation' => 'abcde123',
        ])
        ->assertRedirect(route('admin.usuarios.create'))
        ->assertSessionHas('success');

    $created = UserAdmin::query()->where('username', 'maria.reyes')->first();

    expect($created)->not->toBeNull()
        ->and($created->name)->toBe('María')
        ->and($created->apellidos)->toBe('Reyes López')
        ->and($created->email)->toBe('maria@example.com')
        ->and($created->cargo_id)->toBe($cargoVentas->id)
        ->and($created->rol_usuario_id)->toBe($rolUsuarios->id)
        ->and($created->activo)->toBeTrue()
        ->and(Hash::check('abcde123', $created->password))->toBeTrue();
});

test('admin user creation cannot assign the super usuario role', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.usuarios.create'))
        ->post(route('admin.usuarios.store'), [
            'nombre' => 'María',
            'apellidos' => 'Reyes López',
            'nombre_usuario' => 'maria.reyes',
            'correo' => 'maria@example.com',
            'cargo_id' => gerenteVentasCargoId(),
            'rol_usuario_id' => superUsuarioRoleId(),
            'password' => 'abcde123',
            'password_confirmation' => 'abcde123',
        ])
        ->assertRedirect(route('admin.usuarios.create'))
        ->assertSessionHasErrors(['rol_usuario_id']);
});

test('admin user creation cannot assign the super usuario cargo', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.usuarios.create'))
        ->post(route('admin.usuarios.store'), [
            'nombre' => 'María',
            'apellidos' => 'Reyes López',
            'nombre_usuario' => 'maria.reyes',
            'correo' => 'maria@example.com',
            'cargo_id' => superUsuarioCargoId(),
            'rol_usuario_id' => administradorRoleId(),
            'password' => 'abcde123',
            'password_confirmation' => 'abcde123',
        ])
        ->assertRedirect(route('admin.usuarios.create'))
        ->assertSessionHasErrors(['cargo_id']);
});

test('admin user creation requires password confirmation', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.usuarios.create'))
        ->post(route('admin.usuarios.store'), [
            'nombre' => 'María',
            'apellidos' => 'Reyes López',
            'nombre_usuario' => 'maria.reyes',
            'correo' => 'maria@example.com',
            'cargo_id' => gerenteVentasCargoId(),
            'rol_usuario_id' => administradorRoleId(),
            'password' => 'abcde123',
            'password_confirmation' => 'otra-clave',
        ])
        ->assertRedirect(route('admin.usuarios.create'))
        ->assertSessionHasErrors(['password']);

    expect(UserAdmin::query()->where('username', 'maria.reyes')->exists())->toBeFalse();
});

test('admin user creation validates required fields', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.usuarios.create'))
        ->post(route('admin.usuarios.store'), [])
        ->assertRedirect(route('admin.usuarios.create'))
        ->assertSessionHasErrors([
            'nombre',
            'apellidos',
            'nombre_usuario',
            'correo',
            'cargo_id',
            'rol_usuario_id',
            'password',
        ]);
});

test('admins can update an admin user', function () {
    $admin = UserAdmin::factory()->create();
    $target = UserAdmin::factory()->create();
    $rolUsuarios = RolUsuario::query()->where('slug', 'usuarios')->firstOrFail();
    $cargoEquipos = Cargo::query()->where('slug', Cargo::SLUG_EQUIPOS)->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->put(route('admin.usuarios.update', $target), [
            'nombre' => 'Carlos',
            'apellidos' => 'Gómez',
            'nombre_usuario' => 'carlos.gomez',
            'correo' => 'carlos@example.com',
            'cargo_id' => $cargoEquipos->id,
            'rol_usuario_id' => $rolUsuarios->id,
            'activo' => '0',
        ])
        ->assertRedirect(route('admin.usuarios.edit'))
        ->assertSessionHas('success');

    $target->refresh();

    expect($target->name)->toBe('Carlos')
        ->and($target->apellidos)->toBe('Gómez')
        ->and($target->username)->toBe('carlos.gomez')
        ->and($target->email)->toBe('carlos@example.com')
        ->and($target->cargo_id)->toBe($cargoEquipos->id)
        ->and($target->rol_usuario_id)->toBe($rolUsuarios->id)
        ->and($target->activo)->toBeFalse();
});

test('admins can edit a super usuario but cannot change its role or cargo', function () {
    $admin = UserAdmin::factory()->create();
    $super = UserAdmin::factory()->create([
        'rol_usuario_id' => superUsuarioRoleId(),
        'cargo_id' => superUsuarioCargoId(),
        'apellidos' => null,
    ]);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.usuarios.update', $super), [
            'nombre' => 'Administrador',
            'apellidos' => null,
            'nombre_usuario' => 'admin.super',
            'correo' => 'super@example.com',
            'cargo_id' => gerenteVentasCargoId(),
            'rol_usuario_id' => administradorRoleId(),
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.usuarios.edit'))
        ->assertSessionHas('success');

    $super->refresh();

    expect($super->username)->toBe('admin.super')
        ->and($super->apellidos)->toBeNull()
        ->and($super->rol_usuario_id)->toBe(superUsuarioRoleId())
        ->and($super->cargo_id)->toBe(superUsuarioCargoId());
});

test('admins can delete an admin user', function () {
    $admin = UserAdmin::factory()->create();
    $target = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.usuarios.destroy', $target))
        ->assertRedirect(route('admin.usuarios.edit'))
        ->assertSessionHas('success');

    expect(UserAdmin::query()->whereKey($target->id)->exists())->toBeFalse();
});

test('admins cannot delete a super usuario', function () {
    $admin = UserAdmin::factory()->create();
    $super = UserAdmin::factory()->create([
        'rol_usuario_id' => superUsuarioRoleId(),
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.usuarios.destroy', $super))
        ->assertRedirect(route('admin.usuarios.edit'))
        ->assertSessionHas('error');

    expect(UserAdmin::query()->whereKey($super->id)->exists())->toBeTrue();
});

test('edit page marks the super usuario so it cannot show a delete action', function () {
    $admin = UserAdmin::factory()->create();
    $super = UserAdmin::factory()->create([
        'username' => 'admin',
        'rol_usuario_id' => superUsuarioRoleId(),
        'apellidos' => null,
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.usuarios.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Users/Rol-usuarios/editar_ususarios')
            ->has('admins', 2)
            ->where('admins.0.username', $super->username)
            ->where('admins.0.es_super_usuario', true)
            ->where('admins.0.apellidos', null)
            ->where('admins.1.es_super_usuario', false)
        );
});

function administradorRoleId(): int
{
    return (int) RolUsuario::query()->where('slug', 'administrador')->value('id');
}

function superUsuarioRoleId(): int
{
    return (int) RolUsuario::query()->where('slug', 'super-usuario')->value('id');
}

function superUsuarioCargoId(): int
{
    return (int) Cargo::query()->where('slug', Cargo::SLUG_SUPER_USUARIO)->value('id');
}

function gerenteVentasCargoId(): int
{
    return (int) Cargo::query()->where('slug', Cargo::SLUG_GERENTE_VENTAS)->value('id');
}
