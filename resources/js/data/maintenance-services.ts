export type MaintenanceService = {
    title: string;
    slug: string;
    description: string;
    features: string[];
    responseTime: string;
};

export const maintenanceServices: MaintenanceService[] = [
    {
        title: 'Mantenimiento preventivo',
        slug: 'mantenimiento-preventivo',
        description:
            'Servicio especializado con revisiones programadas para conservar el funcionamiento, la seguridad y la confiabilidad de sus equipos.',
        features: [
            'Revisiones programadas',
            'Seguridad operativa',
            'Mayor confiabilidad',
        ],
        responseTime: '24 - 48 horas',
    },
    {
        title: 'Mantenimiento correctivo',
        slug: 'mantenimiento-correctivo',
        description:
            'Identificamos y atendemos fallas para restablecer el funcionamiento de los equipos conforme a sus condiciones técnicas.',
        features: [
            'Atención de fallas',
            'Restablecimiento técnico',
            'Condiciones seguras',
        ],
        responseTime: 'Según diagnóstico',
    },
    {
        title: 'Diagnóstico',
        slug: 'diagnostico',
        description:
            'Evaluamos el equipo para identificar el origen de la falla y presentar alternativas de solución con respaldo técnico.',
        features: [
            'Evaluación del equipo',
            'Origen de la falla',
            'Alternativas de solución',
        ],
        responseTime: '24 - 48 horas',
    },
    {
        title: 'Renta de equipos médicos',
        slug: 'renta-de-equipos-medicos',
        description:
            'Ofrecemos equipos de diagnóstico por imagen en renta, de acuerdo con la modalidad, ubicación y necesidades de cada institución.',
        features: [
            'Equipos de imagen',
            'Según modalidad',
            'Ajuste institucional',
        ],
        responseTime: 'Programado',
    },
    {
        title: 'Instalación',
        slug: 'instalacion',
        description:
            'Realizamos la instalación técnica de equipos de diagnóstico por imagen, considerando los requerimientos del sitio y del sistema.',
        features: [
            'Instalación técnica',
            'Requerimientos del sitio',
            'Ajuste del sistema',
        ],
        responseTime: 'Programado',
    },
    {
        title: 'Desinstalación',
        slug: 'desinstalacion',
        description:
            'Ejecutamos la desinstalación técnica y organizada de equipos, cuidando sus componentes y las condiciones del área.',
        features: [
            'Retiro organizado',
            'Cuidado de componentes',
            'Protección del área',
        ],
        responseTime: 'Programado',
    },
    {
        title: 'Puesta en marcha',
        slug: 'puesta-en-marcha',
        description:
            'Verificamos las condiciones de funcionamiento del equipo para apoyar una operación segura y confiable antes de su uso.',
        features: [
            'Verificación técnica',
            'Operación segura',
            'Listo para uso',
        ],
        responseTime: 'Programado',
    },
];

export function getMaintenanceServiceBySlug(
    slug: string,
): MaintenanceService | undefined {
    return maintenanceServices.find((service) => service.slug === slug);
}
