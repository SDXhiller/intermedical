import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CircleCheck,
    Clock,
    Cog,
    Drill,
    Headphones,
    MonitorSmartphone,
    PackageMinus,
    ScanSearch,
    Settings,
    Settings2,
    ShieldCheck,
    Target,
    Users,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import { useMemo, type CSSProperties, type ReactNode } from 'react';
import {
    BRAND_COLOR,
    CONTENT_WIDTH,
    type EquipmentItem,
    type ManufacturerItem,
} from '@/data/equipment';
import { maintenanceServices } from '@/data/maintenance-services';
import { contacto, mantenimiento, sobreNosotros } from '@/routes';
import { index as equiposIndex } from '@/routes/equipos';

function CorrectiveMaintenanceIcon({
    className,
    style,
}: {
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <span
            className={`relative inline-flex shrink-0 items-center justify-center ${className ?? 'size-[18px]'}`}
        >
            <Wrench
                className="absolute size-4 -rotate-45"
                style={style}
                strokeWidth={1.75}
            />
            <Drill
                className="absolute size-4 rotate-45"
                style={style}
                strokeWidth={1.75}
            />
        </span>
    );
}

type PopularService = {
    title: string;
    slug: string;
    icon?: LucideIcon;
    customIcon?: ReactNode;
    features: string[];
};

const serviceVisuals: Record<
    string,
    { icon?: LucideIcon; customIcon?: ReactNode }
> = {
    'mantenimiento-preventivo': {
        icon: Cog,
    },
    'mantenimiento-correctivo': {
        customIcon: (
            <CorrectiveMaintenanceIcon
                className="size-5"
                style={{ color: 'white' }}
            />
        ),
    },
    diagnostico: {
        icon: ScanSearch,
    },
    'renta-de-equipos-medicos': {
        icon: MonitorSmartphone,
    },
    instalacion: {
        icon: Settings2,
    },
    desinstalacion: {
        icon: PackageMinus,
    },
    'puesta-en-marcha': {
        icon: ShieldCheck,
    },
};

const popularServices: PopularService[] = maintenanceServices.map((service) => {
    const visual = serviceVisuals[service.slug] ?? {
        icon: Cog,
    };

    return {
        title: service.title,
        slug: service.slug,
        features: service.features,
        ...visual,
    };
});

const HERO_BANNER = `/Imagen/Body/${encodeURIComponent('banner principal.jpg')}`;
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
        <article className="relative isolate min-h-[168px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 sm:min-h-[188px]">
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
            <div className="relative z-10 flex min-w-0 max-w-[62%] items-start gap-3 p-5 sm:gap-4 sm:p-6">
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

function FeatureItem({ feature }: { feature: string }) {
    return (
        <div className="flex min-w-0 items-start gap-2 text-xs leading-snug text-muted-foreground sm:text-sm">
            <CircleCheck
                className="mt-0.5 size-4 shrink-0"
                style={{ color: BRAND_COLOR }}
                strokeWidth={2}
            />
            <span>{feature}</span>
        </div>
    );
}

function PopularServiceCard({
    title,
    slug,
    icon: Icon,
    customIcon,
    features,
}: PopularService) {
    const [firstFeature, secondFeature, thirdFeature] = features;

    return (
        <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 opacity-75 transition-opacity hover:opacity-100 focus-within:opacity-100 active:opacity-100 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
            <div className="flex items-center gap-2.5">
                <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-md"
                    style={{ backgroundColor: BRAND_COLOR }}
                >
                    {customIcon ??
                        (Icon && (
                            <Icon className="size-5" strokeWidth={1.75} />
                        ))}
                </div>
                <span
                    className="shrink-0 text-sm font-semibold"
                    style={{ color: BRAND_COLOR }}
                    aria-hidden="true"
                >
                    -
                </span>
                <h3 className="min-w-0 text-base font-bold leading-snug text-gray-900 dark:text-white sm:text-lg">
                    {title}
                </h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
                {firstFeature && <FeatureItem feature={firstFeature} />}
                {secondFeature && <FeatureItem feature={secondFeature} />}
                {thirdFeature && <FeatureItem feature={thirdFeature} />}
                <div>
                    <p className="text-xs text-muted-foreground">
                        Tiempo de respuesta
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                        <Clock
                            className="size-4 shrink-0"
                            style={{ color: BRAND_COLOR }}
                            strokeWidth={1.75}
                        />
                        -
                    </p>
                </div>
            </div>

            <Link
                href={contacto.url({ query: { tipo: slug } })}
                className="mt-auto inline-flex w-full items-center justify-center gap-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#0a7c4a]/5"
                style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}
            >
                Solicitar servicio
                <ArrowRight className="size-4" />
            </Link>
        </div>
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

function EquipmentCard({
    name,
    slug,
    image,
}: {
    name: string;
    slug: string;
    image: string | null;
}) {
    return (
        <Link
            href={equiposIndex.url(slug)}
            className="group flex h-full flex-col gap-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-2 text-gray-900 opacity-75 transition-[opacity,box-shadow,border-color] hover:border-[#0a7c4a]/30 hover:opacity-100 hover:shadow-sm focus-visible:opacity-100 active:opacity-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white lg:gap-3 lg:p-4"
        >
            <div className="h-36 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-neutral-800 sm:h-40 lg:h-52 xl:h-56">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="size-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        Sin imagen
                    </div>
                )}
            </div>
            <div className="px-1 lg:px-2">
                <p className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-gray-900 dark:text-white dark:group-hover:text-white lg:text-base">
                    {name}
                </p>
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-[#0a7c4a] group-hover:underline lg:text-sm">
                    Ver equipos
                    <ArrowRight className="size-3 lg:size-3.5" />
                </span>
            </div>
        </Link>
    );
}

