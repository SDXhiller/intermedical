<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->dropColumn('tipo_equipo');
            $table->foreignId('tipo_equipo_id')
                ->after('descripcion_corta')
                ->constrained('tipos_equipos')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('tipo_equipo_id');
            $table->string('tipo_equipo')->after('descripcion_corta');
        });
    }
};
