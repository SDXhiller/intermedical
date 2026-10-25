<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->dropColumn('marca');
        });

        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->foreignId('fabricante_id')
                ->nullable()
                ->after('numero_parte')
                ->constrained('fabricantes')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('fabricante_id');
        });

        Schema::table('tb_refacciones', function (Blueprint $table) {
            $table->string('marca', 100)->nullable()->after('numero_parte');
        });
    }
};
