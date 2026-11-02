import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    CalendarDays,
    Headphones,
    Package,
    Settings,
    Wrench,
} from 'lucide-react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import type { MaintenanceService } from '@/data/maintenance-services';
import { contacto, refacciones } from '@/routes';
import { soporte } from '@/routes/mantenimiento';

const HERO_IMAGE = `/Imagen/Servicios/${encodeURIComponent('Imagen de ChatGPT 27 sept 2026, 05_07_19 p.m..png')}`;

const attendedModalities = [
    'Ultrasonido',
    'Rayos X',
    'Mastografía',
    'Angiografía',
    'Arco en C',
    'Resonancia Magnética',
    'Tomografía',
    'Medicina Nuclear e Imagen Molecular',
] as const;

const REFACCION_SLUG = 'suministro-y-venta-de-refacciones';


function serviceImagePath(filename: string): string {
    return `/Imagen/Servicios/${encodeURIComponent(filename)}`;
}

const serviceCardImages: Record<string, string> = {
    'suministro-y-venta-de-refacciones': serviceImagePath(
        'Equipos_de_diagnostico_por_imagen_medicos.png',
    ),
    'mantenimiento-preventivo': serviceImagePath(
        'Mantenimiento_preventivo_de_equipo_medico.png',
    ),
    'mantenimiento-correctivo': serviceImagePath(
        'Mantenimiento_de_ecografo_con_tecnico_y_herramientas.png',
    ),
    'diagnostico-tecnico': serviceImagePath(
        'Diagnostico_medico_y_reparacion_tecnica.png',
    ),
    'renta-de-equipos': serviceImagePath(
        'Equipos_de_diagnostico_por_imagen_medicos.png',
    ),
    instalacion: serviceImagePath(
        'Instalacion_de_sistema_de_imagen_medica.png',
    ),
    desinstalacion: serviceImagePath(
        'Desinstalacion_de_escaner_medico.png',
    ),
    'puesta-en-marcha': serviceImagePath(
        'Puesta_en_marcha_de_equipo_medico.png',
    ),
    'servicio-a-inyectores': serviceImagePath(
        'Mantenimiento_de_inyector_medico_de_contraste.png',
    ),
    'control-de-calidad-de-imagen': serviceImagePath(
        'Control_de_calidad_en_tomografia_computarizada.png',
    ),
};


function cardImage(slug: string): string {
    return serviceCardImages[slug] ?? '#';
}

const refaccionService: MaintenanceService = {
    title: 'Servicio de suministro y venta de refacciones',
    slug: REFACCION_SLUG,
    description:
        'Suministramos y comercializamos refacciones para equipos de diagnóstico por imagen, de acuerdo con la modalidad y las necesidades de cada institución.',
};

const serviceCardMeta: Record<
    string,
    {
        label: string;
        icon: LucideIcon;
        action: string;
        shortDescription?: string;
    }
> = {
    [REFACCION_SLUG]: {
        label: 'Refacciones',
        icon: Package,
        action: 'Solicitar refacción',
        shortDescription: 'Componentes para equipos de imagen médica.',
    },
    'mantenimiento-preventivo': {
        label: 'Preventivo',
        icon: CalendarDays,
        action: 'Solicitar servicio',
        shortDescription:
            'Revisiones programadas para conservar el funcionamiento del equipo.',
    },
    'mantenimiento-correctivo': {
        label: 'Correctivo',
        icon: Wrench,
        action: 'Solicitar servicio',
        shortDescription:
            'Atención de fallas para restablecer el equipo conforme a su condición técnica.',
    },
    'diagnostico-tecnico': {
        label: 'Diagnóstico',
        icon: Settings,
        action: 'Solicitar servicio',
        shortDescription:
            'Evaluación técnica para identificar el origen de la falla.',
    },
    diagnostico: {
        label: 'Diagnóstico',
        icon: Settings,
        action: 'Solicitar servicio',
        shortDescription:
            'Evaluación técnica para identificar el origen de la falla.',
    },
    'renta-de-equipos': {
        label: 'Renta',
        icon: Headphones,
        action: 'Solicitar servicio',
        shortDescription:
            'Equipos de diagnóstico por imagen según la modalidad y necesidad.',
    },
    'renta-de-equipos-medicos': {
        label: 'Renta',
        icon: Headphones,
        action: 'Solicitar servicio',
        shortDescription:
            'Equipos de diagnóstico por imagen según la modalidad y necesidad.',
    },
    instalacion: {
        label: 'Instalación',
        icon: Settings,
        action: 'Solicitar servicio',
        shortDescription:
            'Instalación técnica considerando los requerimientos del sitio.',
    },
    desinstalacion: {
        label: 'Desinstalación',
        icon: Settings,
        action: 'Solicitar servicio',
        shortDescription:
            'Desinstalación organizada cuidando componentes y el área.',
    },
    'puesta-en-marcha': {
        label: 'Puesta en marcha',
        icon: Settings,
        action: 'Solicitar servicio',
        shortDescription:
            'Verificación de funcionamiento antes de la operación del equipo.',
    },
    'servicio-a-inyectores': {
        label: 'Inyectores',
        icon: Wrench,
        action: 'Solicitar servicio',
        shortDescription:
            'Servicio especializado para inyectores de contraste médico.',
    },
    'control-de-calidad-de-imagen': {
        label: 'Calidad de imagen',
        icon: Settings,
        action: 'Solicitar servicio',
        shortDescription:
            'Control de calidad en equipos de diagnóstico por imagen.',
    },
};

