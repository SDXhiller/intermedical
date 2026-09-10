<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cargos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        $now = now();

        DB::table('cargos')->insert([
            [
                'nombre' => 'Super usuario',
                'slug' => 'super-usuario',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Gerente de ventas',
                'slug' => 'gerente-ventas',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Cargo de equipos',
                'slug' => 'equipos',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nombre' => 'Servicio a atención',
                'slug' => 'atencion',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cargos');
    }
};
