<?php

use Illuminate\Support\Facades\Schema;

test('servicios related tables exist with expected columns', function () {
    expect(Schema::hasTable('telefonos'))->toBeTrue()
        ->and(Schema::hasColumns('telefonos', [
            'id',
            'nombre',
            'numero',
            'tipo',
            'activo',
        ]))->toBeTrue()
        ->and(Schema::hasTable('correos'))->toBeTrue()
        ->and(Schema::hasColumns('correos', [
            'id',
            'nombre',
            'correo',
            'activo',
        ]))->toBeTrue()
        ->and(Schema::hasTable('horarios'))->toBeTrue()
        ->and(Schema::hasColumns('horarios', [
            'id',
            'dias',
            'hora_inicio',
            'hora_fin',
            'activo',
        ]))->toBeTrue()
        ->and(Schema::hasTable('servicios'))->toBeTrue()
        ->and(Schema::hasColumns('servicios', [
            'id',
            'tipo_servicio_mantenimiento_id',
            'nombre',
            'slug',
            'descripcion',
            'icono',
            'telefono_id',
            'correo_id',
            'horario_id',
            'activo',
        ]))->toBeTrue()
        ->and(Schema::hasColumn('servicios', 'imagen'))->toBeFalse()
        ->and(Schema::hasTable('tipo_servicio_mantenimiento'))->toBeTrue()
        ->and(Schema::hasColumns('tipo_servicio_mantenimiento', [
            'id',
            'nombre',
            'slug',
            'activo',
        ]))->toBeTrue();
});
