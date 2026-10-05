import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Headphones,
    Layers,
    Monitor,
    Settings,
    Target,
    Users,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import { useMemo, type CSSProperties } from 'react';
import {
    BRAND_COLOR,
    CONTENT_WIDTH,
    type ManufacturerItem,
} from '@/data/equipment';
import { contacto, mantenimiento, sobreNosotros } from '@/routes';
import {
    equipos as bibliotecaEquipos,
    equiposDisponibles,
} from '@/routes/biblioteca';

const HERO_BANNER = '/Imagen/Body/2149341486.jpg';
const SERVICIOS_CARD_IMAGE = `/Imagen/Servicios/${encodeURIComponent('Imagen de ChatGPT 27 sept 2026, 04_37_57 p.m..png')}`;
const MODALIDADES_CARD_IMAGE = `/Imagen/Servicios/${encodeURIComponent('Imagen de ChatGPT 27 sept 2026, 04_57_16 p.m..png')}`;
const EQUIPOS_CARD_IMAGE = `/Imagen/Servicios/${encodeURIComponent('Imagen de ChatGPT 27 sept 2026, 05_07_19 p.m..png')}`;
const NOSOTROS_IMAGE = '/Imagen/Body/Body.png';
const MISION_IMAGE = `/Imagen/empresa/${encodeURIComponent('ChatGPT Image 20 sept 2026, 01_19_34 p.m..png')}`;

const heroHighlights: {
    title: string;
    icon: LucideIcon;
}[] = [
    { title: 'Mantenimiento especializado', icon: Wrench },
    { title: 'Instalación y puesta en marcha', icon: Settings },
    { title: 'Capacitación', icon: Users },
    { title: 'Soporte técnico', icon: Headphones },
];

const exploreCards: {
    title: string;
    description: string;
    href: string;
    action: string;
    icon: LucideIcon;
    image?: string;
    imageMaxWidthClass?: string;
    contentMaxWidthClass?: string;
}[] = [
    {
        title: 'SERVICIOS',
        description:
            'Conoce nuestras soluciones de mantenimiento y soporte técnico.',
        href: mantenimiento.url(),
        action: 'Ver servicios',
        icon: Wrench,
        image: SERVICIOS_CARD_IMAGE,
    },
    {
        title: 'MODALIDADES',
        description:
            'Consulta las modalidades para las que ofrecemos soluciones técnicas.',
        href: bibliotecaEquipos.url(),
        action: 'Ver modalidades',
        icon: Layers,
        image: MODALIDADES_CARD_IMAGE,
        imageMaxWidthClass: 'max-w-[58%]',
    },
    {
        title: 'EQUIPOS DISPONIBLES',
        description:
            'Explora los equipos que ofrecemos y consulta sus características y condiciones comerciales.',
        href: equiposDisponibles.url(),
        action: 'Ver equipos',
        icon: Monitor,
        image: EQUIPOS_CARD_IMAGE,
        contentMaxWidthClass: 'max-w-[66%]',
    },
];

function HomeSpotlightCard({
    title,
    description,
    href,
    action,
    image,
    icon: Icon,
}: {
    title: string;
    description: string;
    href: string;
    action: string;
    image: string;
    icon: LucideIcon;
}) {
    return (
        <article className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
            <div className="relative h-40 overflow-hidden sm:hidden">
                <img
                    src={image}
                    alt=""
                    className="size-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/35 to-transparent" />
            </div>
            <div
                className="pointer-events-none absolute inset-0 hidden sm:block"
                aria-hidden="true"
            >
                <img
                    src={image}
                    alt=""
                    className="absolute inset-0 size-full scale-110 object-cover object-right opacity-50 blur-2xl [mask-image:linear-gradient(to_right,transparent_38%,black_68%)] [-webkit-mask-image:linear-gradient(to_right,transparent_38%,black_68%)]"
                />
                <img
                    src={image}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-right [mask-image:linear-gradient(to_right,transparent_46%,black_74%)] [-webkit-mask-image:linear-gradient(to_right,transparent_46%,black_74%)]"
                />
                <div className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-neutral-900 from-42% via-neutral-900/80 via-72% to-transparent" />
            </div>
            <div className="relative z-10 flex min-h-0 min-w-0 items-start gap-3 p-5 sm:min-h-[188px] sm:max-w-[62%] sm:gap-4 sm:p-6">
                <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: BRAND_COLOR }}
                >
                    <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                    <h2 className="text-sm font-bold tracking-wide text-white sm:text-base">
                        {title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-sm">
                        {description}
                    </p>
                    <Link
                        href={href}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition hover:opacity-80"
                    >
                        {action}
                        <ArrowRight
                            className="size-4"
                            style={{ color: BRAND_COLOR }}
                        />
                    </Link>
                </div>
            </div>
        </article>
    );
}

