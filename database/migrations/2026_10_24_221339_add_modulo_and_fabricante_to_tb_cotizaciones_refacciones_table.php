<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link each spare-part quote to the modality chosen up front and to a catalog brand.
     */
    public function up(): void
    {
        Schema::table('tb_cotizaciones_refacciones', function (Blueprint $table) {
            $table->foreignId('modulo_id')
                ->after('refaccion_id')
                ->constrained('modulos')
                ->restrictOnDelete();

            $table->foreignId('fabricante_id')
                ->nullable()
                ->after('equipo')
                ->constrained('fabricantes')
                ->nullOnDelete();
        });

        Schema::table('tb_cotizaciones_refacciones', function (Blueprint $table) {
            $table->dropColumn('modelo');
        });
    }

    /**
     * Reverse the modality and brand links.
     */
    public function down(): void
    {
        Schema::table('tb_cotizaciones_refacciones', function (Blueprint $table) {
            $table->string('modelo', 200)->nullable()->after('marca');
            $table->dropConstrainedForeignId('fabricante_id');
            $table->dropConstrainedForeignId('modulo_id');
        });
    }
};
