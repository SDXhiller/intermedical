<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->dropIndex(['modelo_id']);
            $table->dropColumn('modelo_id');
        });

        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->foreignId('modulo_id')
                ->after('id')
                ->constrained('modulos')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('modulo_id');
        });

        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->unsignedBigInteger('modelo_id')->after('id');
            $table->index('modelo_id');
        });
    }
};
