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
            $table->foreignId('rol_usuario_id')
                ->nullable()
                ->after('cargo')
                ->constrained('rol_usuarios');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_admins', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rol_usuario_id');
        });
    }
};
