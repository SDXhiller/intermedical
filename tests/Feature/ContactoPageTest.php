<?php

use App\Models\Servicio;
use App\Models\TipoServicioMantenimiento;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the general contacto page', function () {
    $this->get(route('contacto'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contacto-inter')
        );
});

test('the general contacto page shows the redesigned hero with the brain image', function () {
    $page = file_get_contents(resource_path('js/pages/contacto-inter.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('Estamos listos para atender tus necesidades')
        ->toContain('Tecnología y servicio al servicio de la vida')
        ->toContain('ChatGPT Image 20 sept 2026, 01_19_34 p.m..png')
        ->toContain('Atención especializada')
        ->toContain('Respuesta oportuna')
        ->toContain('Acompañamiento en todo el proceso')
        ->not->toContain('Hablemos, estamos para servirle');
});

test('contacto page filters servicios by tipo_servicio_mantenimiento slug', function () {
    $preventivo = TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-preventivo')
        ->firstOrFail();
    $correctivo = TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-correctivo')
        ->firstOrFail();

    $servicioPreventivo = Servicio::factory()->create([
        'tipo_servicio_mantenimiento_id' => $preventivo->id,
        'nombre' => 'Contacto preventivo',
        'slug' => 'contacto-preventivo',
        'activo' => true,
    ]);

    Servicio::factory()->create([
        'tipo_servicio_mantenimiento_id' => $correctivo->id,
        'nombre' => 'Contacto correctivo',
        'slug' => 'contacto-correctivo',
        'activo' => true,
    ]);

    $this->get(route('contacto', ['tipo' => 'mantenimiento-preventivo']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Contacto/Mostrar-contacto')
            ->has('servicios', 1)
            ->where('servicios.0.id', $servicioPreventivo->id)
            ->where('servicios.0.nombre', 'Contacto preventivo')
            ->where('tipoServicio.slug', 'mantenimiento-preventivo')
            ->where('tipoServicio.nombre', 'Mantenimiento preventivo')
        );
});

test('contacto page returns not found for unknown tipo', function () {
    $this->get(route('contacto', ['tipo' => 'tipo-inexistente']))
        ->assertNotFound();
});
