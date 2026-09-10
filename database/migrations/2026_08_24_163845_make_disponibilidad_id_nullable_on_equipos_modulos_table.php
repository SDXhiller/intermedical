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
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->dropForeign(['disponibilidad_id']);
        });

        DB::statement('ALTER TABLE equipos_modulos MODIFY disponibilidad_id BIGINT UNSIGNED NULL');

        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->foreign('disponibilidad_id')
                ->references('id')
                ->on('disponibilidad')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->dropForeign(['disponibilidad_id']);
        });

        DB::statement('ALTER TABLE equipos_modulos MODIFY disponibilidad_id BIGINT UNSIGNED NOT NULL');

        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->foreign('disponibilidad_id')
                ->references('id')
                ->on('disponibilidad')
                ->restrictOnDelete();
        });
    }
};
