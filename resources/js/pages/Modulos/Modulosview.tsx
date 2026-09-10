import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home } from '@/routes';
import { create as clienteCotisacionCreate } from '@/routes/cliente-cotisacion';
import { index as equiposIndex } from '@/routes/equipos';

/**
 * Flags espejo de App\Support\EquipoFieldFlags.
 * false = campo deshabilitado (código conservado, no se muestra).
 */
const ENABLE_EQUIPO_ESTADO = false;
const ENABLE_EQUIPO_DISPONIBILIDAD = false;
const ENABLE_EQUIPO_UBICACION = false;

type Imagen360Public = {
    id: number;
    url: string;
    es_principal: boolean;
    orden: number;
    titulo?: string | null;
    puntos: Array<{
        id: number;
        pos_x: number;
        pos_y: number;
        etiqueta?: string | null;
        destino_id?: number | null;
    }>;
};

type ModuleProps = {
    module: {
        slug: string;
        name: string;
        image: string;
        brand?: string | null;
        description?: string | null;
        estado?: string | null;
        disponibilidad?: string | null;
        modalidad?: string | null;
        aplicaciones?: string | null;
        anio?: number | null;
        sku?: string | null;
        category?: string;
        category_name?: string;
        imagenes_360?: Imagen360Public[];
    };
};

type TabId = 'documentacion' | 'soporte';

const tabs: { id: TabId; label: string }[] = [
    { id: 'documentacion', label: 'Descripción del equipo' },
    { id: 'soporte', label: 'Soporte' },
];

export default function Modulosview({ module }: ModuleProps) {
    const [activeTab, setActiveTab] = useState<TabId>('documentacion');
    const gallery = module.imagenes_360 ?? [];
    const [activeImageId, setActiveImageId] = useState<number | null>(
        gallery.find((image) => image.es_principal)?.id ??
            gallery[0]?.id ??
            null,
    );

    const activeImage =
        gallery.find((image) => image.id === activeImageId) ?? gallery[0];
    const mainImageUrl = activeImage?.url || module.image;

    const specs = [
        {
            label: 'Fabricante',
            value: module.brand ?? 'Medical Imaging Group',
        },
        { label: 'Modalidades', value: module.category_name ?? '—' },
        ...(ENABLE_EQUIPO_ESTADO
            ? [{ label: 'Estado', value: module.estado ?? '—' }]
            : []),
        ...(ENABLE_EQUIPO_DISPONIBILIDAD
            ? [
                  {
                      label: 'Disponibilidad',
                      value: module.disponibilidad ?? '—',
                  },
              ]
            : []),
        {
            label: 'Aplicaciones',
            value: module.aplicaciones ?? '—',
        },
    ];

    const availabilityLabel = module.disponibilidad ?? '—';
    const isAvailable =
        module.disponibilidad?.toLowerCase() === 'disponible';
    const showDisponibilidadBadge =
        ENABLE_EQUIPO_DISPONIBILIDAD && Boolean(module.disponibilidad);

    const goToImage = (destinoId: number | null | undefined) => {
        if (!destinoId) {
            return;
        }

        if (gallery.some((image) => image.id === destinoId)) {
            setActiveImageId(destinoId);
        }
    };

    return (
        <>
            <Head title={module.name} />

            <div className={`mx-auto ${CONTENT_WIDTH} py-6 lg:py-8`}>
                <Link
                    href={
                        module.category
                            ? equiposIndex.url(module.category)
                            : home()
                    }
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-[#0a7c4a]"
                >
                    <ArrowLeft className="size-4" />
                    {module.category_name
                        ? `Volver a ${module.category_name}`
                        : 'Volver a equipos'}
                </Link>

                {/* Hero del producto */}
                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_17rem] lg:gap-6 xl:gap-8">
                    {/* Imagen principal */}
                    <div>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                            {mainImageUrl ? (
                                <img
                                    src={mainImageUrl}
                                    alt={module.name}
                                    className="size-full object-cover object-center"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                                    Sin imagen
                                </div>
                            )}

                            {(activeImage?.puntos ?? []).map((punto) => (
                                <button
                                    key={punto.id}
                                    type="button"
                                    className="group absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
                                    style={{
                                        top: `${punto.pos_y}%`,
                                        left: `${punto.pos_x}%`,
                                    }}
                                    onClick={() => goToImage(punto.destino_id)}
                                >
                                    <span
                                        className="flex size-7 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg ring-4 ring-white/30"
                                        style={{ backgroundColor: BRAND_COLOR }}
                                    >
                                        +
                                    </span>
                                    {punto.etiqueta && (
                                        <span className="hidden rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-gray-900 shadow-md group-hover:block dark:bg-neutral-900 dark:text-white">
                                            {punto.etiqueta}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Información del equipo */}
                    <div>
                        <div className="flex flex-wrap items-start gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                {module.name}
                            </h1>
                            {showDisponibilidadBadge && (
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        isAvailable
                                            ? 'bg-[#0a7c4a]/15 text-[#0a7c4a]'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {availabilityLabel}
                                </span>
                            )}
                        </div>

                        <dl className="mt-6 space-y-3 border-y border-gray-200 py-5 dark:border-neutral-800">
                            {specs.map((spec) => (
                                <div
                                    key={spec.label}
                                    className="grid grid-cols-[9rem_1fr] gap-3 text-sm"
                                >
                                    <dt className="font-medium text-muted-foreground">
                                        {spec.label}
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {spec.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Link
                                href={clienteCotisacionCreate.url({
                                    query: { equipo: module.slug },
                                })}
                                className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                Solicitar cotización
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar derecho */}
                    <aside className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                                Información rápida
                            </h2>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li className="flex items-start gap-2 text-muted-foreground">
                                    <Calendar className="mt-0.5 size-4 shrink-0 text-[#0a7c4a]" />
                                    <span>
                                        Año:{' '}
                                        <strong className="text-gray-900 dark:text-white">
                                            {module.anio ?? '—'}
                                        </strong>
                                    </span>
                                </li>
                                {ENABLE_EQUIPO_UBICACION ? (
                                    <li className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="mt-0.5 size-4 shrink-0 text-[#0a7c4a]" />
                                        <span>
                                            Ubicación:{' '}
                                            <strong className="text-gray-900 dark:text-white">
                                                CDMX, México
                                            </strong>
                                        </span>
                                    </li>
                                ) : null}
                            </ul>
                        </div>
                    </aside>
                </div>

                {/* Tabs */}
                <div className="mt-10 border-b border-gray-200 dark:border-neutral-800">
                    <nav className="-mb-px flex gap-6 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`shrink-0 border-b-2 pb-3 text-sm font-semibold transition ${
                                    activeTab === tab.id
                                        ? 'border-[#0a7c4a] text-[#0a7c4a]'
                                        : 'border-transparent text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {activeTab === 'documentacion' && (
                    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Descripción del equipo
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Información del modelo {module.name}.
                        </p>
                        {module.description?.trim() ? (
                            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
                                {module.description}
                            </p>
                        ) : (
                            <p className="mt-5 text-sm text-muted-foreground">
                                Este equipo aún no tiene una descripción
                                registrada.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'soporte' && (
                    <div className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <Wrench className="mx-auto size-8 text-[#0a7c4a]" />
                        <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                            Sección en construcción
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Próximamente podrá consultar más información de
                            Soporte.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
