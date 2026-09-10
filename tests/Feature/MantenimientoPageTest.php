<?php

use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the mantenimiento page', function () {
    $this->get(route('mantenimiento'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Mantenimiento/Mantenimiento')
        );
});
