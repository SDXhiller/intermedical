import { Link } from '@inertiajs/react';
import {
    Home,
    Layers,
    Mail,
    Menu,
    Monitor,
    Search,
    Settings,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GlobalSearchBar } from '@/components/global-search-bar';
import { CONTENT_WIDTH } from '@/data/equipment';
import { contacto, home, mantenimiento, sobreNosotros } from '@/routes';
import { equipos as bibliotecaEquipos, equiposDisponibles } from '@/routes/biblioteca';

const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';

type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
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
    },
    { label: 'Contacto', href: contacto.url(), icon: Mail },
];



const iconButtonClassName =
    'flex size-10 shrink-0 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white';

export default function SiteHeader() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
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
            </header>
        </div>
    );
}
