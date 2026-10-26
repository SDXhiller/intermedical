<?php

namespace App\Http\Requests\Admin;

use App\Models\UserAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConfirmAdminPatronRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('admin') instanceof UserAdmin;
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patron' => ['required', 'array', 'min:5', 'max:10'],
            'patron.*' => ['required', 'string', Rule::in(UserAdmin::PATRON_DIRECCIONES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'patron.required' => 'Ingrese el patrón de seguridad.',
            'patron.min' => 'El patrón debe contener entre 5 y 10 movimientos.',
            'patron.max' => 'El patrón debe contener entre 5 y 10 movimientos.',
            'patron.*.in' => 'El patrón solo puede usar las flechas de dirección.',
        ];
    }
}
