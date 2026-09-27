<?php

use App\Models\UserAdmin;
use App\Support\SiteMaintenance;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $path = app(SiteMaintenance::class)->path();

    if (file_exists($path)) {
        unlink($path);
    }
});

afterEach(function () {
    $path = app(SiteMaintenance::class)->path();

    if (file_exists($path)) {
        unlink($path);
    }
});

test('the admin dashboard includes the public maintenance toggle for super users', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->where('mantenimientoSitio.enabled', false)
            ->where('mantenimientoSitio.hours', 0)
            ->where('mantenimientoSitio.minutes', 30)
        );
});

test('sales managers do not receive the public maintenance toggle', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('mantenimientoSitio', null)
        );
});

test('an active administrator can enable public maintenance mode', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->from(route('admin.dashboard'))
        ->put(route('admin.mantenimiento-sitio.update'), [
            'enabled' => true,
            'hours' => 0,
            'minutes' => 30,
        ])
        ->assertRedirect(route('admin.dashboard'))
        ->assertInertiaFlash('toast', [
            'type' => 'success',
            'message' => 'El sitio público está en modo mantenimiento.',
        ]);

    expect(app(SiteMaintenance::class)->isActive())->toBeTrue();
});

test('guests see the maintenance page while the public site is down', function () {
    app(SiteMaintenance::class)->activate(0, 30);

    $this->get(route('home'))
        ->assertServiceUnavailable()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Maintenance')
        );

    $this->get(route('contacto'))
        ->assertServiceUnavailable();
});

test('guests can still open the admin login during maintenance', function () {
    app(SiteMaintenance::class)->activate(0, 30);

    $this->get(route('admin.login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/Login')
        );
});

test('an active administrator can still view the public site during maintenance', function () {
    $admin = UserAdmin::factory()->create(['activo' => true]);
    app(SiteMaintenance::class)->activate(1, 0);

    $this->actingAs($admin, 'admin')
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
        );
});

test('an inactive administrator cannot view the public site during maintenance', function () {
    $admin = UserAdmin::factory()->create(['activo' => false]);
    app(SiteMaintenance::class)->activate(0, 15);

    $this->actingAs($admin, 'admin')
        ->get(route('home'))
        ->assertServiceUnavailable()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Maintenance')
        );
});

test('administrators can still open the admin panel during maintenance', function () {
    $admin = UserAdmin::factory()->create();
    app(SiteMaintenance::class)->activate(0, 45);

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->where('mantenimientoSitio.enabled', true)
        );

    $this->get(route('admin.login'))
        ->assertRedirect(route('admin.dashboard'));
});

test('sales managers cannot enable public maintenance mode', function () {
    $admin = UserAdmin::factory()->gerenteVentas()->create();

    $this->actingAs($admin, 'admin')
        ->put(route('admin.mantenimiento-sitio.update'), [
            'enabled' => true,
            'hours' => 0,
            'minutes' => 30,
        ])
        ->assertForbidden();

    expect(app(SiteMaintenance::class)->isActive())->toBeFalse();
});

test('maintenance mode turns itself off when the timer expires', function () {
    $this->freezeTime();

    app(SiteMaintenance::class)->activate(0, 30);

    expect(app(SiteMaintenance::class)->isActive())->toBeTrue();

    $this->travel(31)->minutes();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
        );

    expect(app(SiteMaintenance::class)->isActive())->toBeFalse();
});

test('the dashboard maintenance widget is present in the page source', function () {
    $page = file_get_contents(resource_path('js/pages/Admins/dashboard-admin.tsx'));

    expect($page)
        ->toContain('Modo mantenimiento')
        ->toContain('Configura el temporizador y enciende el anuncio público.')
        ->toContain('Estado:')
        ->toContain('Encendido')
        ->toContain('Apagado')
        ->toContain('Segundos')
        ->toContain('remainingFromUntil')
        ->not->toContain('Nuevo equipo')
        ->not->toContain('Ver cotizaciones');
});
