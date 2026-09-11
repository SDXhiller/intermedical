<?php

use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Status;
use Database\Seeders\StatusSeeder;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('the public sitemap lists static pages and active equipment', function () {
    $modulo = Modulo::factory()->create(['modulo' => 'Rayos X']);
    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Axiom Artis',
        'activo' => true,
    ]);
    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Modelo oculto',
        'activo' => false,
    ]);

    $response = $this->get(route('sitemap'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

    $body = $response->getContent();

    expect($body)
        ->toContain(route('home'))
        ->toContain(route('equipos.index', ['category' => $modulo->slug]))
        ->toContain(route('modulos.show', ['slug' => $equipo->slug]))
        ->not->toContain('Modelo oculto');
});

test('newly registered active equipment and models appear in the sitemap immediately', function () {
    $before = $this->get(route('sitemap'))->assertOk()->getContent();

    expect($before)
        ->not->toContain('Tomografo Helicoidal')
        ->not->toContain('Somatom Definition');

    $activoId = Status::query()->where('nombre', 'Activo')->value('id');

    $modulo = Modulo::factory()->create([
        'modulo' => 'Tomografo Helicoidal',
        'slug' => 'tomografo-helicoidal',
        'estatus_id' => $activoId,
    ]);

    $equipo = EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Somatom Definition',
        'slug' => 'somatom-definition',
        'activo' => true,
    ]);

    $response = $this->get(route('sitemap'))->assertOk();

    expect($response->headers->get('Cache-Control'))
        ->toContain('no-cache')
        ->toContain('no-store');

    $after = $response->getContent();

    expect($after)
        ->toContain(route('equipos.index', ['category' => $modulo->slug]))
        ->toContain(route('modulos.show', ['slug' => $equipo->slug]));
});

test('robots txt points to the absolute sitemap url', function () {
    $this->get(route('robots'))
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('User-agent: *', false)
        ->assertSee('Sitemap: '.route('sitemap'), false);
});
