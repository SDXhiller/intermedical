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

test('the servicios mega menu lists items in three columns without group titles', function () {
    $header = file_get_contents(resource_path('js/components/site-header.tsx'));

    expect($header)
        ->toContain('lg:grid-cols-3')
        ->toContain('truncate text-sm font-semibold')
        ->toContain('buildSpecializedServices')
        ->not->toContain('OTROS SERVICIOS')
        ->not->toContain('INSTALACIÓN Y PUESTA EN MARCHA')
        ->not->toContain("title: 'MANTENIMIENTO'")
        ->not->toContain('ServiceCategoryColumn');
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
]);