function buildCarouselSequence(items: EquipmentItem[]): EquipmentItem[] {
    if (items.length === 0) {
        return [];
    }

    const copies = Math.max(2, Math.ceil(4 / items.length));

    return Array.from({ length: copies }, () => items).flat();
}

function EquipmentCarousel({ items }: { items: EquipmentItem[] }) {
    const sequence = useMemo(() => buildCarouselSequence(items), [items]);
    const loop = useMemo(() => [...sequence, ...sequence], [sequence]);
    const durationSeconds = Math.max(28, sequence.length * 6);

    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-muted-foreground dark:border-neutral-700">
                Pronto publicaremos los equipos disponibles.
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
                aria-label="Carrusel de equipos médicos"
            >
                {loop.map((item, index) => (
                    <div
                        key={`${item.slug}-${index}`}
                        className="w-[calc((100cqw-1rem)/2)] shrink-0 sm:w-[calc((100cqw-2rem)/3)] md:w-[calc((100cqw-5.25rem)/4)]"
                        aria-hidden={index >= sequence.length}
                    >
                        <EquipmentCard
                            name={item.name}
                            slug={item.slug}
                            image={item.image}
                        />
                    </div>
                ))}
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
    const { equipmentItems, manufacturerItems } = usePage<{
        equipmentItems: EquipmentItem[];
        manufacturerItems: ManufacturerItem[];
    }>().props;

    return (
        <>
            <Head title="Medical Imaging Group" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-neutral-950">
                <div
                    className="pointer-events-none absolute inset-0"
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
                    className={`relative z-10 mx-auto grid items-center gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:gap-6 lg:py-16 ${CONTENT_WIDTH}`}
                >
                    <div className="relative z-10">
                        <div className="max-w-xl">
                            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                                Tecnología que impulsa la salud
                            </h1>
                            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                                En Medical Imaging Group ofrecemos soluciones
                                integrales en equipamiento médico, mantenimiento,
                                instalación y soporte especializado en
                                imagenología.
                            </p>
                        </div>

                        <ul className="mt-8 grid grid-cols-4 items-start gap-3 sm:gap-4">
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
                                    <span className="text-[11px] font-medium leading-snug text-white sm:text-xs">
                                        {title}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href={mantenimiento()}
                            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            Conocer nuestros servicios
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    <div className="relative z-10 flex min-h-[220px] items-end justify-end sm:min-h-[280px] lg:min-h-[420px] lg:items-center">
                        <img
                            src={HERO_BANNER}
                            alt="Equipo de imagenología médica"
                            className="sr-only"
                        />
                        <div className="w-full max-w-[15.5rem] pb-2 lg:pb-0 xl:max-w-[17rem]">
                            <h2 className="text-2xl font-bold leading-tight text-white sm:text-[1.7rem]">
                                Soluciones en Imagenología Médica
                            </h2>
                            <p
                                className="mt-3 text-sm font-medium"
                                style={{ color: BRAND_COLOR }}
                            >
                                Equipos · Servicios · Soporte
                            </p>
                            <p className="mt-4 text-sm italic leading-relaxed text-white/85">
                                “Comprometidos con el diagnóstico y la vida”
                            </p>
                        </div>
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

            {/* Carrusel de productos */}
            <section className="relative w-full overflow-hidden bg-white py-12 dark:bg-neutral-950 lg:py-16">
                <DigitalLinesBackdrop />
                <div className={`relative z-10 mx-auto ${CONTENT_WIDTH}`}>
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white lg:mb-8 lg:text-3xl">
                        Equipos disponibles
                    </h2>
                    <EquipmentCarousel items={equipmentItems} />
                </div>
            </section>

            {/* Presentación */}
            <section className="bg-[#05070a] text-white">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <div className="h-px w-full bg-white/10" />

                    <div className="grid items-center gap-10 overflow-visible py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:overflow-hidden lg:py-16 xl:gap-10">
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

                        <div className="relative mx-auto aspect-square w-full max-w-lg lg:max-w-none lg:translate-x-4 lg:scale-105 xl:translate-x-6">
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
            <section className="relative w-full overflow-hidden bg-white py-12 dark:bg-neutral-950 lg:py-16">
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
                        {popularServices.map((service) => (
                            <PopularServiceCard
                                key={service.slug}
                                {...service}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Carrusel de fabricantes */}
            <section className="relative w-full overflow-hidden bg-white py-12 dark:bg-neutral-950 lg:py-16">
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
