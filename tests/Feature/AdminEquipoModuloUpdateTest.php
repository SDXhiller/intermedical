<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Imagen360;
use App\Models\Modulo;
use App\Models\TipoEquipo;
use App\Models\UserAdmin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('maquinas');
    Storage::fake('imagen_360');

    $this->seed([
        \Database\Seeders\StatusSeeder::class,
        \Database\Seeders\DisponibilidadSeeder::class,
        \Database\Seeders\TipoEquipoSeeder::class,
    ]);
});

test('admins can update an equipo modelo', function () {
    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create();
    $fabricante = Fabricante::factory()->create(['activo' => true]);
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();
    $equipo = EquipoModulo::factory()->create([
        'modelo' => 'Modelo original',
        'estado' => 'Nuevo',
        'activo' => true,
    ]);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.modelos-equipos.update', $equipo), [
            'modulo_id' => $modulo->id,
            'fabricante_id' => $fabricante->id,
            'modelo' => 'Modelo editado',
            'descripcion_corta' => 'Descripción actualizada',
            'estado' => 'Reacondicionado',
            'modalidad' => 'Diagnóstico por imagen',
            'aplicaciones' => 'Hospitalario',
            'anio' => 2024,
            'tipo_equipo_id' => $tipoEquipo->id,
            'disponibilidad_id' => 1,
            'precio' => '99999.00',
            'activo' => '0',
        ])
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('success');

    $equipo->refresh();

    expect($equipo->modelo)->toBe('Modelo editado')
        ->and($equipo->estado)->toBeNull()
        ->and($equipo->disponibilidad_id)->toBeNull()
        ->and($equipo->activo)->toBeFalse()
        ->and($equipo->precio)->toBe('99999.00')
        ->and($equipo->anio)->toBe(2024);
});

test('admins can replace equipo modelo image on update', function () {
    $admin = UserAdmin::factory()->create();
    Storage::disk('maquinas')->put('viejo.webp', 'old');

    $equipo = EquipoModulo::factory()->create([
        'imagen' => 'Imagen/Maquinas/viejo.webp',
    ]);
    Imagen360::factory()->principal()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/viejo.webp',
    ]);

    $modulo = Modulo::factory()->create();
    $fabricante = Fabricante::factory()->create(['activo' => true]);
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->put(route('admin.modelos-equipos.update', $equipo), [
            'modulo_id' => $modulo->id,
            'fabricante_id' => $fabricante->id,
            'modelo' => $equipo->modelo,
            'estado' => 'Nuevo',
            'modalidad' => 'Diagnóstico',
            'aplicaciones' => 'Clínica',
            'tipo_equipo_id' => $tipoEquipo->id,
            'disponibilidad_id' => 1,
            'activo' => '1',
            'imagen' => UploadedFile::fake()->image('nuevo.png'),
        ])
        ->assertRedirect(route('admin.modelos-equipos'));

    $equipo->refresh();

    expect($equipo->imagen)->toStartWith('Imagen/Maquinas/')
        ->and($equipo->imagen)->not->toBe('Imagen/Maquinas/viejo.webp')
        ->and($equipo->imagenes360()->where('es_principal', true)->first()?->imagen)->toBe($equipo->imagen)
        ->and($equipo->estado)->toBeNull()
        ->and($equipo->disponibilidad_id)->toBeNull();

    Storage::disk('maquinas')->assertMissing('viejo.webp');
    Storage::disk('maquinas')->assertExists(basename($equipo->imagen));
});
