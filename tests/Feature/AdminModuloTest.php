<?php

use App\Models\Modulo;
use App\Models\Status;
use App\Models\UserAdmin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);
    Storage::fake('maquinas');
});

test('guests cannot access the equipos admin page', function () {
    $this->get(route('admin.equipos.create'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view the equipos registration page', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.equipos.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Registrar-modulo')
            ->has('statuses', 2)
            ->has('modulos')
        );
});

test('admins can register a modulo', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.equipos.store'), [
            'modulo' => 'Ultrasonido',
            'slug' => 'ultrasonido',
            'descripcion' => 'Equipos de ultrasonido médico',
            'estatus_id' => $activo->id,
            'imagen' => UploadedFile::fake()->image('ultrasonido.png'),
        ])
        ->assertRedirect(route('admin.equipos.create'));

    $modulo = Modulo::query()->where('slug', 'ultrasonido')->first();

    expect($modulo)->not->toBeNull()
        ->and($modulo->modulo)->toBe('Ultrasonido')
        ->and($modulo->estatus_id)->toBe($activo->id)
        ->and($modulo->imagen)->toStartWith('Imagen/Maquinas/')
        ->and($modulo->imagen)->toEndWith('.webp');

    Storage::disk('maquinas')->assertExists(basename($modulo->imagen));
});

test('modulo registration validates required fields', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.equipos.create'))
        ->post(route('admin.equipos.store'), [])
        ->assertRedirect(route('admin.equipos.create'))
        ->assertSessionHasErrors(['modulo', 'slug', 'estatus_id']);
});

test('admins can toggle a modulo status', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();
    $modulo = Modulo::factory()->create(['estatus_id' => $activo->id]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.equipos.toggle-status', $modulo))
        ->assertRedirect(route('admin.equipos.create'))
        ->assertSessionHas('success');

    expect($modulo->fresh()->estatus_id)->toBe($inactivo->id);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.equipos.toggle-status', $modulo))
        ->assertRedirect(route('admin.equipos.create'));

    expect($modulo->fresh()->estatus_id)->toBe($activo->id);
});

test('admins can delete a modulo and its image', function () {
    $admin = UserAdmin::factory()->create();
    $filename = 'modulo-test.webp';
    Storage::disk('maquinas')->put($filename, 'fake-webp');

    $modulo = Modulo::factory()->create([
        'imagen' => 'Imagen/Maquinas/'.$filename,
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.equipos.destroy', $modulo))
        ->assertRedirect(route('admin.equipos.create'))
        ->assertSessionHas('success');

    expect(Modulo::query()->find($modulo->id))->toBeNull();
    Storage::disk('maquinas')->assertMissing($filename);
});
