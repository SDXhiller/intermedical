<?php

use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the sobre nosotros page', function () {
    $this->get(route('sobre-nosotros'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Empresa/Sobrenosotros')
        );
});
