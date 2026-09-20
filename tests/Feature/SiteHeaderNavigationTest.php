<?php

test('the site header lists public navigation labels in the expected order', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)->not->toBeFalse();

    preg_match_all("/label: '([^']+)'/", $header, $matches);

    expect($matches[1])->toBe([
        'Inicio',
        'Servicios',
        'Modalidades',
        'Equipos disponibles',
        'Nosotros',
        'Contacto',
    ]);
});

test('the site header uses the corresponding navigation icons', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)
        ->toContain('icon: Home')
        ->toContain('icon: Settings')
        ->toContain('icon: Layers')
        ->toContain('icon: Monitor')
        ->toContain('icon: Users')
        ->toContain('icon: Mail');
});

test('the site header points modalidades to the modalidades page', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)
        ->toContain("label: 'Modalidades'")
        ->toContain('href: bibliotecaEquipos.url()')
        ->toContain("megaMenu: 'modalidades'")
        ->toContain("label: 'Equipos disponibles'")
        ->toContain("href: '#'")
        ->toContain("megaMenu: 'productos'")
        ->toContain('icon: Monitor')
        ->toContain('subEquipmentItems')
        ->toContain('MODALIDADES')
        ->toContain('EQUIPOS DISPONIBLES')
        ->toContain('cta="Ver equipo"')
        ->toContain('animate-equipment-marquee')
        ->toContain('md:w-[calc((100cqw-5.25rem)/4)]')
        ->toContain('Carrusel de equipos disponibles');
});

test('the site header keeps the search bar expanded', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)
        ->toContain('Buscar equipo, refacción o servicio...')
        ->not->toContain('Abrir búsqueda')
        ->not->toContain('setSearchOpen');
});

test('existing public pages linked from the site header remain available', function (string $routeName) {
    $this->get(route($routeName))->assertOk();
})->with([
    'home',
    'mantenimiento',
    'sobre-nosotros',
    'contacto',
    'biblioteca.equipos',
]);
