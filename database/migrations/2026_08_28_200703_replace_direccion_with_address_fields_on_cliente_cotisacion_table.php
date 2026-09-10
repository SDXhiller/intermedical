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
        Schema::table('cliente_cotisacion', function (Blueprint $table) {
            $table->dropColumn('direccion');
            $table->string('calle')->after('cliente');
            $table->string('numero', 20)->after('calle');
            $table->string('colonia')->after('numero');
            $table->string('cp', 10)->after('colonia');
            $table->string('ciudad')->after('cp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cliente_cotisacion', function (Blueprint $table) {
            $table->dropColumn(['calle', 'numero', 'colonia', 'cp', 'ciudad']);
            $table->string('direccion')->after('cliente');
        });
    }
};
