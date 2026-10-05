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

test('modalidades and equipos open only from their links', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)
        ->toContain("label: 'Modalidades'")
        ->toContain('href: bibliotecaEquipos.url()')
        ->toContain("label: 'Equipos disponibles'")
        ->toContain('href: equiposDisponibles.url()')
        ->toContain('icon: Monitor')
        ->not->toContain("megaMenu: 'modalidades'")
        ->not->toContain("megaMenu: 'productos'")
        ->not->toContain('MODALIDADES')
        ->not->toContain('EQUIPOS DISPONIBLES')
        ->not->toContain('Carrusel de equipos disponibles');
});

test('the servicios navigation link does not open a hover menu', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)
        ->toContain("label: 'Servicios'")
        ->toContain('href: mantenimiento.url()')
        ->not->toContain("megaMenu: 'servicios'")
        ->not->toContain('SERVICIOS ESPECIALIZADOS')
        ->not->toContain('Soluciones integrales para sus equipos médicos')
        ->not->toContain('SpecializedServicesMegaMenu');
});

test('the site header collapses search and navigation behind buttons on mobile', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)
        ->toContain('Buscar equipo, refacción o servicio...')
        ->toContain('Abrir búsqueda')
        ->toContain('Abrir menú')
        ->toContain('setSearchOpen')
        ->toContain('setMenuOpen')
        ->toContain('lg:hidden')
        ->toContain('grid-rows-[1fr]')
        ->toContain('grid-rows-[0fr]')
        ->toContain('duration-300');
});

test('existing public pages linked from the site header remain available', function (string $routeName) {
    $this->get(route($routeName))->assertOk();
})->with([
    'home',
    'mantenimiento',
    'sobre-nosotros',
    'contacto',
    'biblioteca.equipos',
    'biblioteca.equipos-disponibles',
]);
