<?php

use App\Models\Modulo;
use App\Models\Status;
use Illuminate\Support\Facades\Schema;

test('status table has the expected columns', function () {
    expect(Schema::hasColumns('status', ['id', 'nombre']))->toBeTrue();
});

test('modulos table has the expected columns', function () {
    expect(Schema::hasColumns('modulos', [
        'id',
        'modulo',
        'slug',
        'imagen',
        'descripcion',
        'estatus_id',
    ]))->toBeTrue();
});

test('status seeder creates activo and inactivo records', function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);

    expect(Status::query()->count())->toBe(2)
        ->and(Status::query()->find(1)?->nombre)->toBe('Activo')
        ->and(Status::query()->find(2)?->nombre)->toBe('Inactivo');
});

test('a modulo belongs to a status', function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);

    $modulo = Modulo::factory()->create([
        'estatus_id' => 1,
    ]);

    expect($modulo->estatus)->toBeInstanceOf(Status::class)
        ->and($modulo->estatus->nombre)->toBe('Activo');
});
