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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'refurbishment')
            ->delete();
    }
};
