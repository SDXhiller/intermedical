<?php

namespace App\Enums;

enum ServicioIcono: string
{
    case Telefono = 'telefono';
    case Soporte = 'soporte';
    case Correo = 'correo';
    case Whatsapp = 'whatsapp';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::Telefono => 'Teléfono',
            self::Soporte => 'Atención a cliente',
            self::Correo => 'Email',
            self::Whatsapp => 'WhatsApp',
        };
    }
}
