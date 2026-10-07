export type MaintenanceService = {
    title: string;
    slug: string;
    description: string;
    group?: string;
};

export const maintenanceServices: MaintenanceService[] = [
    {
        title: 'Servicio de suministro y venta de refacciones',
        slug: 'suministro-y-venta-de-refacciones',
        description:
            'Suministramos y comercializamos refacciones para equipos de diagnóstico por imagen, de acuerdo con la modalidad y las necesidades de cada institución.',
    },
    {
        title: 'Mantenimiento preventivo',
        slug: 'mantenimiento-preventivo',
        description:
            'Servicio especializado con revisiones programadas para conservar el funcionamiento, la seguridad y la confiabilidad de sus equipos.',
    },
    {
        title: 'Mantenimiento correctivo',
        slug: 'mantenimiento-correctivo',
        description:
            'Identificamos y atendemos fallas para restablecer el funcionamiento de los equipos conforme a sus condiciones técnicas.',
    },
    {
        title: 'Diagnóstico',
        slug: 'diagnostico',
        description:
            'Evaluamos el equipo para identificar el origen de la falla y presentar alternativas de solución con respaldo técnico.',
    },
    {
        title: 'Renta de equipos médicos',
        slug: 'renta-de-equipos-medicos',
        description:
            'Ofrecemos equipos de diagnóstico por imagen en renta, de acuerdo con la modalidad, ubicación y necesidades de cada institución.',
    },
    {
        title: 'Instalación',
        slug: 'instalacion',
        description:
            'Realizamos la instalación técnica de equipos de diagnóstico por imagen, considerando los requerimientos del sitio y del sistema.',
    },
    {
        title: 'Desinstalación',
        slug: 'desinstalacion',
        description:
            'Ejecutamos la desinstalación técnica y organizada de equipos, cuidando sus componentes y las condiciones del área.',
    },
    {
        title: 'Puesta en marcha',
        slug: 'puesta-en-marcha',
        description:
            'Verificamos las condiciones de funcionamiento del equipo para apoyar una operación segura y confiable antes de su uso.',
    },
];

export function getMaintenanceServiceBySlug(
    slug: string,
): MaintenanceService | undefined {
    return maintenanceServices.find((service) => service.slug === slug);
}
