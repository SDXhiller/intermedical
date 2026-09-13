<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tipo_servicio_mantenimiento', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('slug')->unique();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        $now = now();

        DB::table('tipo_servicio_mantenimiento')->insert([
            [
                'nombre' => 'Mantenimiento preventivo',
                'slug' => 'mantenimiento-preventivo',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Mantenimiento correctivo',
                'slug' => 'mantenimiento-correctivo',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Diagnóstico',
                'slug' => 'diagnostico',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Renta de equipos médicos',
                'slug' => 'renta-de-equipos-medicos',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Instalación',
                'slug' => 'instalacion',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Desinstalación',
                'slug' => 'desinstalacion',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Puesta en marcha',
                'slug' => 'puesta-en-marcha',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipo_servicio_mantenimiento');
    }
};
