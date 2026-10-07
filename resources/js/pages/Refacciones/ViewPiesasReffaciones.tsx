import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Monitor,
    Package,
    Settings,
} from 'lucide-react';
import { useState } from 'react';
import {
    SiteBreadcrumb,
    type SiteBreadcrumbItem,
} from '@/components/site-breadcrumb';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home, mantenimiento, refacciones } from '@/routes';
import { soporte } from '@/routes/mantenimiento';

type ModalidadCard = {
    slug: string;
    nombre: string;
    imagen: string;
};

type ModeloCard = {
    slug: string;
    nombre: string;
    marca: string;
    imagen: string;
};

type RefaccionCardData = {
    id: number;
    refaccion_requerida: string;
    numero_parte: string;
    descripcion: string;
    equipo: string;
    marca: string;
    modelo: string;
    fotografias: string[];
    imagen: string;
};

type PageProps = {
    modalidades: ModalidadCard[];
    modalidad: ModalidadCard | null;
    modelos: ModeloCard[];
    modelo: ModeloCard | null;
    refacciones: RefaccionCardData[];
};

const catalogCardClass =
    'group relative overflow-hidden rounded-2xl border border-gray-500 bg-black shadow-none transition duration-300 hover:border-white/80 hover:shadow-[0_0_42px_10px_rgba(255,255,255,0.32)]';

function CardHoverGlow() {
    return (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl bg-white/0 opacity-0 blur-2xl transition duration-300 group-hover:bg-white/30 group-hover:opacity-100"
        />
    );
}

function CatalogImageCard({
    href,
    nombre,
    imagen,
}: {
    href: string;
    nombre: string;
    imagen: string;
}) {
    const hasImage = imagen.trim() !== '';

    return (
        <Link href={href} className={`${catalogCardClass} flex flex-col p-5`}>
            <CardHoverGlow />
            <div className="relative z-10 flex aspect-square items-center justify-center rounded-xl bg-black p-4">
                {hasImage ? (
                    <img
                        src={imagen}
                        alt={nombre}
                        className="max-h-full max-w-full object-contain transition duration-300 group-hover:brightness-125"
                    />
                ) : (
                    <Package
                        className="size-16 text-gray-500"
                        strokeWidth={1.25}
                    />
                )}
            </div>
            <h2
                className="relative z-10 mt-4 text-center text-base font-semibold leading-snug sm:text-lg"
                style={{ color: BRAND_COLOR }}
            >
                {nombre}
            </h2>
        </Link>
    );
}

