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
        Schema::table('solicitudes_soporte', function (Blueprint $table) {
            $table->string('equipo_nombre', 120)->nullable()->after('equipo_modulo_id');
            $table->string('marca', 80)->nullable()->after('equipo_nombre');
            $table->string('nombre', 80)->after('marca');
            $table->string('empresa', 120)->nullable()->after('nombre');
            $table->string('codigo_pais', 8)->after('empresa');
            $table->string('telefono', 20)->after('codigo_pais');
            $table->string('correo', 120)->after('telefono');
            $table->string('estado', 80)->nullable()->after('correo');
            $table->decimal('latitud', 10, 7)->nullable()->after('estado');
            $table->decimal('longitud', 10, 7)->nullable()->after('latitud');
            $table->text('descripcion')->after('longitud');
            $table->json('imagenes')->nullable()->after('descripcion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitudes_soporte', function (Blueprint $table) {
            $table->dropColumn([
                'equipo_nombre',
                'marca',
                'nombre',
                'empresa',
                'codigo_pais',
                'telefono',
                'correo',
                'estado',
                'latitud',
                'longitud',
                'descripcion',
                'imagenes',
            ]);
        });
    }
};
