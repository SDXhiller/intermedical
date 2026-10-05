<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\SolicitudSoporte;
use App\Models\Status;
use App\Models\TipoServicioMantenimiento;
use App\Models\UserAdmin;
use Database\Seeders\StatusSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('a support request stores the service, modality and equipment selected on the form', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create(['nombre' => 'GE']);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);
    $servicio = TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-correctivo')
        ->firstOrFail();

    $solicitud = SolicitudSoporte::factory()->conEquipo($equipo)->create([
        'tipo_servicio_mantenimiento_id' => $servicio->id,
    ]);

    $solicitud->load(['servicio', 'modalidad', 'equipo.fabricante']);

    expect($solicitud->servicio->is($servicio))->toBeTrue()
        ->and($solicitud->servicio->slug)->toBe('mantenimiento-correctivo')
        ->and($solicitud->modalidad->is($modulo))->toBeTrue()
        ->and($solicitud->modalidad->slug)->toBe('ultrasonido')
        ->and($solicitud->equipo?->is($equipo))->toBeTrue()
        ->and($solicitud->equipo?->modelo)->toBe('LOGIQ E')
        ->and($solicitud->equipo?->fabricante?->nombre)->toBe('GE');

    $this->assertModelExists($solicitud);

    $this->get(route('mantenimiento.soporte', [
        'servicio' => $solicitud->servicio->slug,
        'modalidad' => $solicitud->modalidad->slug,
        'equipo' => $solicitud->equipo?->slug,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('servicio.slug', 'mantenimiento-correctivo')
            ->where('modalidad.slug', 'ultrasonido')
            ->where('equipo.slug', 'logiq-e')
        );
});

test('a support request can be stored before a sub equipment is chosen', function () {
    $modulo = Modulo::factory()->create();
    $servicio = TipoServicioMantenimiento::factory()->create();

    $solicitud = SolicitudSoporte::factory()->create([
        'tipo_servicio_mantenimiento_id' => $servicio->id,
        'modulo_id' => $modulo->id,
        'equipo_modulo_id' => null,
    ]);

    expect($solicitud->equipo)->toBeNull()
        ->and($solicitud->modalidad->is($modulo))->toBeTrue()
        ->and($solicitud->servicio->is($servicio))->toBeTrue();

    $this->assertModelExists($solicitud);
});

test('a public support form stores the request for the admin panel', function () {
    Storage::fake('public');
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create(['nombre' => 'GE']);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);
    $admin = UserAdmin::factory()->create();

    $this->post(route('mantenimiento.soporte.store'), [
        'servicio' => 'mantenimiento-correctivo',
        'modalidad' => 'ultrasonido',
        'equipo' => 'logiq-e',
        'nombre' => 'Ana Ruiz',
        'empresa' => 'Clinica Norte',
        'codigo_pais' => '+52',
        'telefono' => '5512345678',
        'correo' => 'ana@ejemplo.com',
        'descripcion' => 'El equipo no enciende.',
        'imagenes' => [
            UploadedFile::fake()->image('falla-1.jpg'),
            UploadedFile::fake()->image('falla-2.jpg'),
            UploadedFile::fake()->image('falla-3.jpg'),
            UploadedFile::fake()->image('falla-4.jpg'),
            UploadedFile::fake()->image('falla-5.jpg'),
        ],
    ])->assertRedirect(route('mantenimiento.soporte'))
        ->assertSessionHas('soporte_enviado', true);

    $solicitud = SolicitudSoporte::query()->first();

    expect($solicitud)->not->toBeNull()
        ->and($solicitud->nombre)->toBe('Ana Ruiz')
        ->and($solicitud->equipo_modulo_id)->toBe($equipo->id)
        ->and($solicitud->equipo_nombre)->toBeNull()
        ->and($solicitud->imagenes)->toHaveCount(5);

    foreach ($solicitud->imagenes as $ruta) {
        expect($ruta)->toStartWith('Soporte/mantenimiento-correctivo/'.now()->format('Y/m').'/');
        Storage::disk('public')->assertExists($ruta);
    }

    $this->post(route('mantenimiento.soporte.store'), [
        'servicio' => 'mantenimiento-correctivo',
        'modalidad' => 'ultrasonido',
        'equipo' => 'logiq-e',
        'nombre' => 'Ana Ruiz',
        'codigo_pais' => '+52',
        'telefono' => '5512345678',
        'correo' => 'ana@ejemplo.com',
        'descripcion' => 'El equipo no enciende.',
        'imagenes' => collect(range(1, 6))
            ->map(fn (int $numero): UploadedFile => UploadedFile::fake()->image("extra-{$numero}.jpg"))
            ->all(),
    ])->assertSessionHasErrors('imagenes');

    expect(SolicitudSoporte::query()->count())->toBe(1);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.soporte.index', [
            'mes' => now()->month,
            'anio' => now()->year,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('solicitudes', 1)
            ->where('solicitudes.0.cliente.nombre', 'Ana Ruiz')
            ->where('solicitudes.0.cliente.telefono', '+52 5512345678')
            ->where('solicitudes.0.cliente.correo', 'ana@ejemplo.com')
            ->where('solicitudes.0.descripcion', 'El equipo no enciende.')
            ->where('solicitudes.0.equipo.nombre', 'LOGIQ E')
            ->where('solicitudes.0.equipo.marca', 'GE')
            ->has('solicitudes.0.imagenes', 5)
        );
});

test('a public support form stores a written equipment name', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    Modulo::factory()->create([
        'modulo' => 'Mastografía',
        'slug' => 'mastografia',
        'estatus_id' => $activo->id,
    ]);

    $this->post(route('mantenimiento.soporte.store'), [
        'servicio' => 'mantenimiento-correctivo',
        'modalidad' => 'mastografia',
        'equipo_nombre' => 'Selenia Dimensions',
        'marca' => 'Hologic',
        'nombre' => 'Ana Ruiz',
        'codigo_pais' => '+52',
        'telefono' => '5512345678',
        'correo' => 'ana@ejemplo.com',
        'descripcion' => 'La compresión no responde.',
    ])->assertRedirect(route('mantenimiento.soporte'));

    $solicitud = SolicitudSoporte::query()->first();

    expect($solicitud)->not->toBeNull()
        ->and($solicitud->equipo_modulo_id)->toBeNull()
        ->and($solicitud->equipo_nombre)->toBe('Selenia Dimensions')
        ->and($solicitud->marca)->toBe('Hologic');
});

test('a public support form rejects an incomplete request', function () {
    $this->post(route('mantenimiento.soporte.store'), [
        'servicio' => 'mantenimiento-correctivo',
        'nombre' => 'Ana Ruiz',
    ])->assertSessionHasErrors(['modalidad', 'equipo_nombre', 'telefono', 'correo', 'descripcion']);

    expect(SolicitudSoporte::query()->count())->toBe(0);
});
