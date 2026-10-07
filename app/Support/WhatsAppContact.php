<?php

namespace App\Support;

use App\Enums\ServicioIcono;
use App\Models\Servicio;
use App\Models\Telefono;

final class WhatsAppContact
{
    /**
     * Digits for https://wa.me/{digits}, or null when WhatsApp is not configured.
     */
    public static function digits(): ?string
    {
        $raw = config('services.whatsapp.number');

        if (! is_string($raw) || trim($raw) === '') {
            $raw = self::numberFromDatabase();
        }

        if ($raw === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $raw) ?? '';

        if ($digits === '') {
            return null;
        }

        if (strlen($digits) === 10) {
            return '52'.$digits;
        }

        if (strlen($digits) >= 12) {
            return $digits;
        }

        return null;
    }

    private static function numberFromDatabase(): ?string
    {
        $fromServicio = Servicio::query()
            ->where('activo', true)
            ->where('icono', ServicioIcono::Whatsapp)
            ->whereHas('telefono', function ($query): void {
                $query->where('activo', true);
            })
            ->with('telefono:id,numero,activo')
            ->first()?->telefono?->numero;

        if (is_string($fromServicio) && $fromServicio !== '') {
            return $fromServicio;
        }

        $fromTelefono = Telefono::query()
            ->where('activo', true)
            ->whereRaw('LOWER(tipo) = ?', ['whatsapp'])
            ->value('numero');

        return is_string($fromTelefono) && $fromTelefono !== ''
            ? $fromTelefono
            : null;
    }
}
