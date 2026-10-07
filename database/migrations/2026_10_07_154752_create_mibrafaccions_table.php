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
        Schema::create('mibrafacciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_modulo_id')->constrained('equipos_modulos')->cascadeOnDelete();
            $table->foreignId('fabricante_id')->constrained('fabricantes')->restrictOnDelete();
            $table->foreignId('modulo_id')->constrained('modulos')->cascadeOnDelete();
            $table->string('refaccion_requerida');
            $table->string('numero_parte');
            $table->text('descripcion')->nullable();
            $table->json('fotografias')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['modulo_id', 'activo']);
            $table->index(['equipo_modulo_id', 'activo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mibrafacciones');
    }
};
