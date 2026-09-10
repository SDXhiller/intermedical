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
        Schema::create('servicios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->text('descripcion')->nullable();
            $table->string('imagen')->nullable();
            $table->foreignId('telefono_id')
                ->nullable()
                ->constrained('telefonos')
                ->nullOnDelete();
            $table->foreignId('correo_id')
                ->nullable()
                ->constrained('correos')
                ->nullOnDelete();
            $table->foreignId('horario_id')
                ->nullable()
                ->constrained('horarios')
                ->nullOnDelete();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
