<?php

namespace App\Support;

use App\Enums\ServicioIcono;
use App\Models\Servicio;
use App\Models\Telefono;

final class WhatsAppContact
{
    /**
     * Public business line shown in the site footer. Used when no number is configured.
     */
    private const FALLBACK_NUMBER = '5519761691';

    /**
     * Digits for https://wa.me/{digits}, or null when the number cannot be used.
     */
    public static function digits(): ?string
    {
        $raw = config('services.whatsapp.number');

        if (! is_string($raw) || trim($raw) === '') {
            $raw = self::numberFromDatabase();
        }

        if (! is_string($raw) || trim($raw) === '') {
            $raw = self::FALLBACK_NUMBER;
        }

        return self::normalize($raw);
    }

    private static function normalize(string $raw): ?string
    {
        $digits = preg_replace('/\D+/', '', $raw) ?? '';

        if ($digits === '') {
            return null;
        }

        if (preg_match('/^521(\d{10})$/', $digits, $matches) === 1) {
            return '52'.$matches[1];
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
