<?php

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Status;
use App\Models\TipoServicioMantenimiento;
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

test('the support page leaves the service and modality empty until they are chosen', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    Modulo::factory()->create([
        'modulo' => 'Arcos c',
        'slug' => 'arcos-c',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('mantenimiento.soporte', [
        'servicio' => 'mantenimiento-correctivo',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/ViewSoporte')
            ->where('servicio.slug', 'mantenimiento-correctivo')
            ->where('modalidad', null)
            ->where('equipo', null)
            ->has('equipos', 0)
        );
});

test('the support page leaves an unknown modality unselected', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);

    $this->get(route('mantenimiento.soporte', ['modalidad' => 'no-existe']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('modalidad', null)
        );
});

test('the support page lists active modalities so the selection can change', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $inactivo = Status::query()->where('nombre', 'Inactivo')->firstOrFail();

    Modulo::factory()->create([
        'modulo' => 'Ultrasonido',
        'slug' => 'ultrasonido',
        'estatus_id' => $activo->id,
    ]);
    Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);
    Modulo::factory()->create([
        'modulo' => 'Oculto',
        'slug' => 'oculto',
        'estatus_id' => $inactivo->id,
    ]);

    $this->get(route('mantenimiento.soporte', ['modalidad' => 'rayos-x']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('modalidad.slug', 'rayos-x')
            ->has('modalidades', 2)
            ->where(
                'modalidades',
                fn ($modalidades) => $modalidades->contains('slug', 'ultrasonido')
                    && $modalidades->contains('slug', 'rayos-x')
                    && ! $modalidades->contains('slug', 'oculto'),
            )
        );
});

test('the support page only lists active service types', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);

    TipoServicioMantenimiento::query()
        ->where('slug', 'diagnostico')
        ->update(['activo' => false]);

    TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-preventivo')
        ->update(['nombre' => 'Preventivo premium']);

    $this->get(route('mantenimiento.soporte'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'servicios',
                fn ($servicios) => ! $servicios->contains('slug', 'diagnostico')
                    && $servicios->contains(fn ($item) => $item['slug'] === 'mantenimiento-preventivo'
                        && $item['title'] === 'Preventivo premium'),
            )
        );
});

test('the support page ignores an unknown or inactive service slug', function () {
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    Modulo::factory()->create([
        'modulo' => 'Rayos X',
        'slug' => 'rayos-x',
        'estatus_id' => $activo->id,
    ]);

    TipoServicioMantenimiento::query()
        ->where('slug', 'mantenimiento-correctivo')
        ->update(['activo' => false]);

    $this->get(route('mantenimiento.soporte', [
        'servicio' => 'mantenimiento-correctivo',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('servicio', null)
        );
});

test('the support page is not wired to a form submission', function () {
    $page = file_get_contents(resource_path('js/pages/Mantenimiento/ViewSoporte.tsx'));

    expect($page)
        ->toContain('Solicitar soporte técnico')
        ->toContain('{modalidad.nombre}')
        ->toContain('{equipo.nombre}')
        ->toContain('Elegir servicio')
        ->toContain('Cambiar servicio')
        ->toContain('Sin seleccionar')
        ->toContain('Elegir modalidad')
        ->toContain('Cambiar modalidad')
        ->toContain('Elegir equipo')
        ->toContain('Cambiar equipo')
        ->not->toContain('Tipo de equipo (Modalidad)')
        ->not->toContain('Ver sub equipos')
        ->toContain('El formulario aún no está conectado')
        ->toContain('WhatsApp no está habilitado por el momento')
        ->toContain('type="submit"')
        ->toContain('disabled')
        ->not->toContain('La modalidad queda fija')
        ->not->toContain('method="post"')
        ->toContain('w-full shrink-0 rounded-full sm:w-auto')
        ->toContain('lg:hidden')
        ->toContain('hidden min-h-[320px]');
});
