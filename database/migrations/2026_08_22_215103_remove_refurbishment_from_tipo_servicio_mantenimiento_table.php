<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tipoId = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'refurbishment')
            ->value('id');

        if ($tipoId === null) {
            return;
        }

        DB::table('servicios')
            ->where('tipo_servicio_mantenimiento_id', $tipoId)
            ->delete();

        DB::table('tipo_servicio_mantenimiento')
            ->where('id', $tipoId)
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $exists = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'refurbishment')
            ->exists();

        if ($exists) {
            return;
        }

        $now = now();

        DB::table('tipo_servicio_mantenimiento')->insert([
            'nombre' => 'Refurbishment',
            'slug' => 'refurbishment',
            'activo' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
};
