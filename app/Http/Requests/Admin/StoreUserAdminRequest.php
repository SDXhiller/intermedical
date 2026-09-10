<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Models\Cargo;
use App\Models\RolUsuario;
use App\Models\UserAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserAdminRequest extends FormRequest
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

        return [
            'nombre' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'nombre_usuario' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z0-9._-]+$/', Rule::unique($adminsTable, 'username')],
            'correo' => ['required', 'string', 'email', 'max:255', Rule::unique($adminsTable, 'email')],
            'cargo_id' => [
                'required',
                'integer',
                Rule::exists((new Cargo)->getTable(), 'id')->where(
                    fn ($query) => $query->where('slug', '!=', Cargo::SLUG_SUPER_USUARIO),
                ),
            ],
            'rol_usuario_id' => [
                'required',
                'integer',
                Rule::exists((new RolUsuario)->getTable(), 'id')->where(
                    fn ($query) => $query->where('slug', '!=', RolUsuario::SLUG_SUPER_USUARIO),
                ),
            ],
            'password' => $this->passwordRules(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
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
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
        ];
    }

    /**
     * @return array<string, bool|int|string>
     */
    public function adminAttributes(): array
    {
        /** @var array{nombre: string, apellidos: string, nombre_usuario: string, correo: string, cargo_id: int, rol_usuario_id: int, password: string} $validated */
        $validated = $this->safe()->except(['password_confirmation']);

        return [
            'name' => $validated['nombre'],
            'apellidos' => $validated['apellidos'],
            'username' => $validated['nombre_usuario'],
            'email' => $validated['correo'],
            'cargo_id' => $validated['cargo_id'],
            'rol_usuario_id' => $validated['rol_usuario_id'],
            'activo' => true,
            'password' => $validated['password'],
        ];
    }
}
