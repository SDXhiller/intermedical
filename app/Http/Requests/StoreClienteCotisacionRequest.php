<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClienteCotisacionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'equipo_modulo_id' => [
                'nullable',
                'integer',
                Rule::exists('equipos_modulos', 'id')->where('activo', true),
            ],
            'cliente' => ['required', 'string', 'max:255'],
            'calle' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'string', 'max:20'],
            'colonia' => ['required', 'string', 'max:255'],
            'cp' => ['required', 'string', 'max:10'],
            'ciudad' => ['required', 'string', 'max:255'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitud'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitud'],
            'contacto' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'telefono' => ['required', 'string', 'max:30'],
            'correo' => ['required', 'string', 'email', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'equipo_modulo_id.exists' => 'El equipo seleccionado no es válido.',
            'cliente.required' => 'El nombre del cliente es obligatorio.',
            'calle.required' => 'La calle es obligatoria.',
            'numero.required' => 'El número es obligatorio.',
            'colonia.required' => 'La colonia es obligatoria.',
            'cp.required' => 'El código postal es obligatorio.',
            'ciudad.required' => 'La ciudad es obligatoria.',
            'latitud.required_with' => 'Seleccione la ubicación en el mapa.',
            'longitud.required_with' => 'Seleccione la ubicación en el mapa.',
            'latitud.between' => 'La latitud no es válida.',
            'longitud.between' => 'La longitud no es válida.',
            'contacto.required' => 'El contacto es obligatorio.',
            'area.required' => 'El área es obligatoria.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Ingrese un correo electrónico válido.',
        ];
    }
}
