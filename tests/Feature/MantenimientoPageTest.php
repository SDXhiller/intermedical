<?php

use App\Models\TipoServicioMantenimiento;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the mantenimiento page', function () {
    $this->get(route('mantenimiento'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/Mantenimiento')
            ->has('servicios')
        );
});

test('the mantenimiento page shows only active service types', function () {
    TipoServicioMantenimiento::query()
        ->where('slug', 'diagnostico')
        ->update(['activo' => false]);

    TipoServicioMantenimiento::factory()->create([
        'nombre' => 'Calibración de equipos',
        'slug' => 'calibracion-de-equipos',
        'activo' => true,
    ]);

    $this->get(route('mantenimiento'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/Mantenimiento')
            ->where(
                'servicios',
                fn ($servicios) => $servicios->contains('slug', 'calibracion-de-equipos')
                    && ! $servicios->contains('slug', 'diagnostico')
                    && $servicios->firstWhere('slug', 'calibracion-de-equipos')['title'] === 'Calibración de equipos'
                    && $servicios->firstWhere('slug', 'calibracion-de-equipos')['group'] === 'otros',
            )
        );
});

test('the mantenimiento page reflects renamed service types', function () {
    TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-preventivo')
        ->update(['nombre' => 'Preventivo premium']);

    $this->get(route('mantenimiento'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'servicios',
                fn ($servicios) => $servicios->contains(fn ($item) => $item['slug'] === 'mantenimiento-preventivo'
                    && $item['title'] === 'Preventivo premium'),
            )
        );
});

test('the mantenimiento page uses the configured card description', function () {
    TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-preventivo')
        ->update(['descripcion' => 'Texto de tarjeta personalizado.']);

    $this->get(route('mantenimiento'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'servicios',
                fn ($servicios) => $servicios->contains(fn ($item) => $item['slug'] === 'mantenimiento-preventivo'
                    && $item['description'] === 'Texto de tarjeta personalizado.'),
            )
        );
});

test('the mantenimiento hero uses the equipment image without a tall cover', function () {
    $page = file_get_contents(resource_path('js/pages/Mantenimiento/Mantenimiento.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('05_07_19 p.m..png')
        ->toContain('object-contain object-right')
        ->not->toContain('min-h-[620px]')
        ->not->toContain('Mantenimeinto.png');
});

test('the mantenimiento cards only render name description and request button', function () {
    $page = file_get_contents(resource_path('js/pages/Mantenimiento/Mantenimiento.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('service.title')
        ->toContain('service.description')
        ->toContain('Solicitar servicio')
        ->toContain('Servicio de suministro y venta de refacciones')
        ->toContain('Solicitar refacción')
        ->toContain('lg:col-span-3')
        ->toContain("return serviceCardImages[slug] ?? '#';")
        ->toContain('Mantenimiento_preventivo_de_equipo_medico.png')
        ->toContain('Equipos_de_diagnostico_por_imagen_medicos.png')
        ->not->toContain('mantenimiento preventivo de equipo medico.png')
        ->toContain('from-neutral-950 via-neutral-950/80 to-transparent')
        ->toContain('object-contain object-right')
        ->toContain('sm:items-center')
        ->toContain('refacciones.url()')
        ->not->toContain('Tiempo estimado de respuesta')
        ->not->toContain('service.features')
        ->not->toContain('service.responseTime');
});
