<?php

namespace App\Http\Requests;

use App\Models\EquipoModulo;
use App\Models\Modulo;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreSolicitudSoporteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $equipo = $this->blankToNull($this->input('equipo'));
        $equipoNombre = $this->blankToNull($this->input('equipo_nombre'));
        $marca = $this->blankToNull($this->input('marca'));

        if (is_string($equipoNombre)) {
            $equipoNombre = Str::squish($equipoNombre);
            $equipoNombre = $equipoNombre === '' ? null : $equipoNombre;
        }

        if (is_string($marca)) {
            $marca = Str::squish($marca);
            $marca = $marca === '' ? null : $marca;
        }

        if ($equipo !== null) {
            $equipoNombre = null;
            $marca = null;
        }

        $this->merge([
            'equipo' => $equipo,
            'equipo_nombre' => $equipoNombre,
            'marca' => $marca,
            'empresa' => $this->blankToNull($this->input('empresa')),
            'estado' => $this->blankToNull($this->input('estado')),
            'latitud' => $this->blankToNull($this->input('latitud')),
            'longitud' => $this->blankToNull($this->input('longitud')),
            'nombre' => is_string($this->input('nombre')) ? Str::squish($this->input('nombre')) : $this->input('nombre'),
            'descripcion' => is_string($this->input('descripcion')) ? trim($this->input('descripcion')) : $this->input('descripcion'),
            'codigo_pais' => is_string($this->input('codigo_pais')) ? trim($this->input('codigo_pais')) : $this->input('codigo_pais'),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string|Closure>|string>
     */
    public function rules(): array
    {
        return [
            'servicio' => [
                'required',
                'string',
                Rule::exists('tipo_servicio_mantenimiento', 'slug')->where('activo', true),
            ],
            'modalidad' => [
                'required',
                'string',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $exists = Modulo::query()->activos()->where('slug', $value)->exists();

                    if (! $exists) {
                        $fail('La modalidad seleccionada no es válida.');
                    }
                },
            ],
            'equipo' => [
                'nullable',
                'string',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! is_string($value) || $value === '') {
                        return;
                    }

                    $modulo = Modulo::query()->activos()->where('slug', $this->input('modalidad'))->first();
                    $equipo = $modulo?->equipos()
                        ->where('activo', true)
                        ->where('slug', $value)
                        ->exists();

                    if (! $equipo) {
                        $fail('El equipo seleccionado no es válido.');
                    }
                },
            ],
            'equipo_nombre' => ['nullable', 'string', 'max:120', 'required_without:equipo'],
            'marca' => ['nullable', 'string', 'max:80', 'required_with:equipo_nombre'],
            'nombre' => ['required', 'string', 'max:80'],
            'empresa' => ['nullable', 'string', 'max:120'],
            'codigo_pais' => ['required', 'string', 'regex:/^\+\d{1,4}$/'],
            'telefono' => [
                'required',
                'string',
                'max:20',
                'regex:/^[\d\s()-]+$/',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $digits = is_string($value) ? preg_replace('/\D/', '', $value) : '';

                    if (! is_string($digits) || strlen($digits) < 1 || strlen($digits) > 15) {
                        $fail('El teléfono debe tener entre 1 y 15 dígitos.');
                    }
                },
            ],
            'correo' => ['required', 'string', 'email', 'max:120'],
            'estado' => ['nullable', 'string', 'max:80'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitud'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitud'],
            'descripcion' => ['required', 'string', 'max:500'],
            'imagenes' => ['nullable', 'array', 'max:5'],
            'imagenes.*' => ['image', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'servicio.required' => 'Elige el servicio para continuar.',
            'servicio.exists' => 'El servicio seleccionado no es válido.',
            'modalidad.required' => 'Elige la modalidad para continuar.',
            'equipo_nombre.required_without' => 'Elige un equipo o escribe su nombre.',
            'equipo_nombre.max' => 'El nombre del equipo no puede superar los 120 caracteres.',
            'marca.required_with' => 'Escribe la marca del equipo para continuar.',
            'marca.max' => 'La marca no puede superar los 80 caracteres.',
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.max' => 'El nombre no puede superar los 80 caracteres.',
            'empresa.max' => 'La empresa no puede superar los 120 caracteres.',
            'codigo_pais.required' => 'Elige el código de país.',
            'codigo_pais.regex' => 'El código de país no es válido.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.regex' => 'El teléfono solo puede incluir números.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Ingresa un correo electrónico válido.',
            'descripcion.required' => 'Describe la falla para enviar la solicitud.',
            'descripcion.max' => 'La descripción no puede superar los 500 caracteres.',
            'imagenes.max' => 'Puedes adjuntar hasta 5 imágenes.',
            'imagenes.*.image' => 'Solo se aceptan imágenes.',
            'imagenes.*.max' => 'Cada imagen debe pesar hasta 5 MB.',
            'latitud.required_with' => 'La ubicación debe incluir latitud y longitud.',
            'longitud.required_with' => 'La ubicación debe incluir latitud y longitud.',
        ];
    }

    /**
     * Active catalog equipment selected on the form, when one was chosen.
     */
    public function equipoSeleccionado(): ?EquipoModulo
    {
        $slug = $this->validated('equipo');

        if (! is_string($slug) || $slug === '') {
            return null;
        }

        $modulo = Modulo::query()->activos()->where('slug', $this->validated('modalidad'))->first();

        return $modulo?->equipos()
            ->where('activo', true)
            ->where('slug', $slug)
            ->first();
    }

    private function blankToNull(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        return trim($value) === '' ? null : $value;
    }
}
