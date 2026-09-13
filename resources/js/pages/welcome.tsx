import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Box,
    CircleCheck,
    Clock,
    Cog,
    Drill,
    GraduationCap,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { GlobalSearchBar } from '@/components/global-search-bar';
import {
    BRAND_COLOR,
    CONTENT_WIDTH,
    type EquipmentItem,
    type ManufacturerItem,
} from '@/data/equipment';
import { contacto, sobreNosotros } from '@/routes';
import { index as equiposIndex } from '@/routes/equipos';

const MIG_HORIZONTAL_ORIGINAL = '/Imagen/Logos/MIG-horizontal-original.png';

function maintenanceImage(filename: string): string {
    return `/Imagen/Mantenimiento/${encodeURIComponent(filename)}`;
}

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
    image: string;
    icon?: LucideIcon;
    customIcon?: ReactNode;
    features: string[];
    responseTime: string;
    responseTimeBold?: boolean;
};

const popularServices: PopularService[] = [
    {
        title: 'Mantenimiento preventivo',
        slug: 'mantenimiento-preventivo',
        image: maintenanceImage('Mantenimeinto preventivo.png'),
        icon: Cog,
        features: ['Revisión general', 'Calibración', 'Limpieza y ajustes'],
        responseTime: '24 - 48 horas',
    },
    {
        title: 'Mantenimiento correctivo',
        slug: 'mantenimiento-correctivo',
        image: maintenanceImage('mantenimiento correctivo.png'),
        customIcon: (
            <CorrectiveMaintenanceIcon
                className="size-5"
                style={{ color: 'white' }}
            />
        ),
        features: [
            'Diagnóstico especializado',
            'Reparación de fallas',
            'Refacciones originales',
        ],
        responseTime: 'Según diagnóstico',
        responseTimeBold: true,
    },
    {
        title: 'Instalación',
        slug: 'instalacion',
        image: maintenanceImage('Instalacion y puesta en marca.png'),
        icon: Box,
        features: [
            'Configuración completa',
            'Pruebas de funcionamiento',
            'Capacitación básica',
        ],
        responseTime: 'Programado',
    },
    {
        title: 'Diagnóstico',
        slug: 'diagnostico',
        image: maintenanceImage('capacitacion tecnica.png'),
        icon: GraduationCap,
        features: [
            'Evaluación del equipo',
            'Origen de la falla',
            'Alternativas de solución',
        ],
        responseTime: '24 - 48 horas',
    },
];

function PopularServiceCard({
    title,
    slug,
    image,
    icon: Icon,
    customIcon,
    features,
    responseTime,
    responseTimeBold = false,
}: PopularService) {
    return (
        <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 opacity-75 transition-opacity hover:opacity-100 focus-within:opacity-100 active:opacity-100 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
            <div className="flex gap-4">
                <div className="relative shrink-0">
                    <img
                        src={image}
                        alt={title}
                        className="h-28 w-32 rounded-lg object-cover object-center sm:h-32 sm:w-36"
                    />
                    <div
                        className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full text-white shadow-md"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        {customIcon ??
                            (Icon && (
                                <Icon className="size-5" strokeWidth={1.75} />
                            ))}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold leading-snug text-gray-900 dark:text-white sm:text-lg">
                        {title}
                    </h3>
                    <ul className="mt-3 space-y-1.5">
                        {features.map((feature) => (
                            <li
                                key={feature}
                                className="flex items-start gap-2 text-xs leading-snug text-muted-foreground sm:text-sm"
                            >
                                <CircleCheck
                                    className="mt-0.5 size-4 shrink-0"
                                    style={{ color: BRAND_COLOR }}
                                    strokeWidth={2}
                                />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3">
                        <p className="text-xs text-muted-foreground">
                            Tiempo de respuesta
                        </p>
                        <p
                            className={`mt-0.5 flex items-center gap-1.5 text-sm text-gray-900 dark:text-white ${responseTimeBold ? 'font-bold' : 'font-semibold'}`}
                        >
                            <Clock
                                className="size-4 shrink-0"
                                style={{ color: BRAND_COLOR }}
                                strokeWidth={1.75}
                            />
                            {responseTime}
                        </p>
                    </div>
                </div>
            </div>

            <Link
                href={contacto.url({ query: { tipo: slug } })}
                className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#0a7c4a]/5"
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
            <section className="relative min-h-[440px] overflow-visible sm:min-h-[480px] lg:min-h-[700px]">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="/Imagen/Body/Body.png"
                        alt=""
                        className="absolute inset-0 size-full object-cover object-[70%_center] lg:object-right"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent dark:from-black/60 dark:via-black/35 dark:to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-900/15 to-transparent dark:from-black/70 dark:via-black/45 dark:to-black/20" />
                </div>

                <div
                    className={`relative z-10 mx-auto flex min-h-[440px] flex-col justify-end pb-14 pt-10 sm:min-h-[480px] sm:pb-16 sm:pt-12 lg:min-h-[700px] lg:pb-20 ${CONTENT_WIDTH}`}
                >
                    <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
                        <div className="max-w-3xl">
                            <h1 className="text-2xl font-bold text-white drop-shadow-md sm:text-3xl lg:text-[2.5rem] lg:leading-tight">
                                ¿Qué necesita hoy?
                            </h1>
                            <p className="mt-3 max-w-lg text-sm text-white drop-shadow-sm sm:text-base">
                            Encuentre soporte para su equipo de diagnóstico por imagen
                            Consulte nuestros servicios de mantenimiento, equipos o refacciones
                            </p>

                            <GlobalSearchBar
                                variant="hero"
                                className="mt-7 w-full max-w-xl sm:mt-8 lg:max-w-2xl"
                                placeholder="Buscar servicios, equipos o refacciones"
                            />

                        </div>

                        <div className="flex items-center justify-center lg:translate-x-[18px] lg:-translate-y-[74px] lg:justify-center xl:translate-x-[2px] xl:-translate-y-[130px]">
                            <img
                                src={MIG_HORIZONTAL_ORIGINAL}
                                alt="Medical Imaging Group"
                                className="h-auto w-full max-w-[280px] object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.85)] sm:max-w-[340px] lg:max-w-[400px]"
                            />
                        </div>
                    </div>
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

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                        {popularServices.map((service) => (
                            <PopularServiceCard
                                key={service.title}
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
