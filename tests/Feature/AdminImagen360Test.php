<?php

use App\Models\EquipoModulo;
use App\Models\Imagen360;
use App\Models\PuntoImagen360;
use App\Models\UserAdmin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('imagen_360');
    Storage::fake('maquinas');

    $this->seed([
        \Database\Seeders\StatusSeeder::class,
        \Database\Seeders\DisponibilidadSeeder::class,
        \Database\Seeders\TipoEquipoSeeder::class,
    ]);
});

test('storing an equipo with image also creates a principal imagen_360', function () {
    $admin = UserAdmin::factory()->create();
    $equipoPayload = EquipoModulo::factory()->make()->toArray();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.modelos-equipos.store'), [
            ...collect($equipoPayload)->only([
                'modulo_id',
                'fabricante_id',
                'modelo',
                'estado',
                'modalidad',
                'aplicaciones',
                'tipo_equipo_id',
                'disponibilidad_id',
                'activo',
            ])->all(),
            'activo' => '1',
            'imagen' => UploadedFile::fake()->image('principal.png'),
        ])
        ->assertRedirect(route('admin.modelos-equipos'));

    $equipo = EquipoModulo::query()->where('modelo', $equipoPayload['modelo'])->first();

    expect($equipo)->not->toBeNull()
        ->and($equipo->imagenes360()->count())->toBe(1)
        ->and($equipo->imagenes360()->first()->es_principal)->toBeTrue();
});

test('admins can upload additional 360 images and sync hotspots', function () {
    $admin = UserAdmin::factory()->create();
    $equipo = EquipoModulo::factory()->create();
    $principal = Imagen360::factory()->principal()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/principal.webp',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.modelos-equipos.imagenes-360.store', $equipo), [
            'imagen' => UploadedFile::fake()->image('vista.png'),
            'titulo' => 'Vista lateral',
        ])
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('success');

    $destino = $equipo->fresh()->imagenes360()->where('es_principal', false)->first();

    expect($destino)->not->toBeNull();

    $this->actingAs($admin, 'admin')
        ->put(route('admin.modelos-equipos.imagenes-360.sync-puntos', [$equipo, $principal]), [
            'puntos' => [
                [
                    'pos_x' => 35.5,
                    'pos_y' => 48.2,
                    'etiqueta' => 'Consola',
                    'destino_imagen_360_id' => $destino->id,
                ],
            ],
        ])
        ->assertRedirect(route('admin.modelos-equipos'));

    expect(PuntoImagen360::query()->where('imagen_360_id', $principal->id)->count())->toBe(1)
        ->and(PuntoImagen360::query()->where('imagen_360_id', $principal->id)->first()->destino_imagen_360_id)->toBe($destino->id);
});

test('uploading an extra view does not replace the principal image', function () {
    $admin = UserAdmin::factory()->create();
    $equipo = EquipoModulo::factory()->create([
        'imagen' => 'Imagen/Maquinas/principal.webp',
    ]);
    $principal = Imagen360::factory()->principal()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/principal.webp',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.modelos-equipos.imagenes-360.store', $equipo), [
            'imagen' => UploadedFile::fake()->image('otra-vista.png'),
            'titulo' => 'Lateral',
            'es_principal' => false,
        ])
        ->assertRedirect(route('admin.modelos-equipos'));

    $equipo->refresh();
    $principal->refresh();

    expect($equipo->imagen)->toBe('Imagen/Maquinas/principal.webp')
        ->and($principal->es_principal)->toBeTrue()
        ->and($equipo->imagenes360()->where('es_principal', false)->count())->toBe(1);
});

test('uploading an angle image can create and link a hotspot in one request', function () {
    $admin = UserAdmin::factory()->create();
    $equipo = EquipoModulo::factory()->create();
    $principal = Imagen360::factory()->principal()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/principal.webp',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.modelos-equipos.imagenes-360.store', $equipo), [
            'imagen' => UploadedFile::fake()->image('angulo.png'),
            'titulo' => 'Ángulo monitor',
            'origen_imagen_360_id' => $principal->id,
            'puntos' => [
                [
                    'pos_x' => 42,
                    'pos_y' => 55,
                    'etiqueta' => 'Monitor',
                    'asignar_destino' => true,
                ],
            ],
        ])
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('nueva_imagen_360_id');

    $destino = $equipo->fresh()->imagenes360()->where('es_principal', false)->first();
    $punto = PuntoImagen360::query()->where('imagen_360_id', $principal->id)->first();

    expect($destino)->not->toBeNull()
        ->and($punto)->not->toBeNull()
        ->and($punto->destino_imagen_360_id)->toBe($destino->id)
        ->and($punto->etiqueta)->toBe('Monitor');
});

