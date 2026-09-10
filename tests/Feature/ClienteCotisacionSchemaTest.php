<?php

use App\Models\ClienteCotisacion;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Status;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);
});

test('cliente_cotisacion table exists with expected columns', function () {
    expect(Schema::hasTable('cliente_cotisacion'))->toBeTrue()
        ->and(Schema::hasColumns('cliente_cotisacion', [
            'id',
            'equipo_modulo_id',
            'cliente',
            'calle',
            'numero',
            'colonia',
            'cp',
            'ciudad',
            'latitud',
            'longitud',
            'contacto',
            'area',
            'telefono',
            'correo',
            'created_at',
            'updated_at',
        ]))->toBeTrue()
        ->and(Schema::hasColumn('cliente_cotisacion', 'direccion'))->toBeFalse();
});

test('a cliente cotisacion can be created with factory data', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create(['estatus_id' => $activo->id]);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'ACUSON Sequoia',
        'activo' => true,
    ]);

    $cliente = ClienteCotisacion::factory()->create([
        'equipo_modulo_id' => $equipo->id,
        'cliente' => 'Hospital Central',
        'calle' => 'Av. Reforma',
        'numero' => '100',
        'colonia' => 'Centro',
        'cp' => '06000',
        'ciudad' => 'Ciudad de México',
        'latitud' => 19.432608,
        'longitud' => -99.133209,
        'contacto' => 'Ing. Ana López',
        'area' => 'Ingeniería Clínica',
        'telefono' => '55 1234 5678',
        'correo' => 'ana.lopez@hospitalcentral.mx',
    ]);

    expect($cliente->id)->toBeInt()
        ->and($cliente->equipo_modulo_id)->toBe($equipo->id)
        ->and($cliente->equipoModulo?->modelo)->toBe('ACUSON Sequoia')
        ->and($cliente->cliente)->toBe('Hospital Central')
        ->and($cliente->calle)->toBe('Av. Reforma')
        ->and($cliente->numero)->toBe('100')
        ->and($cliente->colonia)->toBe('Centro')
        ->and($cliente->cp)->toBe('06000')
        ->and($cliente->ciudad)->toBe('Ciudad de México')
        ->and((float) $cliente->latitud)->toBe(19.432608)
        ->and((float) $cliente->longitud)->toBe(-99.133209)
        ->and($cliente->contacto)->toBe('Ing. Ana López')
        ->and($cliente->area)->toBe('Ingeniería Clínica')
        ->and($cliente->telefono)->toBe('55 1234 5678')
        ->and($cliente->correo)->toBe('ana.lopez@hospitalcentral.mx');
});
