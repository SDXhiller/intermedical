<?php

use App\Models\UserAdmin;
use Database\Seeders\UserAdminSeeder;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia as Assert;

test('admin login screen can be rendered', function () {
    $this->get(route('admin.login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admins/Login'));
});

test('admins can authenticate and access the dashboard', function () {
    $admin = UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'abcde123',
    ])->assertRedirect(route('admin.dashboard', absolute: false));

    $this->assertAuthenticatedAs($admin, 'admin');

    $this->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/dashboard-admin')
            ->where('auth.admin.username', 'admin')
        );
});

test('a configured pattern is requested after a correct login', function () {
    $admin = UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
        ...UserAdmin::atributosPatron(UserAdmin::PATRON_ADMINISTRADOR),
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'abcde123',
    ])->assertRedirect(route('admin.patron'));

    $this->assertAuthenticatedAs($admin, 'admin');

    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.patron'));

    $this->get(route('admin.patron'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admins/Patron')
            ->missing('longitudPatron')
        );
});

test('the five up arrows unlock the admin session', function () {
    UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
        ...UserAdmin::atributosPatron(UserAdmin::PATRON_ADMINISTRADOR),
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'abcde123',
    ]);

    $this->post(route('admin.patron.store'), [
        'patron' => UserAdmin::PATRON_ADMINISTRADOR,
    ])->assertRedirect(route('admin.dashboard', absolute: false));

    $this->get(route('admin.dashboard'))
        ->assertOk();
});

test('a shorter sequence keeps the session on the pattern screen', function () {
    $direcciones = ['ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowDown'];

    UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
        ...UserAdmin::atributosPatron($direcciones),
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'abcde123',
    ]);

    $this->post(route('admin.patron.store'), [
        'patron' => array_slice($direcciones, 0, 5),
    ])->assertRedirect(route('admin.patron'));

    $this->assertAuthenticated('admin');

    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.patron'));
});

test('extra arrows after the correct pattern still unlock the session', function () {
    UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
        ...UserAdmin::atributosPatron(UserAdmin::PATRON_ADMINISTRADOR),
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'abcde123',
    ]);

    $this->post(route('admin.patron.store'), [
        'patron' => [...UserAdmin::PATRON_ADMINISTRADOR, 'ArrowDown'],
    ])->assertRedirect(route('admin.dashboard', absolute: false));

    $this->get(route('admin.dashboard'))
        ->assertOk();
});

test('too many pattern attempts stay on the pattern screen', function () {
    $admin = UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
        ...UserAdmin::atributosPatron([
            'ArrowUp',
            'ArrowUp',
            'ArrowUp',
            'ArrowUp',
            'ArrowUp',
            'ArrowDown',
        ]),
    ]);

    $clave = md5('admin-patron'.$admin->id);
    RateLimiter::clear($clave);

    try {
        $this->post(route('admin.login.store'), [
            'username' => 'admin',
            'password' => 'abcde123',
        ]);

        $patronCorto = ['ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp'];

        for ($intento = 0; $intento < 20; $intento++) {
            $this->post(route('admin.patron.store'), [
                'patron' => $patronCorto,
            ])->assertRedirect(route('admin.patron'));
        }

        $this->post(route('admin.patron.store'), [
            'patron' => $patronCorto,
        ])->assertRedirect(route('admin.patron'))
            ->assertSessionHas('error');

        $this->assertAuthenticated('admin');
    } finally {
        RateLimiter::clear($clave);
    }
});

test('an admin can cancel the pattern login', function () {
    UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
        ...UserAdmin::atributosPatron(UserAdmin::PATRON_ADMINISTRADOR),
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'abcde123',
    ])->assertRedirect(route('admin.patron'));

    $this->post(route('admin.logout'))
        ->assertRedirect(route('admin.login'));

    $this->assertGuest('admin');

    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.login'));
});

test('a wrong pattern ends the session and returns to login', function () {
    UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
        ...UserAdmin::atributosPatron(UserAdmin::PATRON_ADMINISTRADOR),
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'abcde123',
    ]);

    $this->post(route('admin.patron.store'), [
        'patron' => ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown'],
    ])->assertRedirect(route('admin.login'))
        ->assertSessionHasErrors('patron');

    $this->assertGuest('admin');

    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.login'));
});

test('the seeded super usuario keeps five up arrows', function () {
    $this->seed(UserAdminSeeder::class);

    $admin = UserAdmin::query()->where('username', 'admin')->firstOrFail();
    $admin->load('rolUsuario');

    expect($admin->rolUsuario->isSuperUsuario())->toBeTrue()
        ->and($admin->patron_longitud)->toBe(5)
        ->and($admin->patronCoincide(UserAdmin::PATRON_ADMINISTRADOR))->toBeTrue();
});

test('admins cannot authenticate with an invalid password', function () {
    UserAdmin::factory()->create([
        'username' => 'admin',
        'password' => 'abcde123',
    ]);

    $this->post(route('admin.login.store'), [
        'username' => 'admin',
        'password' => 'wrong-password',
    ]);

    $this->assertGuest('admin');
});

test('guests are redirected from the admin dashboard to login', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.login'));
});

test('admins can logout', function () {
    $admin = UserAdmin::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.logout'))
        ->assertRedirect(route('admin.login'));

    $this->assertGuest('admin');
});
