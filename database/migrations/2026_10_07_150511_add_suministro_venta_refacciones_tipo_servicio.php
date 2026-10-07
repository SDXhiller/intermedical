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
            ->where('slug', 'suministro-y-venta-de-refacciones')
            ->exists();

        if ($exists) {
            return;
        }

        $now = now();

        DB::table('tipo_servicio_mantenimiento')->insert([
            'nombre' => 'Suministro y venta de refacciones',
            'slug' => 'suministro-y-venta-de-refacciones',
            'descripcion' => 'Suministramos y comercializamos refacciones para equipos de diagnóstico por imagen, de acuerdo con la modalidad y las necesidades de cada institución.',
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
            ->where('slug', 'suministro-y-venta-de-refacciones')
            ->delete();
    }
};
