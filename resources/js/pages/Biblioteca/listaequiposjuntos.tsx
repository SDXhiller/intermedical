import { Head, Link } from '@inertiajs/react';
import { Home, Monitor, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { show as moduloShow } from '@/actions/App/Http/Controllers/ModuloController';
import { SiteBreadcrumb } from '@/components/site-breadcrumb';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home } from '@/routes';
import { create as clienteCotisacionCreate } from '@/routes/cliente-cotisacion';

type EquipoDisponible = {
    slug: string;
    name: string;
    brand: string;
    type: string;
    applications: string;
    status: string;
    image: string;
    category: string;
    category_name: string;
};

const placeholderColors = [
    '#0a7c4a',
    '#1e5f4a',
    '#2d6a4f',
    '#40916c',
    '#52b788',
    '#1b4332',
] as const;

function placeholderColorFor(slug: string): string {
    let hash = 0;

    for (let index = 0; index < slug.length; index++) {
        hash = (hash + slug.charCodeAt(index) * (index + 1)) % 997;
    }

    return placeholderColors[hash % placeholderColors.length];
}

function textoCoincide(equipo: EquipoDisponible, consulta: string): boolean {
    if (consulta === '') {
        return true;
    }

    const normalizada = consulta.toLowerCase();

    return (
        equipo.name.toLowerCase().includes(normalizada) ||
        equipo.brand.toLowerCase().includes(normalizada) ||
        equipo.category_name.toLowerCase().includes(normalizada) ||
        equipo.type.toLowerCase().includes(normalizada)
    );
}

