<?php

namespace App\Http\Requests\Admin;

use App\Models\TipoServicioMantenimiento;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTipoServicioMantenimientoRequest extends FormRequest
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
        $tipo = $this->route('tipoServicioMantenimiento');

        return [
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique((new TipoServicioMantenimiento)->getTable(), 'nombre')
                    ->ignore($tipo),
            ],
            'descripcion' => ['required', 'string', 'max:2000'],
            'activo' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del tipo de servicio es obligatorio.',
            'nombre.unique' => 'Ya existe un tipo de servicio con ese nombre.',
            'descripcion.required' => 'La descripción de la tarjeta es obligatoria.',
            'activo.required' => 'Seleccione el estatus.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->has('activo')) {
            $payload['activo'] = filter_var($this->input('activo'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        if ($this->has('descripcion') && is_string($this->input('descripcion'))) {
            $payload['descripcion'] = trim($this->input('descripcion'));
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }
}
