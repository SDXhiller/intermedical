<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\TipoEquipo;
use App\Models\UserAdmin;
use App\Support\EquipoFieldFlags;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('maquinas');

    $this->seed([
        \Database\Seeders\StatusSeeder::class,
        \Database\Seeders\DisponibilidadSeeder::class,
        \Database\Seeders\TipoEquipoSeeder::class,
    ]);
});

test('disabled equipo fields are forced to null even when submitted', function () {
    expect(EquipoFieldFlags::ESTADO_ENABLED)->toBeFalse()
        ->and(EquipoFieldFlags::DISPONIBILIDAD_ENABLED)->toBeFalse();

    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create();
    $fabricante = Fabricante::factory()->create(['activo' => true]);
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.modelos-equipos.store'), [
            'modulo_id' => $modulo->id,
            'fabricante_id' => $fabricante->id,
            'modelo' => 'Modelo sin estado',
            'estado' => 'Nuevo',
            'modalidad' => 'Diagnóstico por imagen',
            'aplicaciones' => 'Hospitalario',
            'tipo_equipo_id' => $tipoEquipo->id,
            'disponibilidad_id' => 1,
            'activo' => '1',
            'imagen' => UploadedFile::fake()->image('equipo.png'),
        ])
        ->assertRedirect(route('admin.modelos-equipos'));

    $equipo = EquipoModulo::query()->where('modelo', 'Modelo sin estado')->first();

    expect($equipo)->not->toBeNull()
        ->and($equipo->estado)->toBeNull()
        ->and($equipo->disponibilidad_id)->toBeNull();
});
