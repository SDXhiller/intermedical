<?php

namespace App\Http\Requests\Admin;

use App\Enums\ServicioIcono;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServicioRequest extends FormRequest
{
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
            'tipo_servicio_mantenimiento_id' => [
                'required',
                'integer',
                Rule::exists('tipo_servicio_mantenimiento', 'id')->where('activo', true),
            ],
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'icono' => ['required', Rule::enum(ServicioIcono::class)],
            'telefono_id' => ['nullable', 'integer', Rule::exists('telefonos', 'id')],
            'correo_id' => ['nullable', 'integer', Rule::exists('correos', 'id')],
            'horario_id' => ['nullable', 'integer', Rule::exists('horarios', 'id')],
            'activo' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tipo_servicio_mantenimiento_id.required' => 'Seleccione el tipo de servicio.',
            'tipo_servicio_mantenimiento_id.exists' => 'El tipo de servicio seleccionado no es válido.',
            'nombre.required' => 'El nombre del servicio es obligatorio.',
            'icono.required' => 'Seleccione un icono.',
            'icono' => 'El icono seleccionado no es válido.',
            'telefono_id.exists' => 'El teléfono seleccionado no es válido.',
            'correo_id.exists' => 'El correo seleccionado no es válido.',
            'horario_id.exists' => 'El horario seleccionado no es válido.',
            'activo.required' => 'Seleccione el estatus.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('activo')) {
            $this->merge([
                'activo' => filter_var($this->input('activo'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }

        foreach (['telefono_id', 'correo_id', 'horario_id', 'tipo_servicio_mantenimiento_id'] as $field) {
            if ($this->input($field) === '' || $this->input($field) === null) {
                $this->merge([$field => null]);
            }
        }
    }
}
