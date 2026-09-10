<?php

use App\Models\Disponibilidad;
use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\TipoEquipo;
use App\Models\UserAdmin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('maquinas');

    $this->seed([
        \Database\Seeders\StatusSeeder::class,
        \Database\Seeders\DisponibilidadSeeder::class,
        \Database\Seeders\TipoEquipoSeeder::class,
    ]);
});

test('guests cannot access the modelos de equipos admin page', function () {
    $this->get(route('admin.modelos-equipos'))
        ->assertRedirect(route('admin.login'));
});

test('admins can view the modelos de equipos registration page', function () {
    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create(['modulo' => 'Resonancia']);
    $fabricante = Fabricante::factory()->create(['nombre' => 'Siemens', 'activo' => true]);
    $disponibilidad = Disponibilidad::query()->where('nombre', 'Disponible')->firstOrFail();
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();

    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'disponibilidad_id' => $disponibilidad->id,
        'tipo_equipo_id' => $tipoEquipo->id,
        'modelo' => 'MAGNETOM Vida',
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.modelos-equipos'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Registro-equipos-modelos')
            ->has('modulos')
            ->has('fabricantes')
            ->has('tiposEquipos', 12)
            ->has('disponibilidades', 3)
            ->has('equipos', 1)
            ->where('equipos.0.modelo', 'MAGNETOM Vida')
            ->where('equipos.0.tipo_equipo.tipo', 'Tipo carro')
        );
});

test('admins can register an equipo modelo', function () {
    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create();
    $fabricante = Fabricante::factory()->create(['activo' => true]);
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.modelos-equipos.store'), [
            'modulo_id' => $modulo->id,
            'fabricante_id' => $fabricante->id,
            'modelo' => 'Acuson Sequoia',
            'descripcion_corta' => 'Ultrasonido de alto rendimiento',
            'modalidad' => 'Diagnóstico por imagen',
            'aplicaciones' => 'Hospitalario, ambulatorio y clínica especializada',
            'anio' => 2022,
            'tipo_equipo_id' => $tipoEquipo->id,
            'precio' => '125000.50',
            'activo' => '1',
            'imagen' => UploadedFile::fake()->image('equipo.png'),
        ])
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('success');

    $equipo = EquipoModulo::query()->where('modelo', 'Acuson Sequoia')->first();

    expect($equipo)->not->toBeNull()
        ->and($equipo->modulo_id)->toBe($modulo->id)
        ->and($equipo->fabricante_id)->toBe($fabricante->id)
        ->and($equipo->tipo_equipo_id)->toBe($tipoEquipo->id)
        ->and($equipo->estado)->toBeNull()
        ->and($equipo->disponibilidad_id)->toBeNull()
        ->and($equipo->modalidad)->toBe('Diagnóstico por imagen')
        ->and($equipo->aplicaciones)->toBe('Hospitalario, ambulatorio y clínica especializada')
        ->and($equipo->anio)->toBe(2022)
        ->and($equipo->activo)->toBeTrue()
        ->and($equipo->precio)->toBe('125000.50')
        ->and($equipo->imagen)->toStartWith('Imagen/Maquinas/')
        ->and($equipo->imagen)->toEndWith('.webp');

    Storage::disk('maquinas')->assertExists(basename($equipo->imagen));
});

test('equipo modelo registration validates required fields', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.modelos-equipos'))
        ->post(route('admin.modelos-equipos.store'), [])
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHasErrors([
            'modulo_id',
            'fabricante_id',
            'modelo',
            'modalidad',
            'aplicaciones',
            'tipo_equipo_id',
            'activo',
        ])
        ->assertSessionDoesntHaveErrors([
            'estado',
            'disponibilidad_id',
        ]);
});

test('equipo modelo description accepts up to 5000 characters', function () {
    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create();
    $fabricante = Fabricante::factory()->create(['activo' => true]);
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();
    $descripcion = str_repeat('a', 2500);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.modelos-equipos.store'), [
            'modulo_id' => $modulo->id,
            'fabricante_id' => $fabricante->id,
            'modelo' => 'Modelo con descripción larga',
            'descripcion_corta' => $descripcion,
            'modalidad' => 'Diagnóstico por imagen',
            'aplicaciones' => 'Hospitalario',
            'tipo_equipo_id' => $tipoEquipo->id,
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('success');

    expect(EquipoModulo::query()->where('modelo', 'Modelo con descripción larga')->value('descripcion_corta'))
        ->toBe($descripcion);
});

test('equipo modelo description rejects more than 5000 characters', function () {
    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create();
    $fabricante = Fabricante::factory()->create(['activo' => true]);
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.modelos-equipos'))
        ->post(route('admin.modelos-equipos.store'), [
            'modulo_id' => $modulo->id,
            'fabricante_id' => $fabricante->id,
            'modelo' => 'Modelo descripción excesiva',
            'descripcion_corta' => str_repeat('a', 5001),
            'modalidad' => 'Diagnóstico por imagen',
            'aplicaciones' => 'Hospitalario',
            'tipo_equipo_id' => $tipoEquipo->id,
            'activo' => '1',
        ])
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHasErrors([
            'descripcion_corta' => 'La descripción del equipo no debe superar los 5000 caracteres.',
        ]);
});

test('admins can toggle equipo modelo status', function () {
    $admin = UserAdmin::factory()->create();
    $equipo = EquipoModulo::factory()->create(['activo' => true]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.modelos-equipos.toggle-status', $equipo))
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('success');

    expect($equipo->fresh()->activo)->toBeFalse();
});

test('admins can delete an equipo modelo and its image', function () {
    $admin = UserAdmin::factory()->create();

    Storage::disk('maquinas')->put('equipo.webp', 'fake-image');

    $equipo = EquipoModulo::factory()->create([
        'imagen' => 'Imagen/Maquinas/equipo.webp',
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.modelos-equipos.destroy', $equipo))
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('success');

    expect(EquipoModulo::query()->find($equipo->id))->toBeNull();
    Storage::disk('maquinas')->assertMissing('equipo.webp');
});
