<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCotizacionRefaccionRequest extends FormRequest
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
        $this->merge([
            'cliente' => $this->squished('cliente'),
            'direccion' => $this->nullableString('direccion'),
            'contacto' => $this->squished('contacto'),
            'area' => $this->nullableString('area'),
            'telefono' => $this->nullableString('telefono'),
            'correo' => $this->nullableString('correo'),
            'equipo' => $this->squished('equipo'),
            'fabricante_id' => $this->blankToNull($this->input('fabricante_id')),
            'refaccion' => $this->squished('refaccion'),
            'numero_parte' => $this->nullableString('numero_parte'),
            'descripcion' => $this->nullableString('descripcion'),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'cliente' => ['required', 'string', 'max:200'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'contacto' => ['required', 'string', 'max:150'],
            'area' => ['nullable', 'string', 'max:150'],
            'telefono' => ['required', 'string', 'max:30'],
            'correo' => ['required', 'string', 'email', 'max:200'],
            'equipo' => ['required', 'string', 'max:200'],
            'fabricante_id' => [
                'required',
                'integer',
                Rule::exists('fabricantes', 'id')->where('activo', true),
            ],
            'refaccion' => ['required', 'string', 'max:255'],
            'numero_parte' => ['nullable', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'imagenes' => ['nullable', 'array', 'max:6'],
            'imagenes.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cliente.required' => 'El cliente o institución es obligatorio.',
            'contacto.required' => 'El nombre de contacto es obligatorio.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Ingresa un correo electrónico válido.',
            'equipo.required' => 'El equipo es obligatorio.',
            'fabricante_id.required' => 'Selecciona la marca.',
            'fabricante_id.exists' => 'La marca seleccionada no es válida.',
            'refaccion.required' => 'La refacción requerida es obligatoria.',
            'imagenes.max' => 'Puedes adjuntar un máximo de 6 fotografías.',
            'imagenes.*.image' => 'Solo se permiten imágenes JPG, PNG o WEBP.',
            'imagenes.*.mimes' => 'Solo se permiten imágenes JPG, PNG o WEBP.',
            'imagenes.*.max' => 'Cada imagen debe pesar hasta 5 MB.',
        ];
    }

    private function squished(string $key): mixed
    {
        $value = $this->input($key);

        if (! is_string($value)) {
            return $value;
        }

        $value = Str::squish($value);

        return $value === '' ? null : $value;
    }

    private function nullableString(string $key): mixed
    {
        return $this->blankToNull($this->input($key));
    }

    private function blankToNull(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
