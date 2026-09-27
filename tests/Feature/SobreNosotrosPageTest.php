<?php

use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the sobre nosotros page', function () {
    $this->get(route('sobre-nosotros'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Empresa/Sobrenosotros')
        );
});

test('the sobre nosotros page uses the company philosophy layout without images', function () {
    $page = file_get_contents(resource_path('js/pages/Empresa/Sobrenosotros.tsx'));

    expect($page)->not->toBeFalse();
    expect($page)
        ->toContain('Sobre nosotros')
        ->toContain('Ingeniería especializada para imagenología')
        ->toContain('Conoce nuestros servicios')
        ->toContain('mejores condiciones')
        ->toContain('SiteBreadcrumb')
        ->toContain('Experiencia desde 2019')
        ->toContain('Ingeniería especializada')
        ->toContain('Soporte multimodalidad y multimarca')
        ->toContain('Licencia CNSNS')
        ->not->toContain("number: '1'")
        ->not->toContain("number: '2'")
        ->not->toContain("number: '3'")
        ->not->toContain("number: '4'")
        ->toContain('Nuestra forma de trabajar')
        ->toContain('Evaluación técnica')
        ->toContain('Comunicación clara')
        ->toContain('Documentación técnica')
        ->toContain('Nuestra filosofía')
        ->toContain("id: 'objetivo'")
        ->toContain("id: 'mision'")
        ->toContain("id: 'vision'")
        ->toContain('lg:grid-cols-3')
        ->toContain('Nuestros valores')
        ->toContain('id="valores"')
        ->toContain('lg:grid-cols-6')
        ->toContain('ética, responsabilidad, seguridad')
        ->toContain('Mantener la tecnología de imagen médica')
        ->toContain('empresa referente en México')
        ->toContain('Compromiso')
        ->toContain('Profesionalismo')
        ->toContain('Responsabilidad')
        ->toContain('Honestidad')
        ->toContain('Servicio')
        ->toContain('Lealtad')
        ->not->toContain('ImagePlaceholder')
        ->not->toContain('BlendedPillarImage')
        ->not->toContain('/Imagen/Sobrenosotros/');
});
