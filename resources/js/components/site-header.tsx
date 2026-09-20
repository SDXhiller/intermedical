import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Cog,
    Compass,
    Drill,
    Eye,
    Gem,
    Home,
    Layers,
    Mail,
    Monitor,
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
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { GlobalSearchBar } from '@/components/global-search-bar';
import {
    BRAND_COLOR,
    CONTENT_WIDTH,
    type EquipmentItem,
} from '@/data/equipment';
import { getMaintenanceServiceBySlug } from '@/data/maintenance-services';
import { contacto, home, mantenimiento, sobreNosotros } from '@/routes';
import { equipos as bibliotecaEquipos } from '@/routes/biblioteca';
import { index as equiposIndex } from '@/routes/equipos';
import { show as moduloShow } from '@/routes/modulos';

const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';

type MegaMenuKey = 'productos' | 'modalidades' | 'servicios' | 'empresa';

type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    megaMenu?: MegaMenuKey;
};

const navItems: NavItem[] = [
    { label: 'Inicio', href: home.url(), icon: Home },
    {
        label: 'Servicios',
        href: mantenimiento.url(),
        icon: Settings,
        megaMenu: 'servicios',
    },
    { label: 'Modalidades', href: bibliotecaEquipos.url(), icon: Layers, megaMenu: 'modalidades' },
    {
        label: 'Equipos disponibles',
        href: '#',
        icon: Monitor,
        megaMenu: 'productos',
    },
    {
        label: 'Nosotros',
        href: sobreNosotros.url(),
        icon: Users,
        megaMenu: 'empresa',
    },
    { label: 'Contacto', href: contacto.url(), icon: Mail },
];

const empresaSubtitles: {
    title: string;
    href: string;
    icon: LucideIcon;
    description?: ReactNode;
}[] = [
    {
        title: 'OBJETIVO',
        href: `${sobreNosotros.url()}#objetivo`,
        icon: Target,
        description: (
            <>
                Establecer los principios, valores y lineamientos que orientan
                el actuar de Medical Imaging Group, promoviendo una cultura de{' '}
                <strong className="font-semibold text-gray-900 dark:text-white">
                    ética, responsabilidad, seguridad, excelencia técnica y
                    mejora continua
                </strong>{' '}
                en cada una de nuestras actividades.
            </>
        ),
    },
    {
        title: 'MISIÓN',
        href: `${sobreNosotros.url()}#mision`,
        icon: Compass,
        description:
            'Mantener la tecnología de imagen médica segura, confiable y disponible, mediante ingeniería especializada, innovación y un servicio cercano que contribuya a una atención médica eficiente y oportuna.',
    },
    {
        title: 'VISIÓN',
        href: `${sobreNosotros.url()}#vision`,
        icon: Eye,
        description:
            'Ser una empresa referente en México en ingeniería y soporte de tecnología de diagnóstico por imagen, reconocida por su innovación, experiencia y compromiso con una atención médica más confiable y accesible.',
    },
    {
        title: 'VALORES',
        href: `${sobreNosotros.url()}#valores`,
        icon: Gem,
        description:
            'Actuamos con compromiso, profesionalismo, responsabilidad, honestidad, servicio y lealtad, aplicando nuestros conocimientos con integridad y transparencia para brindar soluciones confiables, cuidar los recursos y mantener relaciones basadas en el respeto, la confianza y la excelencia.',
    },
];

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

type ServiceFeature = {
    title: string;
    description: string;
    href: string;
    icon?: LucideIcon;
    customIcon?: ReactNode;
};

type ServiceCategory = {
    title: string;
    items: ServiceFeature[];
};

function specializedServiceItem(
    slug: string,
    extras: Pick<ServiceFeature, 'icon' | 'customIcon'>,
): ServiceFeature {
    const service = getMaintenanceServiceBySlug(slug);

    if (!service) {
        throw new Error(`Servicio de mantenimiento no encontrado: ${slug}`);
    }

    return {
        title: service.title,
        description: service.description,
        href: contacto.url({ query: { tipo: service.slug } }),
        ...extras,
    };
}

