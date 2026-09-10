<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserAdminRequest;
use App\Http\Requests\Admin\UpdateUserAdminRequest;
use App\Models\Cargo;
use App\Models\RolUsuario;
use App\Models\UserAdmin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    /**
     * Show the user creation page.
     */
    public function create(): Response
    {
        return Inertia::render('Users/Rol-usuarios/Crear-usuarios', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'roles' => RolUsuario::query()
                ->asignables()
                ->orderBy('id')
                ->get(['id', 'nombre']),
            'cargos' => Cargo::query()
                ->asignables()
                ->orderBy('id')
                ->get(['id', 'nombre']),
        ]);
    }

    /**
     * Store a newly created admin user.
     */
    public function store(StoreUserAdminRequest $request): RedirectResponse
    {
        UserAdmin::query()->create($request->adminAttributes());

        return redirect()
            ->route('admin.usuarios.create')
            ->with('success', 'Usuario administrador creado correctamente.');
    }

    /**
     * Show the user edit listing.
     */
    public function edit(): Response
    {
        return Inertia::render('Users/Rol-usuarios/editar_ususarios', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'roles' => RolUsuario::query()
                ->asignables()
                ->orderBy('id')
                ->get(['id', 'nombre']),
            'cargos' => Cargo::query()
                ->asignables()
                ->orderBy('id')
                ->get(['id', 'nombre']),
            'admins' => UserAdmin::query()
                ->with([
                    'rolUsuario:id,nombre,slug',
                    'cargo:id,nombre,slug',
                ])
                ->latest('id')
                ->get(['id', 'name', 'apellidos', 'username', 'email', 'cargo_id', 'rol_usuario_id', 'activo', 'created_at'])
                ->map(fn (UserAdmin $admin): array => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'apellidos' => $admin->apellidos,
                    'username' => $admin->username,
                    'email' => $admin->email,
                    'cargo' => $admin->cargo,
                    'activo' => $admin->activo,
                    'rol_usuario' => $admin->rolUsuario,
                    'es_super_usuario' => $admin->isSuperUsuario(),
                ]),
        ]);
    }

    /**
     * Update an admin user.
     */
    public function update(UpdateUserAdminRequest $request, UserAdmin $userAdmin): RedirectResponse
    {
        $userAdmin->update($request->adminAttributes());

        return redirect()
            ->route('admin.usuarios.edit')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Delete an admin user.
     */
    public function destroy(UserAdmin $userAdmin): RedirectResponse
    {
        $userAdmin->loadMissing('rolUsuario');

        if ($userAdmin->isSuperUsuario()) {
            return redirect()
                ->route('admin.usuarios.edit')
                ->with('error', 'El super usuario no se puede eliminar.');
        }

        $userAdmin->delete();

        return redirect()
            ->route('admin.usuarios.edit')
            ->with('success', 'Usuario eliminado correctamente.');
    }
}
