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
        Schema::table('user_admins', function (Blueprint $table) {
            $table->string('apellidos')->nullable()->change();
            $table->boolean('activo')->default(true)->after('rol_usuario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_admins', function (Blueprint $table) {
            $table->dropColumn('activo');
            $table->string('apellidos')->nullable(false)->default('')->change();
        });
    }
};
