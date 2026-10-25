import { Head, Link } from '@inertiajs/react';
import {
    Box,
    Cable,
    Cpu,
    Home,
    LayoutGrid,
    Monitor,
    Package,
    Search,
    Settings,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    SiteBreadcrumb,
    type SiteBreadcrumbItem,
} from '@/components/site-breadcrumb';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home, mantenimiento, refacciones as refaccionesRoute } from '@/routes';
import { cotizacion, show } from '@/routes/refacciones';

type ModalidadCard = {
    slug: string;
    nombre: string;
    imagen: string;
};

type PiezaCard = {
    id: number;
    nombre: string;
    parte: string;
    marca: string;
    categoria: string;
    descripcion: string;
    imagen: string;
};

type PageProps = {
    modalidad: ModalidadCard;
    refacciones: PiezaCard[];
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    Cables: Cable,
    'Fuentes de poder': Zap,
    Módulos: Box,
    Paneles: Monitor,
    'Tarjetas electrónicas': Cpu,
};

export default function PiesaRefraccion({
    modalidad,
    refacciones,
}: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Todas');
    const [sortBy, setSortBy] = useState<'nombre' | 'parte'>('nombre');

    const categories = useMemo(
        () => [
            'Todas',
            ...Array.from(
                new Set(refacciones.map((part) => part.categoria).filter(Boolean)),
            ).sort((a, b) => a.localeCompare(b, 'es')),
        ],
        [refacciones],
    );

    const visibleParts = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase('es');

        return refacciones
            .filter((part) => {
                const matchesCategory =
                    category === 'Todas' || part.categoria === category;
                const matchesQuery =
                    part.nombre.toLocaleLowerCase('es').includes(query) ||
                    part.parte.toLocaleLowerCase('es').includes(query);

                return matchesCategory && matchesQuery;
            })
            .sort((a, b) =>
                sortBy === 'nombre'
                    ? a.nombre.localeCompare(b.nombre, 'es')
                    : a.parte.localeCompare(b.parte, 'es'),
            );
    }, [refacciones, searchTerm, category, sortBy]);

    const breadcrumb: SiteBreadcrumbItem[] = [
        { label: 'Inicio', href: home.url(), icon: Home },
        { label: 'Servicios', href: mantenimiento.url(), icon: Settings },
        { label: 'Refacciones', href: refaccionesRoute.url(), icon: Package },
        { label: modalidad.nombre, icon: Package },
    ];

    return (
        <>
            <Head title={modalidad.nombre} />

            <section className="bg-black">
                <div className={`mx-auto ${CONTENT_WIDTH} py-8 sm:py-10 lg:py-12`}>
                    <SiteBreadcrumb items={breadcrumb} />
                    <p
                        className="mt-8 text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                        style={{ color: BRAND_COLOR }}
                    >
                        Suministro y venta
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                        {modalidad.nombre}
                    </h1>
                    <div
                        className="mt-4 h-1 w-14 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                    />
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">
                        Encuentra piezas y módulos compatibles con este equipo.
                    </p>
                </div>
            </section>

            <section className="bg-black pb-12">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/45" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Buscar pieza o número de parte..."
                                aria-label="Buscar pieza o número de parte"
                                className="w-full rounded-full border border-white/10 bg-[#161a18] py-3 pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(event.target.value as 'nombre' | 'parte')
                            }
                            aria-label="Ordenar piezas"
                            className="rounded-full border border-white/10 bg-[#161a18] px-5 py-3 text-sm text-white outline-none focus:border-white/30"
                        >
                            <option value="nombre">Nombre</option>
                            <option value="parte">Número de parte</option>
                        </select>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <aside className="self-start rounded-2xl border border-white/10 bg-[#141816] p-4">
                            <h2 className="mb-3 text-sm font-semibold text-white">
                                Categorías
                            </h2>
                            <div className="flex flex-col gap-1">
                                {categories.map((item) => {
                                    const selected = category === item;

                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setCategory(item)}
                                            aria-pressed={selected}
                                            className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                                                selected
                                                    ? 'font-semibold text-white'
                                                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                                            }`}
                                            style={
                                                selected
                                                    ? { backgroundColor: BRAND_COLOR }
                                                    : undefined
                                            }
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <div className="min-w-0">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <p className="text-sm text-white/70">
                                    {visibleParts.length}{' '}
                                    {visibleParts.length === 1
                                        ? 'resultado'
                                        : 'resultados'}
                                </p>
                                <LayoutGrid
                                    className="size-4 text-white/45"
                                    aria-hidden="true"
                                />
                            </div>

                            {visibleParts.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/55">
                                    No hay piezas con esa búsqueda.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {visibleParts.map((part) => {
                                        const Icon =
                                            CATEGORY_ICONS[part.categoria] ?? Package;

                                        return (

<article
    key={part.id}
    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141816] transition-all duration-300 hover:-translate-y-1 hover:border-[#006635]/60 hover:shadow-[0_12px_35px_rgba(0,0,0,0.3)]"
>
    {/* Imagen de la refacción */}
    <div className="flex h-48 items-center justify-center overflow-hidden bg-[#1b201d] p-5 sm:h-52">
        {part.imagen !== '' ? (
            <img
                src={part.imagen}
                alt={part.nombre}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
        ) : (
            <Icon
                className="size-14 text-white/25"
                strokeWidth={1.5}
            />
        )}
    </div>

    {/* Información de la refacción */}
    <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <span
                className="text-xs font-semibold"
                style={{ color: '#4cc185' }}
            >
                {part.categoria}
            </span>

            {part.marca && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                    {part.marca}
                </span>
            )}
        </div>

        <h2 className="mt-3 text-lg font-semibold leading-snug text-white">
            {part.nombre}
        </h2>

        {part.parte && (
            <p className="mt-3 text-sm text-white/60">
                <span className="font-medium text-white/80">
                    Número de parte:
                </span>{' '}
                {part.parte}
            </p>
        )}

{part.descripcion && (
    <p className="mt-3 line-clamp-2 overflow-hidden text-sm leading-relaxed text-ellipsis text-white/55">
        {part.descripcion}
    </p>
)}

        {/* Acciones */}
        <div className="mt-auto pt-5">
            <div className="mb-4 border-t border-white/10" />

            <div className="grid grid-cols-2 gap-2">
                <Link
                    href={show.url({
                        modalidad: modalidad.slug,
                        refaccion: part.id,
                    })}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 bg-[#252729] px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:border-white/40 hover:bg-[#343638]"
                >
                    Ver detalles
                </Link>

                <Link
                    href={cotizacion.url({
                        modalidad: modalidad.slug,
                        refaccion: part.id,
                    })}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#006635] px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#087a43]"
                >
                    Solicitar cotización
                </Link>
            </div>
        </div>
    </div>
</article>

                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
