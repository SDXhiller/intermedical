<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store the administrative follow-up of a support request.
     */
    public function up(): void
    {
        Schema::table('solicitudes_soporte', function (Blueprint $table) {
            $table->string('estatus')->default('en_espera')->after('atendida_at');
            $table->text('observaciones')->nullable()->after('estatus');
        });

        DB::table('solicitudes_soporte')
            ->whereNotNull('atendida_at')
            ->update(['estatus' => 'concluido']);
    }

    /**
     * Remove the administrative follow-up columns.
     */
    public function down(): void
    {
        Schema::table('solicitudes_soporte', function (Blueprint $table) {
            $table->dropColumn(['estatus', 'observaciones']);
        });
    }
};
