import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    Mail,
    Phone,
    Search as SearchIcon,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { index as searchIndex } from '@/routes/search';

type SearchResultItem = {
    id: string;
    tipo: string;
    tipo_label: string;
    nombre: string;
    detalle: string | null;
    imagen: string | null;
    url: string;
};

const tipoBadgeClass: Record<string, string> = {
    equipo: 'border-0 bg-blue-600 text-white shadow-sm',
    sub_equipo: 'border-0 bg-[#0a7c4a] text-white shadow-sm',
    servicio: 'border-0 bg-orange-600 text-white shadow-sm',
    telefono: 'border-0 bg-purple-600 text-white shadow-sm',
    correo: 'border-0 bg-indigo-600 text-white shadow-sm',
};

const tipoFallbackIcon: Record<string, LucideIcon> = {
    servicio: Wrench,
    telefono: Phone,
    correo: Mail,
};

function SearchResultCard({ result }: { result: SearchResultItem }) {
    const FallbackIcon = tipoFallbackIcon[result.tipo] ?? SearchIcon;
    const hasImage = result.imagen !== null && result.imagen !== '';

    return (
        <Link
            href={result.url}
            prefetch
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#0a7c4a]/30 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:border-[#0a7c4a]/30 focus-visible:shadow-md focus-visible:outline-none"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
                {hasImage ? (
                    <img
                        src={result.imagen!}
                        alt={result.nombre}
                        className="size-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/80 to-muted p-4 text-center">
                        <FallbackIcon className="size-8 text-muted-foreground/70 transition-colors group-hover:text-[#0a7c4a]" />
                        <p className="line-clamp-3 text-sm font-semibold leading-snug text-foreground">
                            {result.nombre}
                        </p>
                    </div>
                )}

                <div className="absolute top-2 left-2">
                    <Badge
                        className={
                            tipoBadgeClass[result.tipo] ??
                            'bg-muted text-foreground'
                        }
                    >
                        {result.tipo_label}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3">
                {hasImage && (
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-[#0a7c4a]">
                        {result.nombre}
                    </h3>
                )}

                {result.detalle && (
                    <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                        {result.detalle}
                    </p>
                )}

                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0a7c4a] group-hover:underline">
                    Ver detalle
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
            </div>
        </Link>
    );
}

export default function Search({
    query,
    results,
}: {
    query: string;
    results: SearchResultItem[];
}) {
    const [searchValue, setSearchValue] = useState(query);

    useEffect(() => {
        setSearchValue(query);
    }, [query]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (searchValue.trim() === query.trim()) {
                return;
            }

            router.get(
                searchIndex.url({
                    query: {
                        ...(searchValue.trim() !== ''
                            ? { q: searchValue.trim() }
                            : {}),
                    },
                }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchValue, query]);

    return (
        <>
            <Head title="Buscar" />

            <section className="border-b border-border bg-muted/40 py-8 md:py-10">
                <div className={`mx-auto ${CONTENT_WIDTH} px-4`}>
                    <p
                        className="text-xs font-bold tracking-[0.14em] uppercase"
                        style={{ color: BRAND_COLOR }}
                    >
                        Búsqueda global
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Resultados del sitio
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Encuentre equipos, sub-equipos, servicios, teléfonos y
                        correos visibles en contacto.
                    </p>

                    <div className="relative mt-6 max-w-2xl">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(event.target.value)
                            }
                            placeholder="Buscar equipos, sub-equipos, servicios, teléfonos o correos..."
                            className="h-12 rounded-full border-border bg-background pl-11 text-base shadow-sm focus-visible:border-[#0a7c4a] focus-visible:ring-[#0a7c4a]/20"
                        />
                    </div>
                </div>
            </section>

            <section className="py-8 md:py-10">
                <div className={`mx-auto ${CONTENT_WIDTH} px-4`}>
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <h2 className="text-base font-semibold text-foreground">
                            Resultados
                        </h2>
                        {query.trim() !== '' && (
                            <Badge variant="secondary">
                                {results.length}{' '}
                                {results.length === 1
                                    ? 'coincidencia'
                                    : 'coincidencias'}
                            </Badge>
                        )}
                    </div>

                    {query.trim() === '' ? (
                        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-16 text-center">
                            <SearchIcon className="mx-auto size-10 text-muted-foreground/50" />
                            <p className="mt-4 text-sm font-medium text-foreground">
                                Escriba en el buscador para comenzar
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Las tarjetas se actualizarán automáticamente
                                mientras escribe.
                            </p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-16 text-center">
                            <SearchIcon className="mx-auto size-10 text-muted-foreground/50" />
                            <p className="mt-4 text-sm font-medium text-foreground">
                                No se encontraron resultados para &quot;
                                {query}&quot;
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Intente con otro nombre de equipo, servicio,
                                teléfono o correo.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {results.map((result) => (
                                <SearchResultCard
                                    key={result.id}
                                    result={result}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
