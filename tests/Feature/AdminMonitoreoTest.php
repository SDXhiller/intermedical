<?php

use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\UserAdmin;
use Database\Seeders\StatusSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(StatusSeeder::class);
});

test('guests cannot access seo monitoring', function () {
    $this->get(route('admin.monitoreo'))
        ->assertRedirect(route('admin.login'));
});

test('admins without configuration access cannot open monitoring', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.monitoreo'))
        ->assertForbidden();
});

test('admins with configuration access can view sitemap monitoring', function () {
    $admin = UserAdmin::factory()->create();
    $modulo = Modulo::factory()->create(['modulo' => 'Ultrasonido']);
    EquipoModulo::factory()->create([
        'modulo_id' => $modulo->id,
        'modelo' => 'Acuson NX3',
        'activo' => true,
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.monitoreo'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/monitoreo')
            ->where('sitemapUrl', route('sitemap'))
            ->where('robotsUrl', route('robots'))
            ->where('totalUrls', fn (int $total): bool => $total >= 6)
            ->has('checks')
            ->has('entries')
            ->has('groups')
        );
});
