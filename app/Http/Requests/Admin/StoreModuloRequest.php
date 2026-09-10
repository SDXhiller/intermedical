<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreModuloRequest extends FormRequest
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
            'modulo' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('modulos', 'slug')],
            'imagen' => ['nullable', 'image', 'max:5120'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'estatus_id' => ['required', 'integer', Rule::exists('status', 'id')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'modulo.required' => 'El nombre del módulo es obligatorio.',
            'slug.required' => 'El slug es obligatorio.',
            'slug.unique' => 'Este slug ya está registrado.',
            'estatus_id.required' => 'Seleccione un estatus.',
            'estatus_id.exists' => 'El estatus seleccionado no es válido.',
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.max' => 'La imagen no debe superar los 5 MB.',
        ];
    }
}
