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
        Schema::create('solicitudes_soporte', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tipo_servicio_mantenimiento_id')
                ->constrained('tipo_servicio_mantenimiento')
                ->restrictOnDelete();
            $table->foreignId('modulo_id')
                ->constrained('modulos')
                ->restrictOnDelete();
            $table->foreignId('equipo_modulo_id')
                ->nullable()
                ->constrained('equipos_modulos')
                ->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes_soporte');
    }
};
