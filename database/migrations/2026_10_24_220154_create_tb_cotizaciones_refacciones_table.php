
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_cotizaciones_refacciones', function (Blueprint $table) {
            $table->id();

            // Refacción seleccionada del catálogo (opcional)
            $table->foreignId('refaccion_id')
                ->nullable()
                ->constrained('tb_refacciones')
                ->nullOnDelete();

            // Datos del solicitante
            $table->string('cliente', 200);
            $table->string('direccion', 255)->nullable();
            $table->string('contacto', 150);
            $table->string('area', 150)->nullable();
            $table->string('telefono', 30);
            $table->string('correo', 200);

            // Datos del equipo y la refacción
            $table->string('equipo', 200);
            $table->string('marca', 150)->nullable();
            $table->string('modelo', 200)->nullable();
            $table->string('refaccion', 255);
            $table->string('numero_parte', 150)->nullable();

            // Comentarios adicionales
            $table->text('descripcion')->nullable();

            // Seguimiento administrativo
            $table->enum('estatus', [
                'pendiente',
                'en_revision',
                'cotizada',
                'finalizada',
                'cancelada',
            ])->default('pendiente');

            $table->timestamps();

            $table->index('estatus');
            $table->index('correo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_cotizaciones_refacciones');
    }
};
