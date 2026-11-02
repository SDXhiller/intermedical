import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    Award,
    Calendar,
    ClipboardList,
    Compass,
    Eye,
    Handshake,
    HardHat,
    Heart,
    Home,
    Layers,
    MessageCircle,
    Radiation,
    Scale,
    Search,
    ShieldCheck,
    Target,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteBreadcrumb } from '@/components/site-breadcrumb';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home, mantenimiento } from '@/routes';

const HERO_IMAGE = '/Imagen/Body/rayos.png';

const workStepImagePool: {
    src: string;
    imageClassName: string;
}[] = [
    {
        src: `/Imagen/empresa/${encodeURIComponent('ChatGPT Image 20 sept 2026, 01_19_34 p.m..png')}`,
        imageClassName: 'object-cover object-right',
    },
    {
        src: `/Imagen/empresa/${encodeURIComponent('sobre nosotros.jpg')}`,
        imageClassName: 'object-cover object-[42%_center]',
    },
    {
        src: `/Imagen/Servicios/${encodeURIComponent('Imagen de ChatGPT 27 sept 2026, 04_57_16 p.m..png')}`,
        imageClassName: 'object-cover object-right',
    },
];

/** Mezcla estable (misma asignación en cliente/servidor) de las 3 rutas a las 3 tarjetas. */
function shuffleWorkStepImages<T>(items: T[], seed = 17): T[] {
    const copy = [...items];
    let state = seed;

    const next = (): number => {
        state = (state * 16807) % 2147483647;

        return (state - 1) / 2147483646;
    };

    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(next() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
}

const assignedWorkStepImages = shuffleWorkStepImages(workStepImagePool);

const highlights: {
    title: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        title: 'Experiencia desde 2019',
        description:
            'Desde 2019 ofrecemos servicios de mantenimiento, diagnóstico técnico y otras soluciones para equipos de imagenología.',
        icon: Calendar,
    },
    {
        title: 'Ingeniería especializada',
        description:
            'Contamos con ingenieros especializados y capacitados por algunas de las principales marcas de tecnología médica a nivel mundial.',
        icon: HardHat,
    },
    {
        title: 'Soporte multimodalidad y multimarca',
        description:
            'Atendemos distintas modalidades y marcas de equipos de diagnóstico por imagen, según sus características y el alcance de nuestros servicios.',
        icon: Layers,
    },
    {
        title: 'Licencia CNSNS',
        description:
            'Contamos con licencia de la Comisión Nacional de Seguridad Nuclear y Salvaguardias para brindar soporte a equipos de medicina nuclear, conforme al alcance autorizado.',
        icon: Radiation,
    },
];

const workSteps: {
    title: string;
    description: string;
    icon: LucideIcon;
    image: string;
    imageClassName: string;
}[] = [
    {
        title: 'Evaluación técnica',
        description:
            'Analizamos las necesidades de cada equipo para ofrecer la mejor solución, con diagnóstico preciso y personalizado.',
        icon: Search,
        image: assignedWorkStepImages[0].src,
        imageClassName: assignedWorkStepImages[0].imageClassName,
    },
    {
        title: 'Comunicación clara',
        description:
            'Mantenemos una comunicación directa con el cliente en cada etapa del servicio, informando avances, hallazgos y recomendaciones.',
        icon: MessageCircle,
        image: assignedWorkStepImages[1].src,
        imageClassName: assignedWorkStepImages[1].imageClassName,
    },
    {
        title: 'Documentación técnica',
        description:
            'Registramos las actividades realizadas, generando reportes técnicos y evidencia del servicio para tu control y seguimiento.',
        icon: ClipboardList,
        image: assignedWorkStepImages[2].src,
        imageClassName: assignedWorkStepImages[2].imageClassName,
    },
];

