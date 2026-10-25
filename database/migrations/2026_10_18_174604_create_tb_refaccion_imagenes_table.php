
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_refaccion_imagenes', function (Blueprint $table) {
            $table->id();

            // Refacción a la que pertenece la imagen
            $table->foreignId('refaccion_id')
                ->constrained('tb_refacciones')
                ->cascadeOnDelete();

            // Ruta donde se almacena la fotografía
            $table->string('ruta', 500);

            // Posición de la imagen en la galería
            $table->unsignedInteger('orden')->default(0);

            // Indica si es la imagen principal
            $table->boolean('es_principal')->default(false);

            // Fechas de creación y actualización
            $table->timestamps();

            // Índices para ordenar y consultar imágenes
            $table->index(['refaccion_id', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_refaccion_imagenes');
    }
};
