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
        Schema::table('tipo_servicio_mantenimiento', function (Blueprint $table) {
            $table->text('descripcion')->nullable()->after('slug');
        });

        $descriptions = [
            'mantenimiento-preventivo' => 'Servicio especializado con revisiones programadas para conservar el funcionamiento, la seguridad y la confiabilidad de sus equipos.',
            'mantenimiento-correctivo' => 'Identificamos y atendemos fallas para restablecer el funcionamiento de los equipos conforme a sus condiciones técnicas.',
            'diagnostico' => 'Evaluamos el equipo para identificar el origen de la falla y presentar alternativas de solución con respaldo técnico.',
            'renta-de-equipos-medicos' => 'Ofrecemos equipos de diagnóstico por imagen en renta, de acuerdo con la modalidad, ubicación y necesidades de cada institución.',
            'instalacion' => 'Realizamos la instalación técnica de equipos de diagnóstico por imagen, considerando los requerimientos del sitio y del sistema.',
            'desinstalacion' => 'Ejecutamos la desinstalación técnica y organizada de equipos, cuidando sus componentes y las condiciones del área.',
            'puesta-en-marcha' => 'Verificamos las condiciones de funcionamiento del equipo para apoyar una operación segura y confiable antes de su uso.',
        ];

        foreach ($descriptions as $slug => $descripcion) {
            DB::table('tipo_servicio_mantenimiento')
                ->where('slug', $slug)
                ->update(['descripcion' => $descripcion]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tipo_servicio_mantenimiento', function (Blueprint $table) {
            $table->dropColumn('descripcion');
        });
    }
};
