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
        Schema::create('punto_imagen_360', function (Blueprint $table) {
            $table->id();
            $table->foreignId('imagen_360_id')
                ->constrained('imagen_360')
                ->cascadeOnDelete();
            $table->foreignId('destino_imagen_360_id')
                ->nullable()
                ->constrained('imagen_360')
                ->nullOnDelete();
            $table->decimal('pos_x', 5, 2);
            $table->decimal('pos_y', 5, 2);
            $table->string('etiqueta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('punto_imagen_360');
    }
};
