
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_cotizacion_refaccion_imagenes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cotizacion_id')
                ->constrained('tb_cotizaciones_refacciones')
                ->cascadeOnDelete();

            // Ruta del archivo almacenado
            $table->string('ruta', 500);

            // Nombre original de la imagen
            $table->string('nombre_original')->nullable();

            // Orden de presentación
            $table->unsignedInteger('orden')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_cotizacion_refaccion_imagenes');
    }
};
