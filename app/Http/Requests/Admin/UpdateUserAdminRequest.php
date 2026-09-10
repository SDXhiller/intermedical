<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Models\Cargo;
use App\Models\RolUsuario;
use App\Models\UserAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserAdminRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user('admin') !== null;
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed>|string>
     */
    public function rules(): array
    {
        $adminsTable = (new UserAdmin)->getTable();
        $rolesTable = (new RolUsuario)->getTable();
        $cargosTable = (new Cargo)->getTable();
        $userAdmin = $this->userAdmin();

        $rolRule = Rule::exists($rolesTable, 'id');
        $cargoRule = Rule::exists($cargosTable, 'id');

        if (! $userAdmin->isSuperUsuario()) {
            $rolRule = $rolRule->where(
                fn ($query) => $query->where('slug', '!=', RolUsuario::SLUG_SUPER_USUARIO),
            );
            $cargoRule = $cargoRule->where(
                fn ($query) => $query->where('slug', '!=', Cargo::SLUG_SUPER_USUARIO),
            );
        }

        return [
            'nombre' => ['required', 'string', 'max:255'],
            'apellidos' => ['nullable', 'string', 'max:255'],
            'nombre_usuario' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique($adminsTable, 'username')->ignore($userAdmin->id),
            ],
            'correo' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique($adminsTable, 'email')->ignore($userAdmin->id),
            ],
            'cargo_id' => ['required', 'integer', $cargoRule],
            'rol_usuario_id' => ['required', 'integer', $rolRule],
            'activo' => ['required', 'boolean'],
            'password' => $this->optionalPasswordRules(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre_usuario.required' => 'El nombre de usuario es obligatorio.',
            'nombre_usuario.regex' => 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.',
            'nombre_usuario.unique' => 'Este nombre de usuario ya está registrado.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Indique un correo válido.',
            'correo.unique' => 'Este correo ya está registrado.',
            'cargo_id.required' => 'Seleccione el cargo.',
            'cargo_id.exists' => 'El cargo seleccionado no es válido.',
            'rol_usuario_id.required' => 'Seleccione el rol de usuario.',
            'rol_usuario_id.exists' => 'El rol seleccionado no es válido.',
            'activo.required' => 'Seleccione si el usuario está activo.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
        ];
    }

    /**
     * @return array<string, bool|int|string|null>
     */
    public function adminAttributes(): array
    {
        /** @var array{nombre: string, apellidos: string|null, nombre_usuario: string, correo: string, cargo_id: int, rol_usuario_id: int, activo: bool, password?: string|null} $validated */
        $validated = $this->safe()->except(['password_confirmation']);

        $attributes = [
            'name' => $validated['nombre'],
            'apellidos' => $validated['apellidos'] ?: null,
            'username' => $validated['nombre_usuario'],
            'email' => $validated['correo'],
            'activo' => $validated['activo'],
        ];

        if ($this->userAdmin()->isSuperUsuario()) {
            $attributes['rol_usuario_id'] = $this->userAdmin()->rol_usuario_id;
            $attributes['cargo_id'] = $this->userAdmin()->cargo_id;
        } else {
            $attributes['rol_usuario_id'] = $validated['rol_usuario_id'];
            $attributes['cargo_id'] = $validated['cargo_id'];
        }

        if (! empty($validated['password'])) {
            $attributes['password'] = $validated['password'];
        }

        return $attributes;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('activo')) {
            $this->merge([
                'activo' => filter_var($this->input('activo'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }

        if ($this->input('password') === '') {
            $this->merge([
                'password' => null,
                'password_confirmation' => null,
            ]);
        }

        if ($this->input('apellidos') === '') {
            $this->merge(['apellidos' => null]);
        }
    }

    private function userAdmin(): UserAdmin
    {
        $userAdmin = $this->route('userAdmin');

        if (! $userAdmin instanceof UserAdmin) {
            $userAdmin = UserAdmin::query()->findOrFail($userAdmin);
        }

        return $userAdmin->loadMissing(['rolUsuario', 'cargo']);
    }
}