test('admin modelos page backfills principal imagen_360 from equipo imagen', function () {
    $admin = UserAdmin::factory()->create();
    $equipo = EquipoModulo::factory()->create([
        'imagen' => 'Imagen/Maquinas/legacy.webp',
    ]);

    expect($equipo->imagenes360()->count())->toBe(0);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.modelos-equipos'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Registro-equipos-modelos')
            ->has('equipos.0.imagenes_360', 1)
            ->where('equipos.0.imagenes_360.0.es_principal', true)
            ->where('equipos.0.imagenes_360.0.imagen', 'Imagen/Maquinas/legacy.webp')
        );

    expect($equipo->fresh()->imagenes360()->count())->toBe(1);
});

test('admins can delete a 360 image and clear destination links', function () {
    $admin = UserAdmin::factory()->create();
    Storage::disk('imagen_360')->put('lateral.webp', 'fake');

    $equipo = EquipoModulo::factory()->create();
    $principal = Imagen360::factory()->principal()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/principal.webp',
    ]);
    $lateral = Imagen360::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/lateral.webp',
        'orden' => 1,
    ]);
    PuntoImagen360::factory()->create([
        'imagen_360_id' => $principal->id,
        'destino_imagen_360_id' => $lateral->id,
        'pos_x' => 40,
        'pos_y' => 50,
    ]);

    $this->actingAs($admin, 'admin')
        ->delete(route('admin.modelos-equipos.imagenes-360.destroy', [$equipo, $lateral]))
        ->assertRedirect(route('admin.modelos-equipos'))
        ->assertSessionHas('success');

    expect(Imagen360::query()->find($lateral->id))->toBeNull()
        ->and(PuntoImagen360::query()->where('imagen_360_id', $principal->id)->first()?->destino_imagen_360_id)->toBeNull();

    Storage::disk('imagen_360')->assertMissing('lateral.webp');
});

test('hotspots can reuse an existing 360 image as destination without uploading again', function () {
    $admin = UserAdmin::factory()->create();
    $equipo = EquipoModulo::factory()->create();
    $frontal = Imagen360::factory()->principal()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/frontal.webp',
        'orden' => 0,
    ]);
    $lateral = Imagen360::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/lateral.webp',
        'orden' => 1,
    ]);
    $trasera = Imagen360::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/trasera.webp',
        'orden' => 2,
    ]);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.modelos-equipos.imagenes-360.sync-puntos', [$equipo, $frontal]), [
            'puntos' => [
                [
                    'pos_x' => 20,
                    'pos_y' => 50,
                    'etiqueta' => 'Ir a lateral',
                    'destino_imagen_360_id' => $lateral->id,
                ],
                [
                    'pos_x' => 80,
                    'pos_y' => 50,
                    'etiqueta' => 'Otra vez lateral',
                    'destino_imagen_360_id' => $lateral->id,
                ],
                [
                    'pos_x' => 50,
                    'pos_y' => 80,
                    'etiqueta' => 'Ir a trasera',
                    'destino_imagen_360_id' => $trasera->id,
                ],
            ],
        ])
        ->assertRedirect(route('admin.modelos-equipos'));

    $puntos = PuntoImagen360::query()
        ->where('imagen_360_id', $frontal->id)
        ->orderBy('pos_x')
        ->get();

    expect($puntos)->toHaveCount(3)
        ->and($puntos[0]->destino_imagen_360_id)->toBe($lateral->id)
        ->and($puntos[1]->destino_imagen_360_id)->toBe($trasera->id)
        ->and($puntos[2]->destino_imagen_360_id)->toBe($lateral->id)
        ->and($equipo->fresh()->imagenes360()->count())->toBe(3);
});

test('public detail includes imagenes_360 and puntos', function () {
    $activo = \App\Models\Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = \App\Models\Modulo::factory()->create(['estatus_id' => $activo->id]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'activo' => true,
        'modelo' => 'Vista 360 Test',
    ]);
    $principal = Imagen360::factory()->principal()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/a.webp',
    ]);
    $destino = Imagen360::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'imagen' => 'Imagen/Maquinas/360/b.webp',
        'orden' => 1,
    ]);
    PuntoImagen360::factory()->create([
        'imagen_360_id' => $principal->id,
        'destino_imagen_360_id' => $destino->id,
        'pos_x' => 40,
        'pos_y' => 55,
        'etiqueta' => 'Monitor',
    ]);

    $this->get(route('modulos.show', $equipo->fresh()->publicSlug()))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modulos/Modulosview')
            ->has('module.imagenes_360', 2)
            ->where('module.imagenes_360.0.puntos.0.etiqueta', 'Monitor')
            ->where('module.imagenes_360.0.puntos.0.destino_id', $destino->id)
        );
});
