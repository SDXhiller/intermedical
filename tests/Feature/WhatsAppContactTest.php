<?php

use App\Enums\ServicioIcono;
use App\Models\Modulo;
use App\Models\Servicio;
use App\Models\Status;
use App\Models\Telefono;
use App\Support\WhatsAppContact;
use Database\Seeders\StatusSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('uses the configured whatsapp number with the mexico country code', function () {
    config(['services.whatsapp.number' => '55 1976 1691']);

    expect(WhatsAppContact::digits())->toBe('525519761691');
});

test('drops the legacy mexico mobile prefix so whatsapp accepts the number', function () {
    config(['services.whatsapp.number' => '5215519761691']);

    expect(WhatsAppContact::digits())->toBe('525519761691');
});

test('keeps a full international whatsapp number', function () {
    config(['services.whatsapp.number' => '5491112345678']);

    expect(WhatsAppContact::digits())->toBe('5491112345678');
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

test('uses the public business line when whatsapp is not configured', function () {
    config(['services.whatsapp.number' => null]);

    expect(WhatsAppContact::digits())->toBe('525519761691');
});

test('the spare part quote page shares the configured whatsapp number', function () {
    $this->seed(StatusSeeder::class);
    config(['services.whatsapp.number' => '5215519761691']);

    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    Modulo::factory()->create([
        'modulo' => 'Arcos C',
        'slug' => 'arcos-c',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('refacciones.cotizar', 'arcos-c'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Refacciones/cotizacionesViewPiesasReffaciones')
            ->where('whatsappNumber', '525519761691')
        );

    expect(file_get_contents(resource_path('js/pages/Refacciones/cotizacionesViewPiesasReffaciones.tsx')))
        ->toContain('whatsappNumber')
        ->toContain('whatsappChatUrl');
});

test('the support page shares the whatsapp number when configured', function () {
    config(['services.whatsapp.number' => '5215512345678']);

    $this->get(route('mantenimiento.soporte'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/ViewSoporte')
            ->where('whatsappNumber', '525512345678')
        );
});
