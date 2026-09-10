<?php

namespace App\Http\Requests\Admin;

use App\Support\EquipoFieldFlags;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEquipoModuloRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user('admin') !== null;
    }

    /**
     * @return array<string, ValidationRule|array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'modulo_id' => ['required', 'integer', Rule::exists('modulos', 'id')],
            'fabricante_id' => ['required', 'integer', Rule::exists('fabricantes', 'id')],
            'modelo' => ['required', 'string', 'max:255'],
            'imagen' => ['nullable', 'image', 'max:5120'],
            'descripcion_corta' => ['nullable', 'string', 'max:5000'],
            'estado' => EquipoFieldFlags::ESTADO_ENABLED
                ? ['required', 'string', 'max:255']
                : ['nullable'],
            'modalidad' => ['required', 'string', 'max:255'],
            'aplicaciones' => ['required', 'string', 'max:2000'],
            'anio' => ['nullable', 'integer', 'min:1990', 'max:'.((int) date('Y') + 1)],
            'tipo_equipo_id' => [
                'required',
                'integer',
                Rule::exists('tipos_equipos', 'id')->where('activo', true),
            ],
            'disponibilidad_id' => EquipoFieldFlags::DISPONIBILIDAD_ENABLED
                ? ['required', 'integer', Rule::exists('disponibilidad', 'id')]
                : ['nullable', 'integer', Rule::exists('disponibilidad', 'id')],
            'precio' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
            'activo' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'modulo_id.required' => 'Seleccione un módulo.',
            'modulo_id.exists' => 'El módulo seleccionado no es válido.',
            'fabricante_id.required' => 'Seleccione un fabricante.',
            'fabricante_id.exists' => 'El fabricante seleccionado no es válido.',
            'modelo.required' => 'El modelo es obligatorio.',
            'descripcion_corta.max' => 'La descripción del equipo no debe superar los 5000 caracteres.',
            'estado.required' => 'Seleccione o indique el estado del equipo.',
            'modalidad.required' => 'La modalidad es obligatoria.',
            'aplicaciones.required' => 'Las aplicaciones son obligatorias.',
            'tipo_equipo_id.required' => 'Seleccione el tipo de equipo.',
            'tipo_equipo_id.exists' => 'El tipo de equipo seleccionado no es válido.',
            'disponibilidad_id.required' => 'Seleccione la disponibilidad.',
            'disponibilidad_id.exists' => 'La disponibilidad seleccionada no es válida.',
            'anio.integer' => 'El año debe ser un número válido.',
            'precio.numeric' => 'El precio debe ser un número.',
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.max' => 'La imagen no debe superar los 5 MB.',
            'activo.required' => 'Seleccione si el modelo está activo.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('activo')) {
            $this->merge([
                'activo' => filter_var($this->input('activo'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }

        if ($this->input('precio') === '' || $this->input('precio') === null) {
            $this->merge(['precio' => null]);
        }

        if ($this->input('anio') === '' || $this->input('anio') === null) {
            $this->merge(['anio' => null]);
        }

        if (! EquipoFieldFlags::ESTADO_ENABLED) {
            $this->merge(['estado' => null]);
        }

        if (! EquipoFieldFlags::DISPONIBILIDAD_ENABLED) {
            $this->merge(['disponibilidad_id' => null]);
        }
    }
}
