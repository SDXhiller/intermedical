<?php

use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Refaccion;
use App\Models\Status;
use App\Models\UserAdmin;
use Database\Seeders\StatusSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('refacciones');

    $this->seed(StatusSeeder::class);
});

test('guests cannot open the spare part form', function () {
    $this->get(route('admin.refacciones.create'))
        ->assertRedirect(route('admin.login'));
});

test('admins can open the spare part form', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'estatus_id' => $activo->id,
    ]);
    $this->actingAs($admin, 'admin')
        ->get(route('admin.refacciones.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Refacciones/FormularioPiesasReffaciones')
            ->where('modelos.0.nombre', 'Rayos X')
            ->has('fabricantes')
        );
});

test('admins can store a published spare part with a photo', function () {
    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create([
        'nombre' => 'GE',
        'activo' => true,
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.refacciones.store'), [
            'modulo_id' => $modulo->id,
            'nombre' => 'Cable de conexión',
            'numero_parte' => 'GE-RX-005',
            'fabricante_id' => $fabricante->id,
            'categoria' => 'Cables',
            'descripcion' => 'Cable compatible.',
            'condicion' => 'nueva',
            'disponibilidad' => 'disponible',
            'imagenes' => [UploadedFile::fake()->image('cable.png')],
        ])
        ->assertRedirect(route('admin.refacciones.create'));

    $refaccion = Refaccion::query()->where('nombre', 'Cable de conexión')->first();

    expect($refaccion)->not->toBeNull()
        ->and($refaccion->modulo_id)->toBe($modulo->id)
        ->and($refaccion->fabricante_id)->toBe($fabricante->id)
        ->and($refaccion->publicado)->toBeTrue()
        ->and($refaccion->imagenes)->toHaveCount(1)
        ->and($refaccion->imagenes->first()->es_principal)->toBeTrue();

    $this->get(route('refacciones.piezas', 'rayos-x'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('modalidad.nombre', 'Rayos X')
            ->has('refacciones', 1)
            ->where('refacciones.0.nombre', 'Cable de conexión')
            ->where('refacciones.0.parte', 'GE-RX-005')
            ->where('refacciones.0.categoria', 'Cables')
        );
});
