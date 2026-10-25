import { Head, Link } from '@inertiajs/react';
import { Home, Package, Settings } from 'lucide-react';
import { useState } from 'react';
import { SiteBreadcrumb } from '@/components/site-breadcrumb';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home, mantenimiento, refacciones as refaccionesRoute } from '@/routes';
import { cotizacion, piezas } from '@/routes/refacciones';

type RefaccionImagen = {
    id: number;
    url: string;
    es_principal: boolean;
};

type RefaccionDetalle = {
    id: number;
    nombre: string;
    parte: string;
    marca: string;
    categoria: string;
    descripcion: string;
    condicion: string;
    disponibilidad: string;
    modalidad: {
        slug: string;
        nombre: string;
    };
    imagenes: RefaccionImagen[];
};

export default function VistaRefaccionView({
    refaccion,
}: {
    refaccion: RefaccionDetalle;
}) {
    const [activeImageId, setActiveImageId] = useState<number | null>(
        refaccion.imagenes.find((image) => image.es_principal)?.id ??
            refaccion.imagenes[0]?.id ??
            null,
    );
    const activeImage =
        refaccion.imagenes.find((image) => image.id === activeImageId) ??
        refaccion.imagenes[0];
    const disponible = refaccion.disponibilidad === 'Disponible';

    const specs = [
        { label: 'Fabricante', value: refaccion.marca || '—' },
        { label: 'Módulo', value: refaccion.modalidad.nombre || '—' },
        { label: 'Categoría', value: refaccion.categoria || '—' },
        { label: 'Número de parte', value: refaccion.parte || '—' },
        { label: 'Condición', value: refaccion.condicion || '—' },
    ];

    return (
        <>
            <Head title={refaccion.nombre} />

            <div className={`mx-auto ${CONTENT_WIDTH} py-6 lg:py-8`}>
                <SiteBreadcrumb
                    items={[
                        { label: 'Inicio', href: home.url(), icon: Home },
                        {
                            label: 'Servicios',
                            href: mantenimiento.url(),
                            icon: Settings,
                        },
                        {
                            label: 'Refacciones',
                            href: refaccionesRoute.url(),
                            icon: Package,
                        },
                        {
                            label: refaccion.modalidad.nombre,
                            href: piezas.url(refaccion.modalidad.slug),
                            icon: Package,
                        },
                        { label: refaccion.nombre, icon: Package },
                    ]}
                />

                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_17rem] lg:gap-6 xl:gap-8">
                    <div>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                            {activeImage ? (
                                <img
                                    src={activeImage.url}
                                    alt={refaccion.nombre}
                                    className="size-full object-contain object-center p-4"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                                    Sin imagen
                                </div>
                            )}
                        </div>

                        {refaccion.imagenes.length > 1 ? (
                            <div className="mt-3 flex gap-2 overflow-x-auto">
                                {refaccion.imagenes.map((image) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setActiveImageId(image.id)}
                                        aria-label={`Ver imagen ${image.id}`}
                                        className={`size-16 shrink-0 overflow-hidden rounded-lg border bg-neutral-100 dark:bg-neutral-900 ${
                                            image.id === activeImage?.id
                                                ? 'border-[#0a7c4a]'
                                                : 'border-gray-200 dark:border-neutral-800'
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt=""
                                            className="size-full object-contain p-1"
                                        />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-start gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                {refaccion.nombre}
                            </h1>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    disponible
                                        ? 'bg-[#0a7c4a]/15 text-[#0a7c4a]'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {refaccion.disponibilidad}
                            </span>
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
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                                Disponibilidad
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Esta refacción está{' '}
                                <strong className="text-gray-900 dark:text-white">
                                    {refaccion.disponibilidad.toLocaleLowerCase('es')}
                                </strong>
                                .
                            </p>
                        </div>

                        <Link
                            href={cotizacion.url({
                                modalidad: refaccion.modalidad.slug,
                                refaccion: refaccion.id,
                            })}
                            className="inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            Solicitar cotización
                        </Link>
                    </aside>
                </div>

                <div className="mt-10 border-b border-gray-200 dark:border-neutral-800">
                    <nav className="-mb-px flex gap-6 overflow-x-auto">
                        <span className="shrink-0 border-b-2 border-[#0a7c4a] pb-3 text-sm font-semibold text-[#0a7c4a]">
                            Descripción de la refacción
                        </span>
                    </nav>
                </div>

                <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Descripción de la refacción
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Información de {refaccion.nombre}.
                    </p>
                    {refaccion.descripcion.trim() !== '' ? (
                        <p className="mt-5 max-w-full whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
                            {refaccion.descripcion}
                        </p>
                    ) : (
                        <p className="mt-5 text-sm text-muted-foreground">
                            Esta refacción aún no tiene una descripción
                            registrada.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
