import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    CircleCheck,
    Layers,
    Package,
    Scale,
    Search,
    ShoppingCart,
    Tag,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { show as moduloShow } from '@/actions/App/Http/Controllers/ModuloController';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home } from '@/routes';
import { create as clienteCotisacionCreate } from '@/routes/cliente-cotisacion';

/**
 * Flags espejo de App\Support\EquipoFieldFlags.
 * false = ocultar UI (código conservado).
 */
const ENABLE_EQUIPO_ESTADO = false;
const ENABLE_EQUIPO_DISPONIBILIDAD = false;

type ProductStatus = 'available' | 'on_order' | 'out_of_stock';

type Product = {
    slug: string;
    name: string;
    brand: string;
    type: string;
    applications: string;
    status: ProductStatus;
    image: string;
    category: string;
};

type Category = {
    slug: string;
    name: string;
    plural_title: string;
    image: string;
    description?: string | null;
    status?: string;
};

type ListadoProps = {
    category: Category;
    products: Product[];
};

const placeholderColors = [
    '#0a7c4a',
    '#1e5f4a',
    '#2d6a4f',
    '#40916c',
    '#52b788',
    '#1b4332',
    '#081c15',
    '#74c69d',
];

function StatusBadge({ status }: { status: ProductStatus }) {
    if (status === 'available') {
        return (
            <span className="rounded-full bg-[#0a7c4a]/15 px-2.5 py-0.5 text-xs font-semibold text-[#0a7c4a]">
                Disponible
            </span>
        );
    }

    if (status === 'out_of_stock') {
        return (
            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                Agotado
            </span>
        );
    }

    return (
        <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
            Bajo pedido
        </span>
    );
}

function placeholderColorFor(slug: string): string {
    let hash = 0;

    for (let index = 0; index < slug.length; index++) {
        hash = (hash + slug.charCodeAt(index) * (index + 1)) % 997;
    }

    return placeholderColors[hash % placeholderColors.length];
}