function HomeExploreCard({
    title,
    description,
    href,
    action,
    icon: Icon,
    image,
    imageMaxWidthClass = 'max-w-[86%]',
    contentMaxWidthClass = 'max-w-[54%]',
}: {
    title: string;
    description: string;
    href: string;
    action: string;
    icon: LucideIcon;
    image?: string;
    imageMaxWidthClass?: string;
    contentMaxWidthClass?: string;
}) {
    const buttonClassName = `mt-6 mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 ${image ? 'w-fit whitespace-nowrap' : 'w-full sm:w-fit'}`;
    const buttonStyle = { backgroundColor: BRAND_COLOR };
    const label = (
        <>
            {action}
            <ArrowRight className="size-4" />
        </>
    );

    return (
        <article
            className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 ${image ? '' : 'p-6'}`}
        >
            {image ? (
                <img
                    src={image}
                    alt=""
                    className={`pointer-events-none absolute top-1/2 right-0 h-auto w-auto max-h-full -translate-y-1/2 object-contain object-right ${imageMaxWidthClass}`}
                />
            ) : null}
            <div
                className={`relative z-10 flex flex-1 flex-col ${image ? `${contentMaxWidthClass} py-6 pr-2 pl-6` : ''}`}
            >
                <div className="flex items-center gap-3">
                    <span
                        className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="text-sm font-bold tracking-wide text-white sm:text-base">
                        {title}
                    </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                    {description}
                </p>
                {href === '#' ? (
                    <a href="#" className={buttonClassName} style={buttonStyle}>
                        {label}
                    </a>
                ) : (
                    <Link
                        href={href}
                        className={buttonClassName}
                        style={buttonStyle}
                    >
                        {label}
                    </Link>
                )}
            </div>
        </article>
    );
}

function DigitalLinesBackdrop({ className = '' }: { className?: string }) {
    return (
        <div
            className={`pointer-events-none absolute inset-0 overflow-hidden dark:mix-blend-screen ${className}`}
            aria-hidden="true"
        >
            <div className="absolute inset-y-0 left-0 w-[200%] motion-safe:animate-digital-lines-drift">
                <div className="digital-lines-pattern absolute inset-0 opacity-50 dark:opacity-40" />
            </div>
            <div className="absolute inset-0 opacity-60 dark:opacity-55">
                <span className="digital-pulse-beam absolute top-[12%] left-0 h-px w-2/5 motion-safe:animate-digital-pulse-sweep" />
                <span
                    className="digital-pulse-beam absolute top-[28%] left-0 h-px w-1/3 motion-safe:animate-digital-pulse-sweep-slow"
                    style={{ animationDelay: '1.2s' }}
                />
                <span
                    className="digital-pulse-beam absolute top-[46%] left-0 h-px w-[45%] motion-safe:animate-digital-pulse-sweep"
                    style={{ animationDelay: '2.4s' }}
                />
                <span
                    className="digital-pulse-beam absolute top-[64%] left-0 h-px w-1/4 motion-safe:animate-digital-pulse-sweep-slow"
                    style={{ animationDelay: '0.6s' }}
                />
                <span
                    className="digital-pulse-beam absolute top-[82%] left-0 h-px w-[38%] motion-safe:animate-digital-pulse-sweep"
                    style={{ animationDelay: '3.1s' }}
                />
            </div>
        </div>
    );
}

function buildManufacturerCarouselSequence(
    items: ManufacturerItem[],
): ManufacturerItem[] {
    if (items.length === 0) {
        return [];
    }

    const copies = Math.max(2, Math.ceil(4 / items.length));

    return Array.from({ length: copies }, () => items).flat();
}

function ManufacturerCard({
    name,
    image,
}: {
    name: string;
    image: string | null;
}) {
    return (
        <div className="group flex h-36 w-full items-center justify-center sm:h-40 lg:h-52 xl:h-56">
            {image ? (
                <img
                    src={image}
                    alt={name}
                    className="max-h-full max-w-full object-contain opacity-80 transition-[opacity,transform] duration-300 ease-out group-hover:scale-105 group-hover:opacity-100"
                />
            ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    Sin logo
                </div>
            )}
        </div>
    );
}

function ManufacturerCarousel({ items }: { items: ManufacturerItem[] }) {
    const sequence = useMemo(
        () => buildManufacturerCarouselSequence(items),
        [items],
    );
    const loop = useMemo(() => [...sequence, ...sequence], [sequence]);
    const durationSeconds = Math.max(28, sequence.length * 6);

    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-muted-foreground dark:border-neutral-700">
                Pronto publicaremos nuestros fabricantes.
            </div>
        );
    }

    return (
        <div
            className="@container group/carousel relative overflow-hidden"
            style={
                {
                    '--equipment-marquee-duration': `${durationSeconds}s`,
                } as CSSProperties
            }
        >
            <div
                className="flex w-max gap-4 motion-safe:animate-equipment-marquee group-hover/carousel:[animation-play-state:paused] md:gap-7"
                aria-label="Carrusel de fabricantes"
            >
                {loop.map((item, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        className="w-[calc((100cqw-1rem)/2)] shrink-0 sm:w-[calc((100cqw-2rem)/3)] md:w-[calc((100cqw-5.25rem)/4)]"
                        aria-hidden={index >= sequence.length}
                    >
                        <ManufacturerCard
                            name={item.name}
                            image={item.image}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Welcome() {
    const { manufacturerItems } = usePage<{
        manufacturerItems: ManufacturerItem[];
    }>().props;

    return (
        <>
            <Head title="Medical Imaging Group" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-neutral-950">
                <div
                    className="pointer-events-none absolute inset-0 hidden lg:block"
                    aria-hidden="true"
                >
                    <img
                        src={HERO_BANNER}
                        alt=""
                        className="absolute inset-0 size-full scale-110 object-cover object-[center_70%] opacity-50 blur-2xl [mask-image:linear-gradient(to_right,transparent_18%,black_48%,black_82%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent_18%,black_48%,black_82%,transparent)]"
                    />
                    <img
                        src={HERO_BANNER}
                        alt=""
                        className="absolute inset-0 size-full object-cover object-[center_70%] [mask-image:linear-gradient(to_right,transparent_32%,black_58%,black_86%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent_32%,black_58%,black_86%,transparent)]"
                    />
                    <div className="absolute inset-y-0 left-0 w-[46%] bg-gradient-to-r from-neutral-950 from-40% via-neutral-950/70 via-70% to-transparent" />
                    <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-neutral-950 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-neutral-950 to-transparent" />
                </div>

                <div
                    className={`relative z-10 mx-auto grid items-center gap-6 py-6 sm:gap-8 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:gap-6 lg:py-16 ${CONTENT_WIDTH}`}
                >
                    <div className="relative z-10">
                        <div className="max-w-xl">
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                            Ingeniería especializada para equipos de diagnóstico por imagen
                            </h1>
                            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                            En Medical Imaging Group (MIG) somos un equipo de ingenieros 
                            especializados en tecnología de diagnóstico por imagen. Ofrecemos 
                            mantenimiento, diagnóstico técnico, refacciones y otras soluciones 
                            para hospitales, clínicas y gabinetes de imagenología.
                            </p>
                        </div>

                        <div className="relative mt-6 overflow-hidden rounded-2xl lg:hidden">
                            <img
                                src={HERO_BANNER}
                                alt="Equipo de imagenología médica"
                                className="h-52 w-full object-cover object-center sm:h-72"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                        </div>

                        <ul className="mt-8 grid grid-cols-2 items-start gap-4 sm:grid-cols-4 sm:gap-4">
                            {heroHighlights.map(({ title, icon: Icon }) => (
                                <li
                                    key={title}
                                    className="flex min-w-0 flex-col items-start gap-2"
                                >
                                    <span
                                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-white sm:size-10"
                                        style={{ backgroundColor: BRAND_COLOR }}
                                    >
                                        <Icon
                                            className="size-4 sm:size-5"
                                            strokeWidth={1.75}
                                        />
                                    </span>
                                    <span className="text-xs font-medium leading-snug text-white sm:text-xs">
                                        {title}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <Link
                                href={mantenimiento()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                Conocer servicios
                                <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href={contacto()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                Contactar a MIG
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-10 hidden min-h-[420px] items-center justify-end lg:flex">
                        <img
                            src={HERO_BANNER}
                            alt="Equipo de imagenología médica"
                            className="sr-only"
                        />
                    </div>
                </div>
            </section>

            <section className="relative z-20 mt-[10px] bg-neutral-950 pb-8 sm:pb-10">
                <div
                    className={`mx-auto grid gap-4 sm:gap-5 lg:grid-cols-2 ${CONTENT_WIDTH}`}
                >
                    <HomeSpotlightCard
                        title="NOSOTROS"
                        description="Conoce nuestra historia, experiencia y el equipo de profesionales que hacen posible Medical Imaging Group."
                        href={sobreNosotros.url()}
                        action="Conocer más"
                        image={NOSOTROS_IMAGE}
                        icon={Building2}
                    />
                    <HomeSpotlightCard
                        title="NUESTRA MISIÓN"
                        description="Brindar soluciones en imagenología médica con excelencia, compromiso y un enfoque en la mejora continua."
                        href={`${sobreNosotros.url()}#vision`}
                        action="Conocer nuestra visión"
                        image={MISION_IMAGE}
                        icon={Target}
                    />
                </div>
            </section>

            {/* Presentación */}
            <section className="bg-[#05070a] text-white">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <div className="h-px w-full bg-white/10" />

                    <div className="grid items-center gap-8 overflow-visible py-10 sm:gap-10 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:overflow-hidden lg:py-16 xl:gap-10">
                        <div className="max-w-2xl">
                            <p
                                className="text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                                style={{ color: BRAND_COLOR }}
                            >
                                Bienvenidos a Medical Imaging Group
                            </p>
                            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.35rem] lg:leading-tight">
                                Tecnología médica respaldada por experiencia y
                                compromiso
                            </h2>
                            <div
                                className="mt-4 h-1 w-14 rounded-full"
                                style={{ backgroundColor: BRAND_COLOR }}
                            />
                            <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/85 sm:text-base">
                                <p>
                                    En Medical Imaging Group (MIG), entendemos
                                    que detrás de cada equipo de imagen médica
                                    existe una decisión clínica, un profesional
                                    de la salud y, sobre todo, una persona que
                                    necesita atención confiable y oportuna.
                                </p>
                                <p>
                                    Por ello, combinamos ingeniería
                                    especializada, innovación tecnológica y
                                    compromiso humano para mantener la
                                    tecnología médica disponible, segura y con
                                    el desempeño que exige la práctica clínica.
                                </p>
                            </div>

                            <Link
                                href={sobreNosotros()}
                                className="mt-8 inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a7c4a]/10"
                                style={{ borderColor: BRAND_COLOR }}
                            >
                                Conoce más sobre nosotros
                                <ArrowRight
                                    className="size-4"
                                    style={{ color: BRAND_COLOR }}
                                />
                            </Link>
                        </div>

                        <div className="relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-lg lg:max-w-none lg:translate-x-4 lg:scale-105 xl:translate-x-6">
                            {/* Glow suave de fondo */}
                            <div
                                className="pointer-events-none absolute inset-[18%] rounded-full bg-[#0a7c4a]/15 blur-[60px]"
                                aria-hidden="true"
                            />

                            {/* Rejilla sutil de puntos */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)',
                                    backgroundSize: '22px 22px',
                                    maskImage:
                                        'radial-gradient(circle, #000 35%, transparent 72%)',
                                    WebkitMaskImage:
                                        'radial-gradient(circle, #000 35%, transparent 72%)',
                                }}
                                aria-hidden="true"
                            />

                            {/* Anillos HUD + partículas en órbita */}
                            <div
                                className="pointer-events-none absolute inset-[6%] rounded-full border border-white/10"
                                aria-hidden="true"
                            />
                            <div
                                className="pointer-events-none absolute inset-[12%] rounded-full border border-white/[0.07]"
                                aria-hidden="true"
                            />
                            <div
                                className="pointer-events-none absolute inset-[18%] rounded-full border border-[#0a7c4a]/25"
                                aria-hidden="true"
                            />

                            {/* Imagen con borde difuminado */}
                            <div
                                className="absolute inset-[8%] z-10"
                                style={{
                                    maskImage:
                                        'radial-gradient(circle closest-side, #000 62%, rgba(0,0,0,0.55) 78%, transparent 96%)',
                                    WebkitMaskImage:
                                        'radial-gradient(circle closest-side, #000 62%, rgba(0,0,0,0.55) 78%, transparent 96%)',
                                }}
                            >
                                <img
                                    src="/Imagen/Body/rayos.png"
                                    alt="Imagen médica de rayos X"
                                    className="size-full object-contain object-center mix-blend-screen"
                                />
                            </div>

                            {/* Órbita externa */}
                            <div
                                className="pointer-events-none absolute inset-[6%] z-20 motion-safe:animate-orbit-spin"
                                style={
                                    {
                                        '--orbit-duration': '22s',
                                    } as CSSProperties
                                }
                                aria-hidden="true"
                            >
                                <span
                                    className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_14px_rgba(10,124,74,1)]"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                />
                                <span className="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55" />
                            </div>

                            {/* Órbita media (sentido contrario) */}
                            <div
                                className="pointer-events-none absolute inset-[12%] z-20 motion-safe:animate-orbit-spin-reverse"
                                style={
                                    {
                                        '--orbit-duration': '16s',
                                    } as CSSProperties
                                }
                                aria-hidden="true"
                            >
                                <span
                                    className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_14px_rgba(10,124,74,1)]"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                />
                                <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/70" />
                            </div>

                            {/* Órbita interna */}
                            <div
                                className="pointer-events-none absolute inset-[18%] z-20 motion-safe:animate-orbit-spin"
                                style={
                                    {
                                        '--orbit-duration': '11s',
                                    } as CSSProperties
                                }
                                aria-hidden="true"
                            >
                                <span
                                    className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(10,124,74,0.95)]"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/10" />
                </div>
            </section>

            {/* Servicios más solicitados */}
            <section className="relative w-full overflow-hidden bg-white py-10 dark:bg-neutral-950 sm:py-12 lg:py-16">
                <DigitalLinesBackdrop />
                <div className={`relative z-10 mx-auto ${CONTENT_WIDTH}`}>
                    <p className="text-xs font-bold tracking-wider text-[#0a7c4a]">
                        NUESTROS SERVICIOS MÁS SOLICITADOS
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
                        Productos y soluciones diseñados para usted
                    </h2>
                    <div
                        className="mt-3 h-1 w-12 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                    />

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {exploreCards.map((card) => (
                            <HomeExploreCard key={card.title} {...card} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Carrusel de fabricantes */}
            <section className="relative w-full overflow-hidden bg-white py-10 dark:bg-neutral-950 sm:py-12 lg:py-16">
                <DigitalLinesBackdrop />
                <div className="relative z-10">
                    <div className={`mx-auto ${CONTENT_WIDTH}`}>
                        <p className="text-xs font-bold tracking-wider text-[#0a7c4a]">
                            ALIANZAS TECNOLÓGICAS
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
                            Fabricantes que respaldan nuestra gama de productos
                        </h2>
                        <div
                            className="mt-3 h-1 w-12 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                    </div>
                    <div className="mt-8 w-full">
                        <ManufacturerCarousel items={manufacturerItems} />
                    </div>
                </div>
            </section>
        </>
    );
}
