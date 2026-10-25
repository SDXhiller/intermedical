<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSolicitudSoporteRequest extends FormRequest
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
        $observaciones = $this->input('observaciones');

        $this->merge([
            'observaciones' => is_string($observaciones) && trim($observaciones) === ''
                ? null
                : $observaciones,
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'estado' => ['required', 'string', Rule::in(['en_espera', 'concluido', 'cancelado'])],
            'observaciones' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'estado.required' => 'Selecciona el estado de la solicitud.',
            'estado.in' => 'El estado debe ser en espera, concluido o cancelado.',
            'observaciones.max' => 'Las observaciones no pueden superar los 5000 caracteres.',
        ];
    }
}
