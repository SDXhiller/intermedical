<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store how many arrows the hashed pattern contains so the unlock screen can submit it when complete.
     */
    public function up(): void
    {
        Schema::table('user_admins', function (Blueprint $table) {
            $table->unsignedTinyInteger('patron_longitud')->nullable()->after('patron');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_admins', function (Blueprint $table) {
            $table->dropColumn('patron_longitud');
        });
    }
};
