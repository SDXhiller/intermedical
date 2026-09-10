<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();

        DB::table('rol_usuarios')->insert([
            'nombre' => 'Super usuario',
            'slug' => 'super-usuario',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $superUsuarioId = DB::table('rol_usuarios')
            ->where('slug', 'super-usuario')
            ->value('id');

        DB::table('user_admins')
            ->where('username', 'admin')
            ->update([
                'apellidos' => null,
                'rol_usuario_id' => $superUsuarioId,
                'activo' => true,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $superUsuarioId = DB::table('rol_usuarios')
            ->where('slug', 'super-usuario')
            ->value('id');

        $administradorId = DB::table('rol_usuarios')
            ->where('slug', 'administrador')
            ->value('id');

        DB::table('user_admins')
            ->where('rol_usuario_id', $superUsuarioId)
            ->update(['rol_usuario_id' => $administradorId]);

        DB::table('rol_usuarios')
            ->where('slug', 'super-usuario')
            ->delete();
    }
};
