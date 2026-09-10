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
            $table->string('estado')->nullable()->after('descripcion_corta');
            $table->string('modalidad')->nullable()->after('estado');
            $table->text('aplicaciones')->nullable()->after('modalidad');
            $table->unsignedSmallInteger('anio')->nullable()->after('aplicaciones');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->dropColumn([
                'estado',
                'modalidad',
                'aplicaciones',
                'anio',
            ]);
        });
    }
};
