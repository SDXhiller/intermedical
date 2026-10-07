<?php

use App\Enums\ServicioIcono;
use App\Models\Servicio;
use App\Models\Telefono;
use App\Support\WhatsAppContact;
use Inertia\Testing\AssertableInertia as Assert;

test('uses the configured whatsapp number with the mexico country code', function () {
    config(['services.whatsapp.number' => '55 1976 1691']);

    expect(WhatsAppContact::digits())->toBe('525519761691');
});

test('keeps a full international whatsapp number', function () {
    config(['services.whatsapp.number' => '5215519761691']);

    expect(WhatsAppContact::digits())->toBe('5215519761691');
});

test('falls back to an active whatsapp service phone', function () {
    config(['services.whatsapp.number' => null]);

    $telefono = Telefono::factory()->create([
        'numero' => '7715861245',
        'tipo' => 'whatsapp',
        'activo' => true,
    ]);

    Servicio::factory()->create([
        'icono' => ServicioIcono::Whatsapp,
        'telefono_id' => $telefono->id,
        'activo' => true,
    ]);

    expect(WhatsAppContact::digits())->toBe('527715861245');
});

test('returns null when whatsapp is not configured', function () {
    config(['services.whatsapp.number' => null]);

    expect(WhatsAppContact::digits())->toBeNull();
});

test('the support page shares the whatsapp number when configured', function () {
    config(['services.whatsapp.number' => '5215512345678']);

    $this->get(route('mantenimiento.soporte'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/ViewSoporte')
            ->where('whatsappNumber', '5215512345678')
        );
});