const specializedServiceCategories: ServiceCategory[] = [
    {
        title: 'MANTENIMIENTO',
        items: [
            specializedServiceItem('mantenimiento-preventivo', { icon: Cog }),
            specializedServiceItem('mantenimiento-correctivo', {
                customIcon: (
                    <CorrectiveMaintenanceIcon
                        className="size-5"
                        style={{ color: BRAND_COLOR }}
                    />
                ),
            }),
            specializedServiceItem('diagnostico', { icon: ScanSearch }),
        ],
    },
    {
        title: 'INSTALACIÓN Y PUESTA EN MARCHA',
        items: [
            specializedServiceItem('instalacion', { icon: Settings2 }),
            specializedServiceItem('desinstalacion', { icon: PackageMinus }),
            specializedServiceItem('puesta-en-marcha', { icon: ShieldCheck }),
        ],
    },
    {
        title: 'RENTA',
        items: [
            specializedServiceItem('renta-de-equipos-medicos', {
                icon: MonitorSmartphone,
            }),
        ],
    },
];

function MegaMenuEquipmentCard({
    name,
    href,
    image,
    cta,
    onNavigate,
}: {
    name: string;
    href: string;
    image: string | null;
    cta: string;
    onNavigate?: () => void;
}) {
    const isLongName = name.length > 22 || name.includes('/');

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className="group relative block h-28 overflow-hidden rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md sm:h-32 lg:h-36"
        >
            {image ? (
                <img
                    src={image}
                    alt={name}
                    className="size-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                />
            ) : (
                <div className="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    Sin imagen
                </div>
            )}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                style={{ backgroundColor: `${BRAND_COLOR}e6` }}
            >
                <p
                    className={`translate-y-3 line-clamp-3 font-bold leading-tight text-white transition-all duration-300 ease-out group-hover:translate-y-0 ${
                        isLongName
                            ? 'text-xs sm:text-sm'
                            : 'text-sm sm:text-base lg:text-lg'
                    }`}
                >
                    {name}
                </p>
                <span className="mt-2 inline-flex translate-y-3 items-center gap-1 text-xs font-medium text-white/95 opacity-0 transition-all delay-100 duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:text-sm">
                    {cta}
                    <ArrowRight className="size-3.5" />
                </span>
            </div>
        </Link>
    );
}