function cardMeta(slug: string) {
    return (
        serviceCardMeta[slug] ?? {
            label: 'Servicio',
            icon: Wrench,
            action: 'Solicitar servicio',
        }
    );
}

function ServiceArtwork({ src }: { src: string }) {
    if (src === '#') {
        return null;
    }

    return (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] overflow-hidden sm:block">
            <img
                src={src}
                alt=""
                className="absolute top-1/2 right-0 h-full w-auto max-w-none -translate-y-1/2 object-contain object-right"
            />
            <div
                className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent dark:from-black dark:via-black/80"
                aria-hidden="true"
            />
        </div>
    );
}

function MobileServiceThumb({ src }: { src: string }) {
    if (src === '#') {
        return (
            <div className="flex h-24 w-24 min-[380px]:h-28 min-[380px]:w-28 shrink-0 items-center justify-center rounded-xl bg-[#191d1b] ring-1 ring-white/10">
                <Package className="size-8 text-white/20" />
            </div>
        );
    }

    return (
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#202622] to-[#101312] p-2 ring-1 ring-white/10">
            <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain object-center"
            />
        </div>
    );
}


function MobileServiceCard({
    title,
    description,
    label,
    icon: Icon,
    action,
    href,
    image,
}: {
    title: string;
    description: string;
    label: string;
    icon: LucideIcon;
    action: string;
    href: string;
    image: string;
}) {
    return (
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414] sm:hidden">
            <div className="flex items-center gap-3 p-4 pb-3">
                <div className="min-w-0 flex-1">
                    <p
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase"
                        style={{ color: BRAND_COLOR }}
                    >
                        <Icon className="size-3.5" strokeWidth={2} />
                        {label}
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-white">
                        {title}
                    </h2>
                    <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-white/60">
                        {description}
                    </p>
                </div>
                <MobileServiceThumb src={image} />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                <span className="text-sm font-semibold text-white">
                    {action}
                </span>
                <Link
                    href={href}
                    aria-label={action}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-90"
                    style={{ backgroundColor: BRAND_COLOR }}
                >
                    <ArrowRight className="size-4" />
                </Link>
            </div>
        </article>
    );
}

