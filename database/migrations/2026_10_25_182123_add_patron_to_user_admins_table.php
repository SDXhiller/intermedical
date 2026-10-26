<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store the hashed arrow pattern used to unlock an admin session.
     */
    public function up(): void
    {
        Schema::table('user_admins', function (Blueprint $table) {
            $table->string('patron')->nullable()->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_admins', function (Blueprint $table) {
            $table->dropColumn('patron');
        });
    }
};