function RefaccionProductCard({
    refaccion,
    modalidadSlug,
    modeloSlug,
}: {
    refaccion: RefaccionCardData;
    modalidadSlug: string;
    modeloSlug: string;
}) {
    const photos =
        refaccion.fotografias.length > 0
            ? refaccion.fotografias
            : refaccion.imagen
              ? [refaccion.imagen]
              : [];
    const [photoIndex, setPhotoIndex] = useState(0);
    const currentPhoto = photos[photoIndex] ?? '';

    return (
        <article
            className={`${catalogCardClass} flex flex-col sm:flex-row`}
        >
            <CardHoverGlow />
            <div className="relative z-10 flex w-full flex-col items-center justify-center bg-black p-5 sm:w-64 sm:shrink-0">
                <div className="flex aspect-square w-full max-w-56 items-center justify-center">
                    {currentPhoto !== '' ? (
                        <img
                            src={currentPhoto}
                            alt={refaccion.refaccion_requerida}
                            className="max-h-full max-w-full object-contain transition duration-300 group-hover:brightness-125"
                        />
                    ) : (
                        <Package
                            className="size-16 text-gray-500"
                            strokeWidth={1.25}
                        />
                    )}
                </div>
                {photos.length > 1 ? (
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Imagen anterior"
                            onClick={() =>
                                setPhotoIndex(
                                    (index) =>
                                        (index - 1 + photos.length) %
                                        photos.length,
                                )
                            }
                            className="rounded-full p-1 text-gray-400 hover:bg-white/10"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        {photos.map((photo, index) => (
                            <button
                                key={photo}
                                type="button"
                                aria-label={`Imagen ${index + 1}`}
                                onClick={() => setPhotoIndex(index)}
                                className={`size-2 rounded-full ${
                                    index === photoIndex
                                        ? 'bg-[#0a7c4a]'
                                        : 'bg-gray-600'
                                }`}
                            />
                        ))}
                        <button
                            type="button"
                            aria-label="Imagen siguiente"
                            onClick={() =>
                                setPhotoIndex(
                                    (index) => (index + 1) % photos.length,
                                )
                            }
                            className="rounded-full p-1 text-gray-400 hover:bg-white/10"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-stretch sm:justify-between sm:p-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold leading-snug text-white sm:text-lg">
                        {refaccion.refaccion_requerida}
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">
                        Número de parte / P.N. {refaccion.numero_parte}
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-200">
                        <li>
                            <span className="text-gray-400">Equipo:</span>{' '}
                            <span className="font-medium text-white">
                                {refaccion.equipo}
                            </span>
                        </li>
                        <li>
                            <span className="text-gray-400">Marca:</span>{' '}
                            <span className="font-medium text-white">
                                {refaccion.marca}
                            </span>
                        </li>
                        <li>
                            <span className="text-gray-400">Modelo:</span>{' '}
                            <span className="font-medium text-white">
                                {refaccion.modelo}
                            </span>
                        </li>
                        <li>
                            <span className="text-gray-400">
                                Refacción requerida:
                            </span>{' '}
                            <span className="font-medium text-white">
                                {refaccion.refaccion_requerida}
                            </span>
                        </li>
                        {refaccion.descripcion !== '' ? (
                            <li>
                                <span className="text-gray-400">
                                    Descripción o comentarios:
                                </span>{' '}
                                {refaccion.descripcion}
                            </li>
                        ) : null}
                    </ul>
                </div>

                <div className="flex shrink-0 flex-col items-stretch justify-end sm:w-44">
                    <Link
                        href={soporte.url({
                            query: {
                                modalidad: modalidadSlug,
                                equipo: modeloSlug,
                            },
                        })}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        Solicitar
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function ViewPiesasReffaciones({
    modalidades,
    modalidad,
    modelos,
    modelo,
    refacciones: piezas,
}: PageProps) {
    const breadcrumb: SiteBreadcrumbItem[] = [
        { label: 'Inicio', href: home.url(), icon: Home },
        { label: 'Servicios', href: mantenimiento.url(), icon: Settings },
        {
            label: 'Refacciones',
            href:
                modalidad === null
                    ? undefined
                    : refacciones.url(),
            icon: Package,
        },
        ...(modalidad
            ? [
                  {
                      label: modalidad.nombre,
                      href:
                          modelo === null
                              ? undefined
                              : refacciones.url({
                                    query: { modalidad: modalidad.slug },
                                }),
                      icon: Package,
                  },
              ]
            : []),
        ...(modelo
            ? [{ label: modelo.nombre, icon: Monitor }]
            : []),
    ];

    const heading =
        modelo !== null
            ? `Refacciones para ${modelo.nombre}`
            : modalidad !== null
              ? `Elija el modelo de ${modalidad.nombre}`
              : 'Servicio de suministro y venta de refacciones';

    const subtitle =
        modelo !== null
            ? 'Consulte la pieza, la marca, el modelo y el número de parte.'
            : modalidad !== null
              ? 'Seleccione el modelo del equipo para ver las refacciones disponibles.'
              : 'Elija primero la modalidad para consultar las refacciones por modelo.';

    return (
        <>
            <Head title="Refacciones" />

            <section className="bg-black">
                <div
                    className={`mx-auto ${CONTENT_WIDTH} py-8 sm:py-10 lg:py-12`}
                >
                    <SiteBreadcrumb items={breadcrumb} />

                    <p
                        className="mt-8 text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                        style={{ color: BRAND_COLOR }}
                    >
                        Suministro y venta
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                        {heading}
                    </h1>
                    <div
                        className="mt-4 h-1 w-14 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                    />
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
                        {subtitle}
                    </p>
                </div>
            </section>

            <section className="bg-black py-10 sm:py-12">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    {modelo !== null && modalidad !== null ? (
                        piezas.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-500 bg-black px-6 py-16 text-center text-sm text-gray-400">
                                Aún no hay refacciones publicadas para este
                                modelo.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {piezas.map((pieza) => (
                                    <RefaccionProductCard
                                        key={pieza.id}
                                        refaccion={pieza}
                                        modalidadSlug={modalidad.slug}
                                        modeloSlug={modelo.slug}
                                    />
                                ))}
                            </div>
                        )
                    ) : modalidad !== null ? (
                        modelos.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-500 bg-black px-6 py-16 text-center text-sm text-gray-400">
                                Aún no hay modelos publicados en esta
                                modalidad.
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {modelos.map((item) => (
                                    <CatalogImageCard
                                        key={item.slug}
                                        nombre={item.nombre}
                                        imagen={item.imagen}
                                        href={refacciones.url({
                                            query: {
                                                modalidad: modalidad.slug,
                                                modelo: item.slug,
                                            },
                                        })}
                                    />
                                ))}
                            </div>
                        )
                    ) : modalidades.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-500 bg-black px-6 py-16 text-center text-sm text-gray-400">
                            Aún no hay modalidades publicadas.
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {modalidades.map((item) => (
                                <CatalogImageCard
                                    key={item.slug}
                                    nombre={item.nombre}
                                    imagen={item.imagen}
                                    href={refacciones.url({
                                        query: { modalidad: item.slug },
                                    })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
