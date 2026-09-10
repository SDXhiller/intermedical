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
        Schema::create('equipos_modulos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modulo_id')->constrained('modulos')->cascadeOnDelete();
            $table->foreignId('fabricante_id')->constrained('fabricantes')->restrictOnDelete();
            $table->string('modelo');
            $table->string('imagen')->nullable();
            $table->text('descripcion_corta')->nullable();
            $table->string('tipo_equipo');
            $table->foreignId('disponibilidad_id')->nullable()->constrained('disponibilidad')->restrictOnDelete();
            $table->decimal('precio', 12, 2)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipos_modulos');
    }
};
