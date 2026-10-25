<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRefaccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('admin') !== null;
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'modulo_id' => ['required', 'integer', Rule::exists('modulos', 'id')],
            'nombre' => ['required', 'string', 'max:200'],
            'numero_parte' => ['nullable', 'string', 'max:100'],
            'fabricante_id' => ['required', 'integer', Rule::exists('fabricantes', 'id')],
            'categoria' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'condicion' => ['required', Rule::in(['nueva', 'usada', 'reacondicionada'])],
            'disponibilidad' => ['required', Rule::in(['disponible', 'bajo_pedido', 'consultar'])],
            'imagenes' => ['nullable', 'array', 'max:5'],
            'imagenes.*' => ['image', 'max:5120'],
        ];
    }
}
