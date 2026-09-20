<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Status;
use Database\Seeders\StatusSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('guests can view the support page with registered equipment for a modality', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $modulo = Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    $fabricante = Fabricante::factory()->create(['nombre' => 'GE']);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'fabricante_id' => $fabricante->id,
        'modelo' => 'LOGIQ E',
        'slug' => 'logiq-e',
        'activo' => true,
    ]);
    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Oculto',
        'slug' => 'oculto-inactivo',
        'activo' => false,
    ]);

    $this->get(route('mantenimiento.soporte', [
        'modalidad' => 'ultrasonido',
        'servicio' => 'mantenimiento-correctivo',
        'equipo' => 'logiq-e',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/ViewSoporte')
            ->where('servicio.slug', 'mantenimiento-correctivo')
            ->where('servicio.title', 'Mantenimiento correctivo')
            ->where('modalidad.slug', 'ultrasonido')
            ->where('modalidad.nombre', 'Ultrasonido')
            ->has('equipos', 1)
            ->where('equipos.0.slug', 'logiq-e')
            ->where('equipos.0.nombre', 'LOGIQ E')
            ->where('equipos.0.marca', 'GE')
            ->where('equipo.slug', $equipo->slug)
        );
});

test('the support page defaults the service and first active modality', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('mantenimiento.soporte'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/ViewSoporte')
            ->where('servicio.slug', 'mantenimiento-correctivo')
            ->where('modalidad.slug', 'rayos-x')
            ->where('equipo', null)
        );
});

test('the support page returns not found for an unknown modality', function () {
    $this->get(route('mantenimiento.soporte', ['modalidad' => 'no-existe']))
        ->assertNotFound();
});

test('the support page is not wired to a form submission', function () {
    $page = file_get_contents(resource_path('js/pages/Mantenimiento/ViewSoporte.tsx'));

    expect($page)
        ->toContain('Solicitar soporte técnico')
        ->toContain('Cambiar servicio')
        ->toContain('Cambiar equipo')
        ->toContain('Ver sub equipos')
        ->toContain('El formulario aún no está conectado')
        ->toContain('WhatsApp no está habilitado por el momento')
        ->toContain('type="submit"')
        ->toContain('disabled')
        ->not->toContain('Cambiar modalidad')
        ->not->toContain('method="post"');
});
