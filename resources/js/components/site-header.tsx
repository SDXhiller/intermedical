import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    ChevronDown,
    Cog,
    Compass,
    Drill,
    Eye,
    Gem,
    Import,
    MonitorSmartphone,
    PackageMinus,
    ScanSearch,
    Search,
    Settings2,
    ShieldCheck,
    Target,
    Wrench,
    X,
    type LucideIcon,
} from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { GlobalSearchBar } from '@/components/global-search-bar';
import {
    BRAND_COLOR,
    CONTENT_WIDTH,
    type EquipmentItem,
} from '@/data/equipment';
import { getMaintenanceServiceBySlug } from '@/data/maintenance-services';
import { contacto, home, sobreNosotros } from '@/routes';
import { index as equiposIndex } from '@/routes/equipos';

const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';

const navItems = ['Empresa', 'Servicios', 'Productos', 'Contacto'];

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
    slug,
    image,
}: {
    name: string;
    slug: string;
    image: string | null;
}) {
    const isLongName = name.length > 22;

    return (
        <Link
            href={equiposIndex.url(slug)}
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
                    className={`translate-y-3 font-bold leading-tight text-white transition-all duration-300 ease-out group-hover:translate-y-0 ${
                        isLongName
                            ? 'text-xs sm:text-sm'
                            : 'text-sm sm:text-base lg:text-lg'
                    }`}
                >
                    {name}
                </p>
                <span className="mt-2 inline-flex translate-y-3 items-center gap-1 text-xs font-medium text-white/95 opacity-0 transition-all delay-100 duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:text-sm">
                    Ver equipos
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
    const { equipmentItems } = usePage<{
        equipmentItems: EquipmentItem[];
    }>().props;
    const [activeMegaMenu, setActiveMegaMenu] = useState<
        'productos' | 'servicios' | 'empresa' | null
    >(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        if (!searchOpen) {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (searchContainerRef.current?.contains(target)) {
                return;
            }

            if (
                target instanceof Element &&
                target.closest('[data-global-search-dropdown]')
            ) {
                return;
            }

            setSearchOpen(false);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [searchOpen]);

    return (
        <div className="sticky top-0 z-[100] isolate overflow-visible">
            <header
                className="relative overflow-visible border-b border-border bg-background"
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

                    <nav className="hidden items-center gap-6 lg:flex">
                        {navItems.map((item) =>
                            item === 'Contacto' ? (
                                <Link
                                    key={item}
                                    href={contacto()}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition hover:text-[#0a7c4a]"
                                    onMouseEnter={() =>
                                        setActiveMegaMenu(null)
                                    }
                                >
                                    {item}
                                </Link>
                            ) : (
                                <a
                                    key={item}
                                    href="#"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition hover:text-[#0a7c4a]"
                                    onMouseEnter={() => {
                                        if (item === 'Productos') {
                                            setActiveMegaMenu('productos');
                                        } else if (item === 'Servicios') {
                                            setActiveMegaMenu('servicios');
                                        } else if (item === 'Empresa') {
                                            setActiveMegaMenu('empresa');
                                        } else {
                                            setActiveMegaMenu(null);
                                        }
                                    }}
                                >
                                    {item}
                                    {(item === 'Productos' ||
                                        item === 'Servicios' ||
                                        item === 'Empresa') && (
                                        <ChevronDown className="size-3.5" />
                                    )}
                                </a>
                            ),
                        )}
                    </nav>

                    <div className="flex items-center gap-3 overflow-visible">
                        <div
                            ref={searchContainerRef}
                            className="relative flex items-center justify-end overflow-visible"
                        >
                            <GlobalSearchBar
                                variant="compact"
                                active={searchOpen}
                                inputRef={searchInputRef}
                                onAfterNavigate={() => setSearchOpen(false)}
                                aria-hidden={!searchOpen}
                                className={`transition-all duration-300 ease-out ${
                                    searchOpen
                                        ? 'mr-2 w-44 opacity-100 sm:w-56 md:w-72'
                                        : 'pointer-events-none w-0 opacity-0'
                                }`}
                                placeholder="Buscar equipos, servicios, contactos..."
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setSearchOpen((open) => !open)
                                }
                                className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-[#0a7c4a]/10 hover:text-[#0a7c4a]"
                                aria-label={
                                    searchOpen
                                        ? 'Cerrar búsqueda'
                                        : 'Abrir búsqueda'
                                }
                                aria-expanded={searchOpen}
                            >
                                {searchOpen ? (
                                    <X className="size-5" />
                                ) : (
                                    <Search className="size-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {activeMegaMenu === 'productos' && (
                    <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
                        <div className={`mx-auto ${CONTENT_WIDTH} py-8`}>
                            <div className="min-w-0">
                                <h3 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground">
                                    EQUIPOS MÉDICOS
                                </h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                                    {equipmentItems.map((item) => (
                                        <MegaMenuEquipmentCard
                                            key={item.slug}
                                            name={item.name}
                                            slug={item.slug}
                                            image={item.image}
                                        />
                                    ))}
                                    <a
                                        href="#"
                                        className="flex flex-col justify-center gap-2 rounded-lg border border-dashed border-[#0a7c4a]/25 bg-[#0a7c4a]/10 p-3 dark:bg-[#0a7c4a]/20"
                                    >
                                        <BookOpen
                                            className="size-5"
                                            style={{ color: BRAND_COLOR }}
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Biblioteca
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Manuales y documentación
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeMegaMenu === 'servicios' && (
                    <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
                        <div className={`mx-auto ${CONTENT_WIDTH} py-8`}>
                            <SpecializedServicesMegaMenu
                                onNavigate={() => setActiveMegaMenu(null)}
                            />
                        </div>
                    </div>
                )}

                {activeMegaMenu === 'empresa' && (
                    <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
                        <div className={`mx-auto ${CONTENT_WIDTH} py-8`}>
                            <EmpresaMegaMenu
                                onNavigate={() => setActiveMegaMenu(null)}
                            />
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
