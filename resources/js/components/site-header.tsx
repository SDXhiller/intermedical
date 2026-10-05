import { Link } from '@inertiajs/react';
import {
    Compass,
    Eye,
    Gem,
    Home,
    Layers,
    Mail,
    Menu,
    Monitor,
    Search,
    Settings,
    Target,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GlobalSearchBar } from '@/components/global-search-bar';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { contacto, home, mantenimiento, sobreNosotros } from '@/routes';
import { equipos as bibliotecaEquipos, equiposDisponibles } from '@/routes/biblioteca';

const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';

type MegaMenuKey = 'empresa';

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
    },
    { label: 'Modalidades', href: bibliotecaEquipos.url(), icon: Layers },
    {
        label: 'Equipos disponibles',
        href: equiposDisponibles.url(),
        icon: Monitor,
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

const iconButtonClassName =
    'flex size-10 shrink-0 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white';

export default function SiteHeader() {
    const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(
        null,
    );
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const closeMegaMenu = () => setActiveMegaMenu(null);

    useEffect(() => {
        if (!searchOpen) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });

        return () => window.cancelAnimationFrame(frame);
    }, [searchOpen]);

    useEffect(() => {
        const closeMobileOverlays = () => {
            setSearchOpen(false);
            setMenuOpen(false);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMobileOverlays();
            }
        };

        const onResize = () => {
            if (window.matchMedia('(min-width: 1024px)').matches) {
                closeMobileOverlays();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div className="sticky top-0 z-[100] isolate overflow-visible">
            <header
                className="relative overflow-visible border-b border-white/10 bg-neutral-950"
                onMouseLeave={() => setActiveMegaMenu(null)}
            >
                <div
                    className={`mx-auto flex ${CONTENT_WIDTH} items-center gap-3 overflow-visible py-4 lg:justify-between lg:gap-4`}
                >
                    <Link
                        href={home()}
                        className={`shrink-0 items-center ${searchOpen ? 'hidden lg:flex' : 'flex'}`}
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
                                        onClick={(event) =>
                                            event.preventDefault()
                                        }
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

                    <div className="hidden min-w-0 items-center justify-end overflow-visible lg:flex">
                        <GlobalSearchBar
                            variant="compact"
                            className="w-64 xl:w-80"
                            placeholder="Buscar equipo, refacción o servicio..."
                        />
                    </div>

                    <div
                        className={`flex min-w-0 items-center justify-end gap-1 lg:hidden ${searchOpen ? 'flex-1' : 'ml-auto'}`}
                    >
                        {searchOpen ? (
                            <>
                                <GlobalSearchBar
                                    variant="compact"
                                    className="min-w-0 flex-1"
                                    placeholder="Buscar equipo, refacción o servicio..."
                                    inputRef={searchInputRef}
                                    onAfterNavigate={() => setSearchOpen(false)}
                                />
                                <button
                                    type="button"
                                    className={iconButtonClassName}
                                    aria-label="Cerrar búsqueda"
                                    onClick={() => setSearchOpen(false)}
                                >
                                    <X className="size-5" strokeWidth={1.75} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className={iconButtonClassName}
                                    aria-label="Abrir búsqueda"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setSearchOpen(true);
                                    }}
                                >
                                    <Search
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </button>
                                <button
                                    type="button"
                                    className={iconButtonClassName}
                                    aria-label={
                                        menuOpen ? 'Cerrar menú' : 'Abrir menú'
                                    }
                                    aria-expanded={menuOpen}
                                    aria-controls="mobile-primary-nav"
                                    onClick={() =>
                                        setMenuOpen((open) => !open)
                                    }
                                >
                                    <span className="relative size-5">
                                        <Menu
                                            className={`absolute inset-0 size-5 transition-all duration-300 ease-out ${
                                                menuOpen
                                                    ? 'rotate-90 scale-75 opacity-0'
                                                    : 'rotate-0 scale-100 opacity-100'
                                            }`}
                                            strokeWidth={1.75}
                                        />
                                        <X
                                            className={`absolute inset-0 size-5 transition-all duration-300 ease-out ${
                                                menuOpen
                                                    ? 'rotate-0 scale-100 opacity-100'
                                                    : '-rotate-90 scale-75 opacity-0'
                                            }`}
                                            strokeWidth={1.75}
                                        />
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <nav
                    id="mobile-primary-nav"
                    className={`grid overflow-hidden bg-neutral-950 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
                        menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                    aria-label="Menú principal"
                    aria-hidden={!menuOpen}
                    inert={!menuOpen}
                >
                    <div className="min-h-0 overflow-hidden">
                        <div
                            className={`mx-auto flex flex-col border-t border-white/10 py-2 transition-opacity duration-300 ease-out ${CONTENT_WIDTH} ${
                                menuOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const className =
                                    'inline-flex items-center gap-2 rounded-lg px-2 py-3 text-sm font-medium text-white/90 transition hover:bg-white/5 hover:text-[#0a7c4a]';
                                const onClick = () => setMenuOpen(false);
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
                                            onClick={(event) => {
                                                event.preventDefault();
                                                onClick();
                                            }}
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
                                        onClick={onClick}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {activeMegaMenu === 'empresa' && (
                    <div className="absolute inset-x-0 top-full hidden border-b border-border bg-background shadow-lg lg:block">
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
