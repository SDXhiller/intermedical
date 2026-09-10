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
        Schema::table('user_admins', function (Blueprint $table) {
            $table->foreignId('cargo_id')
                ->nullable()
                ->after('email')
                ->constrained('cargos');
        });

        $superCargoId = DB::table('cargos')
            ->where('slug', 'super-usuario')
            ->value('id');

        if ($superCargoId !== null) {
            DB::table('user_admins')
                ->whereNull('cargo_id')
                ->update(['cargo_id' => $superCargoId]);
        }

        Schema::table('user_admins', function (Blueprint $table) {
            $table->dropColumn('cargo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_admins', function (Blueprint $table) {
            $table->string('cargo')->default('')->after('email');
        });

        Schema::table('user_admins', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cargo_id');
        });
    }
};