function uniqueValues(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function ProductCard({
    product,
    selected,
    onToggleCompare,
}: {
    product: Product;
    selected: boolean;
    onToggleCompare: () => void;
}) {
    const color = placeholderColorFor(product.slug);
    const hasImage = product.image.trim() !== '';

    return (
        <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative p-3">
                {ENABLE_EQUIPO_DISPONIBILIDAD ? (
                    <div className="absolute left-5 top-5 z-10">
                        <StatusBadge status={product.status} />
                    </div>
                ) : null}
                <label className="absolute right-5 top-5 z-10 flex size-5 cursor-pointer items-center justify-center rounded border border-gray-300 bg-white dark:border-neutral-600 dark:bg-neutral-800">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={onToggleCompare}
                        className="size-3 accent-[#0a7c4a]"
                        aria-label={`Comparar ${product.name}`}
                    />
                </label>
                <div
                    className="relative flex aspect-[4/3] items-end overflow-hidden rounded-lg"
                    style={
                        hasImage
                            ? undefined
                            : { backgroundColor: color }
                    }
                    aria-hidden={!hasImage}
                >
                    {hasImage ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 size-full object-cover"
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
                            {product.name}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col px-4 pb-4">
                <h3 className="text-sm font-bold leading-snug text-gray-900 dark:text-white lg:text-base">
                    {product.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#0a7c4a]">
                    {product.brand}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShoppingCart className="size-3.5" />
                    {product.type}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        Aplicaciones:
                    </span>{' '}
                    {product.applications}
                </p>

                <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-neutral-800 sm:flex-row">
                    <Link
                        href={moduloShow.url(product.slug)}
                        className="inline-flex flex-1 items-center justify-center rounded-lg border-2 px-3 py-2 text-xs font-semibold transition hover:bg-[#0a7c4a]/5"
                        style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}
                    >
                        Ver equipo
                    </Link>
                    <Link
                        href={clienteCotisacionCreate.url({
                            query: { equipo: product.slug },
                        })}
                        className="inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        Solicitar cotización
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function ListadoView({ category, products }: ListadoProps) {
    const [search, setSearch] = useState('');
    const [compareIds, setCompareIds] = useState<string[]>([]);

    const brandOptions = useMemo(
        () => uniqueValues(products.map((product) => product.brand)),
        [products],
    );

    const applicationOptions = useMemo(() => {
        return uniqueValues(
            products.flatMap((product) =>
                product.applications.split(',').map((item) => item.trim()),
            ),
        );
    }, [products]);

    const technologyOptions = useMemo(
        () => uniqueValues(products.map((product) => product.type)),
        [products],
    );

    const availableCount = useMemo(
        () =>
            products.filter((product) => product.status === 'available')
                .length,
        [products],
    );

    const hasAvailableModel = availableCount > 0;

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const query = search.trim().toLowerCase();

            return (
                query === '' ||
                product.name.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query) ||
                product.applications.toLowerCase().includes(query)
            );
        });
    }, [products, search]);

    function toggleValue<T extends string>(
        value: T,
        current: T[],
        setter: (next: T[]) => void,
    ): void {
        setter(
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    }

    const stats = [
        {
            label: 'Equipos disponibles',
            value: String(availableCount),
            icon: Package,
        },
        {
            label: 'Marcas',
            value: String(brandOptions.length),
            icon: Tag,
        },
        {
            label: 'Modelos',
            value: String(products.length),
            icon: Layers,
        },
        ...(ENABLE_EQUIPO_ESTADO
            ? [
                  {
                      label: 'Estado',
                      value: hasAvailableModel ? 'Disponible' : 'En espera',
                      icon: CircleCheck,
                      highlight: hasAvailableModel,
                      waiting: !hasAvailableModel,
                  },
              ]
            : []),
    ];

    return (
        <>
            <Head title={category.plural_title} />

            <div className={`mx-auto ${CONTENT_WIDTH} py-6 lg:py-8`}>
                <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                    <Link href={home()} className="hover:text-[#0a7c4a]">
                        Inicio
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                    </span>
                </nav>

                <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                        <div className="relative min-h-56 overflow-hidden bg-neutral-100 dark:bg-neutral-800 lg:min-h-[22rem]">
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="size-full object-cover object-center"
                                />
                            ) : (
                                <div
                                    className="flex size-full items-center justify-center"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    <span className="px-6 text-center text-lg font-semibold text-white">
                                        {category.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                                {category.name}
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {category.description?.trim()
                                    ? category.description
                                    : `Explore equipos de ${category.name} disponibles para cotización, comparación y soporte técnico especializado.`}
                            </p>

                            <div
                                className={`mt-6 grid gap-3 ${
                                    ENABLE_EQUIPO_ESTADO
                                        ? 'grid-cols-2 sm:grid-cols-4'
                                        : 'grid-cols-3'
                                }`}
                            >
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-neutral-800 dark:bg-neutral-950/60"
                                    >
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <stat.icon className="size-3.5 shrink-0 text-[#0a7c4a]" />
                                            <span className="leading-tight">
                                                {stat.label}
                                            </span>
                                        </div>
                                        <p
                                            className={`mt-1.5 text-sm font-bold sm:text-base ${
                                                stat.highlight
                                                    ? 'text-[#0a7c4a]'
                                                    : stat.waiting
                                                      ? 'text-amber-600 dark:text-amber-400'
                                                      : 'text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            {stat.highlight && (
                                                <span className="mr-1.5 inline-block size-2 rounded-full bg-[#0a7c4a]" />
                                            )}
                                            {stat.waiting && (
                                                <span className="mr-1.5 inline-block size-2 rounded-full bg-amber-500" />
                                            )}
                                            {stat.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {(applicationOptions.length > 0 ||
                                technologyOptions.length > 0) && (
                                <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 dark:border-neutral-800">
                                    {applicationOptions.length > 0 && (
                                        <div className="flex flex-wrap items-start gap-2">
                                            <span className="pt-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Aplicaciones
                                            </span>
                                            {applicationOptions
                                                .slice(0, 6)
                                                .map((item) => (
                                                    <span
                                                        key={item}
                                                        className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 dark:border-neutral-700 dark:text-gray-300"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                    {technologyOptions.length > 0 && (
                                        <div className="flex flex-wrap items-start gap-2">
                                            <span className="pt-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Tecnología
                                            </span>
                                            {technologyOptions
                                                .slice(0, 6)
                                                .map((item) => (
                                                    <span
                                                        key={item}
                                                        className="rounded-full border border-[#0a7c4a]/25 bg-[#0a7c4a]/10 px-2.5 py-1 text-xs font-medium text-[#0a7c4a]"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar marca, modelo o aplicación clínica..."
                            className="w-full rounded-full border border-gray-200 bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#0a7c4a]/50 dark:border-neutral-700 dark:bg-neutral-900"
                        />
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    >
                        <Scale className="size-4" />
                        Comparar equipos ({compareIds.length})
                    </button>
                </div>

                <div className="mt-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando{' '}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {filteredProducts.length}
                            </span>{' '}
                            resultados
                        </p>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground"
                        >
                            Ordenar por:{' '}
                            <span className="font-medium text-gray-900 dark:text-white">
                                Más recientes
                            </span>
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.slug}
                                product={product}
                                selected={compareIds.includes(product.slug)}
                                onToggleCompare={() =>
                                    toggleValue(
                                        product.slug,
                                        compareIds,
                                        setCompareIds,
                                    )
                                }
                            />
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                No se encontraron equipos
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Pruebe ajustar la búsqueda.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row dark:border-neutral-800">
                        <p className="text-sm text-muted-foreground">
                            Mostrando 1 a {filteredProducts.length} de{' '}
                            {products.length} resultados
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-muted-foreground dark:border-neutral-700"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md text-sm font-semibold text-white"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                1
                            </button>
                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-sm text-muted-foreground dark:border-neutral-700"
                            >
                                2
                            </button>
                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-sm text-muted-foreground dark:border-neutral-700"
                            >
                                3
                            </button>
                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-muted-foreground dark:border-neutral-700"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-muted-foreground dark:border-neutral-700"
                                aria-label="Última página"
                            >
                                <ChevronsRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
