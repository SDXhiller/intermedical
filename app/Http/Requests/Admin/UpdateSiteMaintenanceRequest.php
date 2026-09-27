<?php

namespace App\Http\Requests\Admin;

use App\Models\Cargo;
use App\Models\UserAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSiteMaintenanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $admin = $this->user('admin');

        if (! $admin instanceof UserAdmin) {
            return false;
        }

        $admin->loadMissing(['cargo', 'rolUsuario']);

        return $admin->activo && $admin->canAccess(Cargo::AREA_CONFIGURACION);
    }

    /**
     * @return array<string, ValidationRule|array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
            'hours' => ['required', 'integer', 'min:0', 'max:72'],
            'minutes' => ['required', 'integer', 'min:0', 'max:59'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'enabled.required' => 'Indique si el modo mantenimiento está activo.',
            'hours.required' => 'Indique las horas del temporizador.',
            'minutes.required' => 'Indique los minutos del temporizador.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                if (! $this->boolean('enabled')) {
                    return;
                }

                $totalMinutes = ((int) $this->input('hours') * 60) + (int) $this->input('minutes');

                if ($totalMinutes < 1) {
                    $validator->errors()->add(
                        'minutes',
                        'Configure al menos un minuto para encender el modo mantenimiento.',
                    );
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('enabled')) {
            $this->merge([
                'enabled' => filter_var($this->input('enabled'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }
}
