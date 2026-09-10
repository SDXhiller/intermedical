<?php

test('home page uses brand icon for favicon', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertSee('/brand-icon.png', false);
});

test('brand icon file exists in public directory', function () {
    expect(public_path('brand-icon.png'))->toBeFile();
});
