<?php

use App\Models\Disponibilidad;
use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\TipoEquipo;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\StatusSeeder::class,
        \Database\Seeders\DisponibilidadSeeder::class,
        \Database\Seeders\TipoEquipoSeeder::class,
    ]);
});

test('equipment related tables exist with expected columns', function () {
    expect(Schema::hasTable('fabricantes'))->toBeTrue()
        ->and(Schema::hasColumns('fabricantes', ['id', 'nombre', 'logo', 'activo']))->toBeTrue()
        ->and(Schema::hasTable('disponibilidad'))->toBeTrue()
        ->and(Schema::hasColumns('disponibilidad', ['id', 'nombre', 'color']))->toBeTrue()
        ->and(Schema::hasTable('tipos_equipos'))->toBeTrue()
        ->and(Schema::hasColumns('tipos_equipos', ['id', 'tipo', 'slug', 'descripcion', 'activo']))->toBeTrue()
        ->and(Schema::hasTable('equipos_modulos'))->toBeTrue()
        ->and(Schema::hasColumns('equipos_modulos', [
            'id',
            'modulo_id',
            'fabricante_id',
            'modelo',
            'slug',
            'imagen',
            'descripcion_corta',
            'estado',
            'modalidad',
            'aplicaciones',
            'anio',
            'tipo_equipo_id',
            'disponibilidad_id',
            'precio',
            'activo',
        ]))->toBeTrue()
        ->and(Schema::hasColumn('equipos_modulos', 'tipo_equipo'))->toBeFalse();
});

test('disponibilidad seeder registers the three expected statuses', function () {
    expect(Disponibilidad::query()->count())->toBe(3)
        ->and(Disponibilidad::query()->find(1)?->nombre)->toBe('Disponible')
        ->and(Disponibilidad::query()->find(1)?->color)->toBe('Verde')
        ->and(Disponibilidad::query()->find(2)?->nombre)->toBe('Bajo pedido')
        ->and(Disponibilidad::query()->find(2)?->color)->toBe('Naranja')
        ->and(Disponibilidad::query()->find(3)?->nombre)->toBe('Agotado')
        ->and(Disponibilidad::query()->find(3)?->color)->toBe('Rojo');
});

test('tipo equipo seeder registers the expected equipment types', function () {
    expect(TipoEquipo::query()->count())->toBe(12)
        ->and(TipoEquipo::query()->where('slug', 'tipo-carro')->value('tipo'))->toBe('Tipo carro')
        ->and(TipoEquipo::query()->where('slug', 'portatil')->value('tipo'))->toBe('Portátil')
        ->and(TipoEquipo::query()->where('slug', 'de-mano-handheld')->value('tipo'))->toBe('De mano (Handheld)')
        ->and(TipoEquipo::query()->where('slug', 'abierto-open-mri')->value('tipo'))->toBe('Abierto (Open MRI)')
        ->and(TipoEquipo::query()->where('slug', 'veterinario')->value('tipo'))->toBe('Veterinario');
});

test('an equipo modulo can belong to modulo fabricante tipo and disponibilidad', function () {
    $modulo = Modulo::factory()->create();
    $fabricante = Fabricante::factory()->create(['nombre' => 'Siemens Healthineers']);
    $disponibilidad = Disponibilidad::query()->where('nombre', 'Disponible')->firstOrFail();
    $tipoEquipo = TipoEquipo::query()->where('slug', 'tipo-carro')->firstOrFail();

    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'disponibilidad_id' => $disponibilidad->id,
        'tipo_equipo_id' => $tipoEquipo->id,
        'modelo' => 'MAGNETOM Vida',
        'precio' => 150000.50,
        'activo' => true,
    ]);

    expect($equipo->modulo->is($modulo))->toBeTrue()
        ->and($equipo->fabricante->nombre)->toBe('Siemens Healthineers')
        ->and($equipo->tipoEquipo->tipo)->toBe('Tipo carro')
        ->and($equipo->disponibilidad->nombre)->toBe('Disponible')
        ->and($modulo->equipos()->count())->toBe(1)
        ->and($tipoEquipo->equipos()->count())->toBe(1);
});