function ServiceCard({ service }: { service: MaintenanceService }) {
    const image = cardImage(service.slug);
    const meta = cardMeta(service.slug);
    const href = soporte.url({
        query: { servicio: service.slug },
    });

    return (
        <>
            <MobileServiceCard
                title={service.title}
                description={meta.shortDescription ?? service.description}
                label={meta.label}
                icon={meta.icon}
                action={meta.action}
                href={href}
                image={image}
            />

            <article className="relative hidden min-h-56 items-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-sm sm:flex dark:bg-black">
                <ServiceArtwork src={image} />
                <div className="relative z-10 flex min-h-56 w-[56%] flex-col justify-center p-5">
                    <h2 className="text-lg font-bold tracking-tight text-white">
                        {service.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75">
                        {service.description}
                    </p>
                    <Link
                        href={href}
                        className="mt-4 inline-flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition hover:opacity-90"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        <CalendarDays className="size-3.5" strokeWidth={1.75} />
                        Solicitar servicio
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>
            </article>
        </>
    );
}

export default function Mantenimiento({
    servicios,
}: {
    servicios: MaintenanceService[];
}) {
    return (
        <>
            <Head title="Mantenimiento" />

            <section className="relative overflow-hidden bg-neutral-950">
                <img
                    src={HERO_IMAGE}
                    alt=""
                    className="pointer-events-none absolute top-1/2 right-0 hidden h-auto w-auto max-h-full max-w-[72%] -translate-y-1/2 object-contain object-right md:block"
                    aria-hidden="true"
                />

                <div
                    className={`relative z-10 mx-auto ${CONTENT_WIDTH} py-8 sm:py-10 lg:py-12`}
                >
                    <div className="max-w-3xl animate-[fade-up_0.7s_ease-out] md:max-w-[62%]">
                        <p
                            className="text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                            style={{ color: BRAND_COLOR }}
                        >
                            Nuestros servicios más solicitados
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                            Soporte técnico para equipos de diagnóstico por
                            imagen
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                            Contamos con ingenieros especializados y
                            capacitados por marcas líderes a nivel mundial.
                        </p>
                        <div
                            className="mt-4 h-1 w-14 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <p className="mt-4 text-sm leading-relaxed text-white/90 sm:text-base">
                        Nuestro equipo brinda acompañamiento durante cada etapa del servicio ofreciendo atención especializada y soluciones adecuadas a cada equipo e institución medica.
                        </p>
                    </div>
                </div>
            </section>

            <section className="border-b border-white/10 bg-neutral-950 py-10 dark:bg-black sm:py-12">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Modalidades que atendemos
                    </h2>
                    <div
                        className="mt-3 h-1 w-14 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                    />
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                        Brindamos soporte técnico especializado para equipos de:
                    </p>
                    <ul className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-white sm:text-[15px]">
                        {attendedModalities.map((modality, index) => (
                            <li
                                key={modality}
                                className="inline-flex items-center gap-2"
                            >
                                {index > 0 && (
                                    <span
                                        className="select-none"
                                        style={{ color: BRAND_COLOR }}
                                        aria-hidden="true"
                                    >
                                        ·
                                    </span>
                                )}
                                <span className="font-medium">{modality}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section
                className={`mx-auto ${CONTENT_WIDTH} py-10 sm:py-12 lg:py-14`}
            >
                <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
                    <MobileServiceCard
                        title="Suministro y venta de refacciones"
                        description="Componentes para equipos de imagen médica."
                        label="Refacciones"
                        icon={Package}
                        action="Solicitar refacción"
                        href={refacciones.url()}
                        image={cardImage(REFACCION_SLUG)}
                    />

                    <article className="relative hidden min-h-44 items-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-sm sm:col-span-2 sm:flex sm:items-center lg:col-span-3 dark:bg-black">
                        <ServiceArtwork src={cardImage(REFACCION_SLUG)} />
                        <div className="relative z-10 flex w-[56%] flex-col items-start justify-center p-5 sm:py-6 sm:pl-6">
                            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                                {refaccionService.title}
                            </h2>
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75">
                                {refaccionService.description}
                            </p>
                            <Link
                                href={refacciones.url()}
                                className="mt-4 inline-flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition hover:opacity-90"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                <Package className="size-4" strokeWidth={1.75} />
                                Solicitar refacción
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </article>
                    {servicios
                        .filter((service) => service.slug !== REFACCION_SLUG)
                        .map((service) => (
                            <ServiceCard
                                key={service.slug}
                                service={service}
                            />
                        ))}
                </div>
            </section>

            <section
                className={`mx-auto ${CONTENT_WIDTH} max-w-6xl pb-12 lg:pb-16`}
            >
                <div
                    id="contacto"
                    className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 sm:flex-row sm:items-center sm:px-6 dark:border-neutral-800 dark:bg-neutral-900/80"
                >
                    <div className="flex items-start gap-4 sm:items-center">
                        <span
                            className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            <Headphones className="size-5" strokeWidth={1.75} />
                        </span>
                        <p className="text-sm leading-relaxed text-gray-700 sm:text-base dark:text-gray-200">
                            ¿Necesita asesoría o atención inmediata? Nuestro
                            equipo está listo para ayudarle.
                        </p>
                    </div>

                    <Link
                        href={contacto()}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-[#0a7c4a]/5 dark:bg-neutral-950"
                        style={{
                            borderColor: BRAND_COLOR,
                            color: BRAND_COLOR,
                        }}
                    >
                        Contáctenos
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>

            <style>{`
                @keyframes fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
