<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\RolUsuario;
use App\Models\UserAdmin;
use Illuminate\Database\Seeder;

class UserAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UserAdmin::query()->updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrador',
                'apellidos' => null,
                'email' => 'admin@medicalimaginggroup.com',
                'cargo_id' => Cargo::query()->where('slug', Cargo::SLUG_SUPER_USUARIO)->value('id'),
                'rol_usuario_id' => RolUsuario::query()->where('slug', 'super-usuario')->value('id'),
                'activo' => true,
                'password' => 'abcde123',
            ],
        );
    }
}