const philosophyItems: {
    id: string;
    title: string;
    icon: LucideIcon;
    image: string;
    imageClassName: string;
    description: ReactNode;
}[] = [
    {
        id: 'objetivo',
        title: 'Objetivo',
        icon: Target,
        image: '/Imagen/empresa/objetivo.jpg',
        imageClassName: 'object-cover object-[center_35%]',
        description: (
            <>
                Establecer los principios, valores y lineamientos que orientan
                el actuar de Medical Imaging Group, promoviendo una cultura de{' '}
                <strong className="font-semibold text-white">
                    ética, responsabilidad, seguridad, excelencia técnica y
                    mejora continua
                </strong>{' '}
                en cada una de nuestras actividades.
            </>
        ),
    },
    {
        id: 'mision',
        title: 'Misión',
        icon: Compass,
        image: '/Imagen/empresa/mision.jpg',
        imageClassName: 'object-cover object-center',
        description:
            'Mantener la tecnología de imagen médica segura, confiable y disponible, mediante ingeniería especializada, innovación y un servicio cercano que contribuya a una atención médica eficiente y oportuna.',
    },
    {
        id: 'vision',
        title: 'Visión',
        icon: Eye,
        image: '/Imagen/empresa/vision.jpg',
        imageClassName: 'object-cover object-[62%_center]',
        description:
            'Ser una empresa referente en México en ingeniería y soporte de tecnología de diagnóstico por imagen, reconocida por su innovación, experiencia y compromiso con una atención médica más confiable y accesible.',
    },
];

const valores: {
    title: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        title: 'Compromiso',
        description: 'Con la calidad y el servicio.',
        icon: Handshake,
    },
    {
        title: 'Profesionalismo',
        description: 'En cada intervención técnica.',
        icon: Users,
    },
    {
        title: 'Responsabilidad',
        description: 'En el cumplimiento y la seguridad.',
        icon: ShieldCheck,
    },
    {
        title: 'Honestidad',
        description: 'En nuestra comunicación.',
        icon: Scale,
    },
    {
        title: 'Servicio',
        description: 'Siempre enfocado en el cliente.',
        icon: Heart,
    },
    {
        title: 'Lealtad',
        description: 'En nuestras relaciones a largo plazo.',
        icon: Award,
    },
];

function HighlightCard({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
}) {
    return (
        <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
            <span
                className="flex size-11 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: BRAND_COLOR }}
            >
                <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-base font-bold leading-snug text-white">
                {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
                {description}
            </p>
        </article>
    );
}

function WorkStepCard({
    title,
    description,
    icon: Icon,
    image,
    imageClassName,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    image: string;
    imageClassName: string;
}) {
    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition-all duration-300 hover:border-white/20">
            <div className="relative aspect-video overflow-hidden bg-neutral-950">
                <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className={`absolute inset-0 size-full ${imageClassName} transition-transform duration-500 group-hover:scale-105`}
                />
                <div
                    className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/25 to-transparent"
                    aria-hidden="true"
                />
                <span
                    className="absolute bottom-3 left-3 flex size-11 items-center justify-center rounded-full text-white ring-2 ring-neutral-900/80"
                    style={{ backgroundColor: BRAND_COLOR }}
                >
                    <Icon className="size-5" strokeWidth={1.75} />
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {description}
                </p>
            </div>
        </article>
    );
}


