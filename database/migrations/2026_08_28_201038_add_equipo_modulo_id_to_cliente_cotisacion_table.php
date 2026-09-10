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
            $table->foreignId('equipo_modulo_id')
                ->nullable()
                ->after('id')
                ->constrained('equipos_modulos')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cliente_cotisacion', function (Blueprint $table) {
            $table->dropConstrainedForeignId('equipo_modulo_id');
        });
    }
};
