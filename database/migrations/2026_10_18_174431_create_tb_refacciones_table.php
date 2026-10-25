
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_refacciones', function (Blueprint $table) {
            $table->id();

            // Modelo del equipo relacionado
            $table->unsignedBigInteger('modelo_id');

            // Información principal
            $table->string('nombre', 200);
            $table->string('numero_parte', 100)->nullable();
            $table->string('marca', 100)->nullable();
            $table->string('categoria', 100);

            // Descripción de la refacción
            $table->text('descripcion')->nullable();

            // Estado físico de la pieza
            $table->enum('condicion', [
                'nueva',
                'usada',
                'reacondicionada',
            ])->default('nueva');

            // Disponibilidad comercial
            $table->enum('disponibilidad', [
                'disponible',
                'bajo_pedido',
                'consultar',
            ])->default('consultar');

            // Información técnica variable
            $table->json('especificaciones')->nullable();

            // Control de publicación
            $table->boolean('publicado')->default(false);

            // Fechas de registro y actualización
            $table->timestamps();

            // Índices para mejorar las consultas
            $table->index('modelo_id');
            $table->index('categoria');
            $table->index('numero_parte');
            $table->index('publicado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_refacciones');
    }
};