function ServiceFeatureCard({
    title,
    description,
    href,
    icon: Icon,
    customIcon,
    onNavigate,
}: ServiceFeature & { onNavigate?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className="group flex gap-3 rounded-lg p-1 -m-1 transition hover:bg-[#0a7c4a]/5"
        >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#0a7c4a]/25 bg-[#0a7c4a]/10 dark:bg-[#0a7c4a]/20">
                {customIcon ??
                    (Icon && (
                        <Icon
                            className="size-5"
                            style={{ color: BRAND_COLOR }}
                            strokeWidth={1.75}
                        />
                    ))}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 transition group-hover:text-[#0a7c4a] dark:text-white">
                    {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {description}
                </p>
            </div>
        </Link>
    );
}

function ServiceCategoryColumn({
    title,
    items,
    onNavigate,
}: ServiceCategory & { onNavigate?: () => void }) {
    return (
        <div className="flex flex-col">
            <h3 className="text-xs font-bold tracking-wider text-gray-900 dark:text-white">
                {title}
            </h3>
            <div
                className="mt-2 h-0.5 w-8 rounded-full"
                style={{ backgroundColor: BRAND_COLOR }}
            />
            <div className="mt-5 flex flex-1 flex-col gap-5">
                {items.map((item) => (
                    <ServiceFeatureCard
                        key={item.title}
                        {...item}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
        </div>
    );
}

function EmpresaMegaMenu({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <div>
            <p className="text-xs font-bold tracking-wider text-gray-900 dark:text-white">
                EMPRESA
            </p>
            <p className="mt-3 text-sm leading-relaxed whitespace-nowrap text-muted-foreground">
                Somos un grupo de ingenieros con amplia experiencia en el entorno de la Imagenología Clínica. Trabajamos para mantener la tecnología médica disponible, segura y confiable.
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {empresaSubtitles.map(
                    ({ title, href, icon: Icon, description }) => (
                        <Link
                            key={title}
                            href={href}
                            onClick={onNavigate}
                            className="group flex max-w-[16rem] flex-col"
                        >
                            <h3 className="text-sm font-bold tracking-wider text-gray-900 transition group-hover:text-[#0a7c4a] dark:text-white">
                                {title}
                            </h3>

                            <div className="mt-3 flex items-start gap-2.5">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0a7c4a]/10 transition group-hover:bg-[#0a7c4a]/15 dark:bg-[#0a7c4a]/20">
                                    <Icon
                                        className="size-4"
                                        style={{ color: BRAND_COLOR }}
                                        strokeWidth={1.75}
                                    />
                                </span>
                                {description && (
                                    <p className="line-clamp-3 min-w-0 flex-1 text-sm leading-snug text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>

                            <div
                                className="mt-3 h-0.5 w-full max-w-[10rem] rounded-full"
                                style={{ backgroundColor: BRAND_COLOR }}
                            />
                        </Link>
                    ),
                )}
            </div>
        </div>
    );
}

function buildCarouselSequence(items: EquipmentItem[]): EquipmentItem[] {
    if (items.length === 0) {
        return [];
    }

    const copies = Math.max(2, Math.ceil(4 / items.length));

    return Array.from({ length: copies }, () => items).flat();
}

function SubEquipmentCarousel({
    items,
    onNavigate,
}: {
    items: EquipmentItem[];
    onNavigate?: () => void;
}) {
    const sequence = useMemo(() => buildCarouselSequence(items), [items]);
    const loop = useMemo(() => [...sequence, ...sequence], [sequence]);
    const durationSeconds = Math.max(28, sequence.length * 6);

    if (items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aún no hay sub equipos publicados.
            </p>
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
                aria-label="Carrusel de equipos disponibles"
            >
                {loop.map((item, index) => (
                    <div
                        key={`${item.slug}-${index}`}
                        className="w-[calc((100cqw-1rem)/2)] shrink-0 sm:w-[calc((100cqw-2rem)/3)] md:w-[calc((100cqw-5.25rem)/4)]"
                        aria-hidden={index >= sequence.length}
                    >
                        <MegaMenuEquipmentCard
                            name={item.name}
                            href={moduloShow.url(item.slug)}
                            image={item.image}
                            cta="Ver equipo"
                            onNavigate={onNavigate}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SpecializedServicesMegaMenu({
    onNavigate,
}: {
    onNavigate?: () => void;
}) {
    return (
        <div>
            <div className="grid gap-8 lg:grid-cols-5 lg:gap-6 xl:gap-8">
                <div className="lg:col-span-1">
                    <p className="text-xs font-bold tracking-wider text-[#0a7c4a]">
                        SERVICIOS ESPECIALIZADOS
                    </p>
                    <h2 className="mt-2 text-xl font-bold leading-tight text-gray-900 dark:text-white lg:text-2xl">
                        Soluciones integrales para sus equipos médicos
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Nuestro equipo de ingenieros especializados está listo
                        para ayudarle en cada etapa del ciclo de vida de su
                        equipo.
                    </p>
                    <div className="mt-4 overflow-hidden rounded-xl">
                        <img
                            src="/Imagen/Mantenimiento/Mantenimeinto.png"
                            alt="Técnico especializado realizando mantenimiento a equipo de imagen médica"
                            className="aspect-[4/3] w-full object-cover object-center"
                        />
                    </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-3 lg:gap-5 xl:gap-6">
                    {specializedServiceCategories.map((category) => (
                        <ServiceCategoryColumn
                            key={category.title}
                            {...category}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SiteHeader() {
    const { equipmentItems, subEquipmentItems } = usePage<{
        equipmentItems: EquipmentItem[];
        subEquipmentItems: EquipmentItem[];
    }>().props;
    const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(
        null,
    );
    const closeMegaMenu = () => setActiveMegaMenu(null);

    return (
        <div className="sticky top-0 z-[100] isolate overflow-visible">
            <header
                className="relative overflow-visible border-b border-white/10 bg-neutral-950"
                onMouseLeave={() => setActiveMegaMenu(null)}
            >
                <div
                    className={`mx-auto flex ${CONTENT_WIDTH} items-center justify-between gap-4 overflow-visible py-4`}
                >
                    <Link
                        href={home()}
                        className="flex shrink-0 items-center"
                        aria-label="Medical Imaging Group"
                    >
                        <img
                            src={MIG_HORIZONTAL_WHITE}
                            alt="Medical Imaging Group"
                            className="h-10 w-auto max-w-[220px] object-contain object-left sm:h-11"
                        />
                    </Link>

                    <nav className="hidden items-center gap-2.5 lg:flex xl:gap-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const className =
                                'inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-white/80 transition hover:text-[#0a7c4a]';
                            const onMouseEnter = () =>
                                setActiveMegaMenu(item.megaMenu ?? null);
                            const label = (
                                <>
                                    <Icon
                                        className="size-4 shrink-0"
                                        strokeWidth={1.75}
                                    />
                                    {item.label}
                                </>
                            );

                            if (item.href === '#') {
                                return (
                                    <a
                                        key={item.label}
                                        href="#"
                                        className={className}
                                        onMouseEnter={onMouseEnter}
                                    >
                                        {label}
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={className}
                                    onMouseEnter={onMouseEnter}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex min-w-0 items-center justify-end overflow-visible">
                        <GlobalSearchBar
                            variant="compact"
                            className="w-48 sm:w-56 lg:w-64 xl:w-80"
                            placeholder="Buscar equipo, refacción o servicio..."
                        />
                    </div>
                </div>

                {activeMegaMenu === 'modalidades' && (
                    <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
                        <div className={`mx-auto ${CONTENT_WIDTH} py-8`}>
                            <div className="min-w-0">
                                <h3 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground">
                                    MODALIDADES
                                </h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                                    {equipmentItems.map((item) => (
                                        <MegaMenuEquipmentCard
                                            key={item.slug}
                                            name={item.name}
                                            href={equiposIndex.url(item.slug)}
                                            image={item.image}
                                            cta="Ver equipos"
                                            onNavigate={closeMegaMenu}
                                        />
                                    ))}
                                    <Link
                                        href={bibliotecaEquipos()}
                                        onClick={closeMegaMenu}
                                        className="flex flex-col justify-center gap-2 rounded-lg border border-dashed border-[#0a7c4a]/25 bg-[#0a7c4a]/10 p-3 dark:bg-[#0a7c4a]/20"
                                    >
                                        <BookOpen
                                            className="size-5"
                                            style={{ color: BRAND_COLOR }}
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Ver todas
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Tipos de equipos
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeMegaMenu === 'productos' && (
                    <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
                        <div className={`mx-auto ${CONTENT_WIDTH} py-8`}>
                            <div className="min-w-0">
                                <h3 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground">
                                    EQUIPOS DISPONIBLES
                                </h3>
                                <SubEquipmentCarousel
                                    items={subEquipmentItems}
                                    onNavigate={closeMegaMenu}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeMegaMenu === 'servicios' && (
                    <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
                        <div className={`mx-auto ${CONTENT_WIDTH} py-8`}>
                            <SpecializedServicesMegaMenu
                                onNavigate={closeMegaMenu}
                            />
                        </div>
                    </div>
                )}

                {activeMegaMenu === 'empresa' && (
                    <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
                        <div className={`mx-auto ${CONTENT_WIDTH} py-8`}>
                            <EmpresaMegaMenu
                                onNavigate={closeMegaMenu}
                            />
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
