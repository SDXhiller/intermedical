<?php

namespace Database\Seeders;

use App\Models\UserUsuario;
use Illuminate\Database\Seeder;

class UserUsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UserUsuario::query()->updateOrCreate(
            ['username' => 'user'],
            [
                'name' => 'Usuario',
                'email' => 'user@medicalimaginggroup.com',
                'email_verified_at' => now(),
                'password' => 'abcde123',
            ],
        );
    }
}