function EquipoCard({ equipo }: { equipo: EquipoDisponible }) {
    const color = placeholderColorFor(equipo.slug);
    const hasImage = equipo.image.trim() !== '';

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative p-3">
                <div
                    className="relative flex aspect-[4/3] items-end overflow-hidden rounded-lg bg-white dark:bg-neutral-800"
                    style={hasImage ? undefined : { backgroundColor: color }}
                    aria-hidden={!hasImage}
                >
                    {hasImage ? (
                        <img
                            src={equipo.image}
                            alt={equipo.name}
                            className="absolute inset-0 size-full object-contain object-center"
                        />
                    ) : null}
                    <div
                        className={`relative z-10 w-full p-4 ${
                            hasImage
                                ? 'bg-gradient-to-t from-black/70 to-transparent'
                                : ''
                        }`}
                    >
                        <span className="text-xs font-semibold tracking-wide text-white/90">
                            {equipo.name}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col px-4 pb-4">
                <h2 className="text-sm leading-snug font-bold text-gray-900 lg:text-base dark:text-white">
                    {equipo.name}
                </h2>
                <p className="mt-1 text-xs font-medium text-[#0a7c4a]">
                    {equipo.brand}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShoppingCart className="size-3.5" />
                    {equipo.type}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        Aplicaciones:
                    </span>{' '}
                    {equipo.applications}
                </p>

                <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row dark:border-neutral-800">
                    <Link
                        href={moduloShow.url(equipo.slug)}
                        className="inline-flex w-full flex-1 items-center justify-center rounded-lg border-2 px-3 py-2.5 text-xs font-semibold transition hover:bg-[#0a7c4a]/5 sm:py-2"
                        style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}
                    >
                        Ver equipo
                    </Link>
                    <Link
                        href={clienteCotisacionCreate.url({
                            query: { equipo: equipo.slug },
                        })}
                        className="inline-flex w-full flex-1 items-center justify-center rounded-lg px-3 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 sm:py-2"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        Solicitar cotización
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function ListaEquiposJuntos({
    equipos,
}: {
    equipos: EquipoDisponible[];
}) {
    const [busqueda, setBusqueda] = useState('');
    const [modalidad, setModalidad] = useState('');
    const [marca, setMarca] = useState('');
    const [sugerenciasAbiertas, setSugerenciasAbiertas] = useState(false);
    const [sugerenciaActiva, setSugerenciaActiva] = useState(0);
    const buscadorRef = useRef<HTMLDivElement>(null);

    const modalidades = useMemo(() => {
        const unicas = new Map<string, string>();

        equipos.forEach((equipo) => {
            if (equipo.category !== '' && !unicas.has(equipo.category)) {
                unicas.set(equipo.category, equipo.category_name);
            }
        });

        return [...unicas.entries()]
            .map(([slug, nombre]) => ({ slug, nombre }))
            .sort((left, right) => left.nombre.localeCompare(right.nombre, 'es'));
    }, [equipos]);

    const marcas = useMemo(() => {
        return [...new Set(equipos.map((equipo) => equipo.brand))]
            .filter((item) => item.trim() !== '')
            .sort((left, right) => left.localeCompare(right, 'es'));
    }, [equipos]);

    const sugerencias = useMemo(() => {
        const consulta = busqueda.trim();

        if (consulta === '') {
            return [];
        }

        return equipos.filter((equipo) => textoCoincide(equipo, consulta)).slice(0, 6);
    }, [busqueda, equipos]);

    const filtrados = useMemo(() => {
        return equipos.filter((equipo) => {
            if (modalidad !== '' && equipo.category !== modalidad) {
                return false;
            }

            if (marca !== '' && equipo.brand !== marca) {
                return false;
            }

            return textoCoincide(equipo, busqueda.trim());
        });
    }, [busqueda, equipos, marca, modalidad]);

    useEffect(() => {
        setSugerenciaActiva(0);
    }, [busqueda]);

    useEffect(() => {
        const cerrar = (event: MouseEvent) => {
            if (!buscadorRef.current?.contains(event.target as Node)) {
                setSugerenciasAbiertas(false);
            }
        };

        document.addEventListener('mousedown', cerrar);

        return () => document.removeEventListener('mousedown', cerrar);
    }, []);

    const elegirSugerencia = (equipo: EquipoDisponible) => {
        setBusqueda(equipo.name);
        setModalidad(equipo.category);
        setMarca(equipo.brand);
        setSugerenciasAbiertas(false);
    };

    const hayFiltros =
        busqueda.trim() !== '' || modalidad !== '' || marca !== '';

    return (
        <>
            <Head title="Equipos disponibles" />

            <section className="bg-neutral-950">
                <div className={`mx-auto py-10 sm:py-12 ${CONTENT_WIDTH}`}>
                    <SiteBreadcrumb
                        items={[
                            { label: 'Inicio', href: home.url(), icon: Home },
                            { label: 'Equipos disponibles', icon: Monitor },
                        ]}
                    />

                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Equipos disponibles
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                        Consulta todos los equipos en un solo listado. Busca por
                        nombre, marca o modalidad y filtra el resultado.
                    </p>

                    <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
                        <div ref={buscadorRef} className="relative">
                            <label htmlFor="buscar-equipo" className="sr-only">
                                Buscar equipo
                            </label>
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/50" />
                            <input
                                id="buscar-equipo"
                                value={busqueda}
                                onChange={(event) => {
                                    setBusqueda(event.target.value);
                                    setSugerenciasAbiertas(true);
                                }}
                                onFocus={() => setSugerenciasAbiertas(true)}
                                onKeyDown={(event) => {
                                    if (!sugerenciasAbiertas || sugerencias.length === 0) {
                                        return;
                                    }

                                    if (event.key === 'ArrowDown') {
                                        event.preventDefault();
                                        setSugerenciaActiva((actual) =>
                                            Math.min(actual + 1, sugerencias.length - 1),
                                        );
                                    }

                                    if (event.key === 'ArrowUp') {
                                        event.preventDefault();
                                        setSugerenciaActiva((actual) =>
                                            Math.max(actual - 1, 0),
                                        );
                                    }

                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        const elegida = sugerencias[sugerenciaActiva];

                                        if (elegida) {
                                            elegirSugerencia(elegida);
                                        }
                                    }

                                    if (event.key === 'Escape') {
                                        setSugerenciasAbiertas(false);
                                    }
                                }}
                                placeholder="Buscar por nombre, marca o modalidad"
                                autoComplete="off"
                                role="combobox"
                                aria-expanded={
                                    sugerenciasAbiertas && sugerencias.length > 0
                                }
                                aria-controls="sugerencias-equipos"
                                className="h-11 w-full rounded-xl border border-white/15 bg-neutral-900 pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#0a7c4a]"
                            />
                            {sugerenciasAbiertas && sugerencias.length > 0 ? (
                                <ul
                                    id="sugerencias-equipos"
                                    role="listbox"
                                    className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/15 bg-neutral-900 shadow-xl"
                                >
                                    {sugerencias.map((equipo, index) => (
                                        <li key={equipo.slug} role="option" aria-selected={index === sugerenciaActiva}>
                                            <button
                                                type="button"
                                                onMouseDown={(event) =>
                                                    event.preventDefault()
                                                }
                                                onClick={() => elegirSugerencia(equipo)}
                                                className={`flex w-full flex-col px-3 py-2 text-left ${index === sugerenciaActiva ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                            >
                                                <span className="text-sm font-semibold text-white">
                                                    {equipo.name}
                                                </span>
                                                <span className="text-xs text-white/60">
                                                    {equipo.brand} · {equipo.category_name}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>

                        <label className="sr-only" htmlFor="filtro-modalidad">
                            Modalidad
                        </label>
                        <select
                            id="filtro-modalidad"
                            value={modalidad}
                            onChange={(event) => setModalidad(event.target.value)}
                            className="h-11 rounded-xl border border-white/15 bg-neutral-900 px-3 text-sm text-white outline-none focus:border-[#0a7c4a]"
                        >
                            <option value="">Todas las modalidades</option>
                            {modalidades.map((item) => (
                                <option key={item.slug} value={item.slug}>
                                    {item.nombre}
                                </option>
                            ))}
                        </select>

                        <label className="sr-only" htmlFor="filtro-marca">
                            Marca
                        </label>
                        <select
                            id="filtro-marca"
                            value={marca}
                            onChange={(event) => setMarca(event.target.value)}
                            className="h-11 rounded-xl border border-white/15 bg-neutral-900 px-3 text-sm text-white outline-none focus:border-[#0a7c4a]"
                        >
                            <option value="">Todas las marcas</option>
                            {marcas.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            disabled={!hayFiltros}
                            onClick={() => {
                                setBusqueda('');
                                setModalidad('');
                                setMarca('');
                                setSugerenciasAbiertas(false);
                            }}
                            className="h-11 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Limpiar
                        </button>
                    </div>

                    <p className="mt-4 text-sm text-white/60">
                        {filtrados.length === 1
                            ? '1 equipo'
                            : `${filtrados.length} equipos`}
                    </p>
                </div>
            </section>

            <section className="bg-neutral-950 pb-12 sm:pb-14 lg:pb-16">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    {filtrados.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/60">
                            {equipos.length === 0
                                ? 'Aún no hay equipos publicados.'
                                : 'No hay equipos con esa búsqueda.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filtrados.map((equipo) => (
                                <EquipoCard key={equipo.slug} equipo={equipo} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
