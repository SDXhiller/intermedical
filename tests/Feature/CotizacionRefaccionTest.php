<?php

use App\Models\CotizacionRefaccion;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Refaccion;
use App\Models\Status;
use Database\Seeders\StatusSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
    Storage::fake('cotizaciones');
});

test('a modality quote stores the selected module, brand and photos', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Arcos C',
        'slug' => 'arcos-c',
        'estatus_id' => $activo->id,
    ]);
    $marca = Fabricante::factory()->create([
        'nombre' => 'Siemens',
        'activo' => true,
    ]);

    $this->post(route('refacciones.cotizar.store', 'arcos-c'), [
        'cliente' => 'Hospital Central',
        'direccion' => 'Av. Reforma 100',
        'contacto' => 'Ing. Ana López',
        'area' => 'Ingeniería biomédica',
        'telefono' => '771 123 4567',
        'correo' => 'ana.lopez@hospital.mx',
        'equipo' => 'Arco en C móvil',
        'fabricante_id' => $marca->id,
        'refaccion' => 'Tubo de rayos X',
        'numero_parte' => 'SC-ARC-01',
        'descripcion' => 'El tubo presenta falla intermitente.',
        'imagenes' => [UploadedFile::fake()->image('tubo.png')],
    ])->assertRedirect(route('refacciones.cotizar', 'arcos-c'))
        ->assertSessionHas('success');

    $cotizacion = CotizacionRefaccion::query()->first();

    expect($cotizacion)->not->toBeNull()
        ->and($cotizacion->modulo_id)->toBe($modulo->id)
        ->and($cotizacion->modulo->is($modulo))->toBeTrue()
        ->and($cotizacion->fabricante_id)->toBe($marca->id)
        ->and($cotizacion->marca)->toBe('Siemens')
        ->and($cotizacion->refaccion_id)->toBeNull()
        ->and($cotizacion->equipo)->toBe('Arco en C móvil')
        ->and($cotizacion->estatus)->toBe('pendiente')
        ->and($cotizacion->imagenes)->toHaveCount(1)
        ->and($cotizacion->imagenes->first()->nombre_original)->toBe('tubo.webp')
        ->and($cotizacion->imagenes->first()->ruta)->toStartWith('Imagen/Cotizaciones/');

    Storage::disk('cotizaciones')->assertExists(
        str_replace('Imagen/Cotizaciones/', '', $cotizacion->imagenes->first()->ruta),
    );
});

test('a spare part quote keeps the part linked to its modality', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $marca = Fabricante::factory()->create([
        'nombre' => 'GE',
        'activo' => true,
    ]);
    $refaccion = Refaccion::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $marca->id,
        'nombre' => 'Transductor lineal',
        'publicado' => true,
    ]);

    $this->post(route('refacciones.cotizacion.store', [
        'modalidad' => 'ultrasonido',
        'refaccion' => $refaccion,
    ]), [
        'cliente' => 'Clínica Norte',
        'contacto' => 'Dr. Luis Pérez',
        'telefono' => '55 0000 1111',
        'correo' => 'luis@clinica.mx',
        'equipo' => 'LOGIQ E',
        'fabricante_id' => $marca->id,
        'refaccion' => 'Transductor lineal',
    ])->assertRedirect(route('refacciones.cotizacion', [
        'modalidad' => 'ultrasonido',
        'refaccion' => $refaccion,
    ]));

    $cotizacion = CotizacionRefaccion::query()->first();

    expect($cotizacion?->refaccion_id)->toBe($refaccion->id)
        ->and($cotizacion?->modulo_id)->toBe($modulo->id)
        ->and($cotizacion?->marca)->toBe('GE');
});

test('a spare part quote rejects an inactive brand and a part from another modality', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $otro = Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);
    $inactiva = Fabricante::factory()->create([
        'nombre' => 'Marca inactiva',
        'activo' => false,
    ]);
    $refaccion = Refaccion::factory()->create([
        'modulo_id' => $otro->id,
        'publicado' => true,
    ]);

    $this->post(route('refacciones.cotizar.store', 'ultrasonido'), [
        'cliente' => 'Clínica Norte',
        'contacto' => 'Dr. Luis Pérez',
        'telefono' => '55 0000 1111',
        'correo' => 'luis@clinica.mx',
        'equipo' => 'LOGIQ E',
        'fabricante_id' => $inactiva->id,
        'refaccion' => 'Transductor',
    ])->assertSessionHasErrors('fabricante_id');

    $this->post(route('refacciones.cotizacion.store', [
        'modalidad' => 'ultrasonido',
        'refaccion' => $refaccion,
    ]), [
        'cliente' => 'Clínica Norte',
        'contacto' => 'Dr. Luis Pérez',
        'telefono' => '55 0000 1111',
        'correo' => 'luis@clinica.mx',
        'equipo' => 'LOGIQ E',
        'fabricante_id' => Fabricante::factory()->create(['activo' => true])->id,
        'refaccion' => 'Transductor',
    ])->assertNotFound();

    expect(CotizacionRefaccion::query()->count())->toBe(0)
        ->and($modulo->cotizacionesRefacciones()->count())->toBe(0);
});
