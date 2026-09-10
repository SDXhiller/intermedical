<?php

use App\Models\UserAdmin;
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
