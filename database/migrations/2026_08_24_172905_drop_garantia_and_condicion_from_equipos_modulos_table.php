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
        $columns = array_values(array_filter(
            ['garantia', 'condicion'],
            fn (string $column): bool => Schema::hasColumn('equipos_modulos', $column),
        ));

        if ($columns === []) {
            return;
        }

        Schema::table('equipos_modulos', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $hasGarantia = Schema::hasColumn('equipos_modulos', 'garantia');
        $hasCondicion = Schema::hasColumn('equipos_modulos', 'condicion');

        if ($hasGarantia && $hasCondicion) {
            return;
        }

        Schema::table('equipos_modulos', function (Blueprint $table) use ($hasGarantia, $hasCondicion) {
            if (! $hasGarantia) {
                $table->string('garantia')->nullable()->after('anio');
            }

            if (! $hasCondicion) {
                $table->string('condicion')->nullable()->after($hasGarantia ? 'garantia' : 'anio');
            }
        });
    }
};
