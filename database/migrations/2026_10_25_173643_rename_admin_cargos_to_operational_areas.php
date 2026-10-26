<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rename the assignable cargos to the three operational areas.
     */
    public function up(): void
    {
        $nombres = [
            'gerente-ventas' => 'Ventas',
            'equipos' => 'Carga de equipos',
            'atencion' => 'Atención a cliente',
        ];

        foreach ($nombres as $slug => $nombre) {
            DB::table('cargos')->where('slug', $slug)->update([
                'nombre' => $nombre,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $nombres = [
            'gerente-ventas' => 'Gerente de ventas',
            'equipos' => 'Cargo de equipos',
            'atencion' => 'Servicio a atención',
        ];

        foreach ($nombres as $slug => $nombre) {
            DB::table('cargos')->where('slug', $slug)->update([
                'nombre' => $nombre,
            ]);
        }
    }
};