function PhilosophyCard({
    id,
    title,
    icon: Icon,
    image,
    imageClassName,
    children,
}: {
    id: string;
    title: string;
    icon: LucideIcon;
    image: string;
    imageClassName: string;
    children: ReactNode;
}) {
    return (
        <article
            id={id}
            className="group flex h-full scroll-mt-40 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#171717] transition-all duration-300 hover:border-white/20 hover:shadow-xl"
        >
            {/* Imagen panorámica */}
            <div className="relative h-32 shrink-0 overflow-hidden bg-neutral-950 sm:h-36 lg:h-36">
                <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full ${imageClassName} transition-transform duration-500 group-hover:scale-105`}
                />

                {/* Degradado inferior */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/10 to-transparent"
                    aria-hidden="true"
                />

                {/* Icono */}
                <span
                    className="absolute bottom-3 left-5 flex size-10 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-[#171717]"
                    style={{ backgroundColor: BRAND_COLOR }}
                >
                    <Icon className="size-5" strokeWidth={1.75} />
                </span>
            </div>

            {/* Contenido */}
            <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
                <h3 className="text-lg font-bold tracking-tight text-white">
                    {title}
                </h3>

                <div className="mt-2 text-sm leading-relaxed text-white/70">
                    {children}
                </div>
            </div>
        </article>
    );
}


function ValueCard({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
}) {
    return (
        <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-5">
            <span
                className="flex size-10 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: BRAND_COLOR }}
            >
                <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/70 sm:text-sm">
                {description}
            </p>
        </article>
    );
}

export default function Sobrenosotros() {
    return (
        <>
            <Head title="Sobre nosotros" />

            <section className="relative overflow-hidden bg-neutral-950">
                <div
                    className={`relative mx-auto grid items-center gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:py-14 ${CONTENT_WIDTH}`}
                >
                    <div className="relative z-10 min-w-0">
                        <SiteBreadcrumb
                            items={[
                                { label: 'Inicio', href: home.url(), icon: Home },
                                { label: 'Nosotros', icon: Users },
                            ]}
                        />

                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
                            Sobre nosotros
                        </h1>
                        <p
                            className="mt-3 text-base font-medium sm:text-lg"
                            style={{ color: BRAND_COLOR }}
                        >
                            Ingeniería especializada para imagenología
                        </p>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                            Medical Imaging Group (MIG) brinda soluciones
                            técnicas para equipos de diagnóstico por imagen en
                            hospitales, clínicas y gabinetes de imagenología.
                            Nuestro compromiso es mantener tu equipo en las
                            mejores condiciones, con un servicio confiable,
                            profesional y enfocado en la continuidad de la
                            atención médica.
                        </p>

                        <Link
                            href={mantenimiento()}
                            className="mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            Conoce nuestros servicios
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    <div className="relative min-h-[220px] overflow-hidden sm:min-h-[260px] lg:min-h-[320px]">
                        <div
                            className="pointer-events-none absolute inset-0"
                            aria-hidden="true"
                        >
                            <img
                                src={HERO_IMAGE}
                                alt=""
                                className="absolute inset-0 size-full scale-110 object-cover object-right opacity-50 blur-2xl [mask-image:linear-gradient(to_right,transparent_8%,black_42%)] [-webkit-mask-image:linear-gradient(to_right,transparent_8%,black_42%)]"
                            />
                            <img
                                src={HERO_IMAGE}
                                alt="Radiografía de tórax"
                                className="absolute inset-0 size-full object-cover object-right [mask-image:linear-gradient(to_right,transparent_12%,black_48%)] [-webkit-mask-image:linear-gradient(to_right,transparent_12%,black_48%)]"
                            />
                            <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-neutral-950 from-20% via-neutral-950/75 via-70% to-transparent" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-neutral-950 pb-10 sm:pb-12">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                        {highlights.map((item) => (
                            <HighlightCard key={item.title} {...item} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-neutral-950 pb-10 sm:pb-12 lg:pb-16">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Nuestra forma de trabajar
                        </h2>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
                        {workSteps.map((step) => (
                            <WorkStepCard key={step.title} {...step} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-neutral-950 pb-12 sm:pb-14 lg:pb-16">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Nuestra filosofía
                        </h2>
                    </div>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {philosophyItems.map((item) => (
                            <PhilosophyCard
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                icon={item.icon}
                                image={item.image}
                                imageClassName={item.imageClassName}
                            >
                                {item.description}
                            </PhilosophyCard>
                        ))}
                    </div>

                    <div id="valores" className="mt-10 scroll-mt-40 sm:mt-12">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                Nuestros valores
                            </h3>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
                            {valores.map((valor) => (
                                <ValueCard key={valor.title} {...valor} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
