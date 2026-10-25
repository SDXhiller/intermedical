<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store internal notes written from the admin follow-up.
     */
    public function up(): void
    {
        Schema::table('tb_cotizaciones_refacciones', function (Blueprint $table) {
            $table->text('observaciones')->nullable()->after('descripcion');
        });
    }

    /**
     * Remove the internal follow-up notes.
     */
    public function down(): void
    {
        Schema::table('tb_cotizaciones_refacciones', function (Blueprint $table) {
            $table->dropColumn('observaciones');
        });
    }
};
