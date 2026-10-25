<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCotizacionRefaccionRequest extends FormRequest
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
            'estado' => ['required', 'string', Rule::in(['pendiente', 'cotizada', 'cancelada'])],
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
            'estado.in' => 'El estado debe ser pendiente, cotizada o cancelada.',
            'observaciones.max' => 'Las observaciones no pueden superar los 5000 caracteres.',
        ];
    }
}
