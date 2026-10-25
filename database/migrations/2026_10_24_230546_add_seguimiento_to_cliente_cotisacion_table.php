<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store the administrative follow-up of an equipment quote.
     */
    public function up(): void
    {
        Schema::table('cliente_cotisacion', function (Blueprint $table) {
            $table->string('estatus')->default('en_espera')->after('correo');
            $table->text('observaciones')->nullable()->after('estatus');
        });
    }

    /**
     * Remove the administrative follow-up columns.
     */
    public function down(): void
    {
        Schema::table('cliente_cotisacion', function (Blueprint $table) {
            $table->dropColumn(['estatus', 'observaciones']);
        });
    }
};
