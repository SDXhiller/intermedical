<?php

use App\Models\Fabricante;
use App\Models\UserAdmin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('fabricantes');
});

test('guests cannot access the fabricantes admin page', function () {
    $this->get(route('admin.fabricantes.index'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view the fabricante registration page', function () {
    $admin = UserAdmin::factory()->create();

    Fabricante::factory()->create([
        'nombre' => 'Siemens Healthineers',
        'activo' => true,
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.fabricantes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Crear-fabricante')
            ->has('fabricantes', 1)
            ->where('fabricantes.0.nombre', 'Siemens Healthineers')
        );
});

test('admins can register a fabricante', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.fabricantes.store'), [
            'nombre' => 'Philips',
            'activo' => '1',
            'logo' => UploadedFile::fake()->image('philips.png'),
        ])
        ->assertRedirect(route('admin.fabricantes.index'))
        ->assertSessionHas('success');

    $fabricante = Fabricante::query()->where('nombre', 'Philips')->first();

    expect($fabricante)->not->toBeNull()
        ->and($fabricante->activo)->toBeTrue()
        ->and($fabricante->logo)->toStartWith('Imagen/Fabricantes/')
        ->and($fabricante->logo)->toEndWith('.webp');

    Storage::disk('fabricantes')->assertExists(basename($fabricante->logo));
});

test('fabricante registration validates required fields', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.fabricantes.index'))
        ->post(route('admin.fabricantes.store'), [])
        ->assertRedirect(route('admin.fabricantes.index'))
        ->assertSessionHasErrors(['nombre', 'activo']);
});

test('admins can toggle fabricante status', function () {
    $admin = UserAdmin::factory()->create();
    $fabricante = Fabricante::factory()->create(['activo' => true]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.fabricantes.toggle-status', $fabricante))
        ->assertRedirect(route('admin.fabricantes.index'))
        ->assertSessionHas('success');

    expect($fabricante->fresh()->activo)->toBeFalse();
});

test('admins can delete a fabricante and its logo', function () {
    $admin = UserAdmin::factory()->create();

    Storage::disk('fabricantes')->put('logo.webp', 'fake-image');

    $fabricante = Fabricante::factory()->create([
        'logo' => 'Imagen/Fabricantes/logo.webp',
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.fabricantes.destroy', $fabricante))
        ->assertRedirect(route('admin.fabricantes.index'))
        ->assertSessionHas('success');

    expect(Fabricante::query()->find($fabricante->id))->toBeNull();
    Storage::disk('fabricantes')->assertMissing('logo.webp');
});
