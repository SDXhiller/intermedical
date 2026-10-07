<?php

test('the public mini navigation uses capsule buttons with brand color and icons', function () {
    $component = file_get_contents(resource_path('js/components/site-breadcrumb.tsx'));

    expect($component)->not->toBeFalse();
    expect($component)
        ->toContain('aria-label="Breadcrumb"')
        ->toContain('rounded-full')
        ->toContain('BRAND_COLOR')
        ->toContain('aria-current="page"');

    $pages = [
        'js/pages/Modulos/ListadoView.tsx',
        'js/pages/Modulos/Modulosview.tsx',
        'js/pages/Mantenimiento/ViewSoporte.tsx',
        'js/pages/contacto-inter.tsx',
        'js/pages/Biblioteca/ListaBibliotecaequipos.tsx',
        'js/pages/Empresa/Sobrenosotros.tsx',
        'js/pages/Cliente.tsx',
        'js/pages/Contacto/Mostrar-contacto.tsx',
        'js/pages/Refacciones/ViewPiesasReffaciones.tsx',
    ];

    foreach ($pages as $page) {
        $source = file_get_contents(resource_path($page));

        expect($source)->not->toBeFalse();
        expect($source)
            ->toContain("from '@/components/site-breadcrumb'")
            ->toContain('<SiteBreadcrumb')
            ->not->toContain('aria-hidden="true">›</span>')
            ->not->toContain('Inicio /');
    }
});
