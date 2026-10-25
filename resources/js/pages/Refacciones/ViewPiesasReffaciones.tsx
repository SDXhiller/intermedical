import { Head, Link } from '@inertiajs/react';
import { Home, Package, Settings } from 'lucide-react';
import {
    SiteBreadcrumb,
    type SiteBreadcrumbItem,
} from '@/components/site-breadcrumb';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home, mantenimiento } from '@/routes';
import { piezas } from '@/routes/refacciones';

type ModalidadCard = {
    slug: string;
    nombre: string;
    imagen: string;
};

type PageProps = {
    modalidades: ModalidadCard[];
};

const catalogCardClass =
    'group relative overflow-hidden rounded-xl border border-white/15 bg-[#0b0f0d] shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-[#006635]/80 hover:shadow-[0_8px_28px_rgba(0,102,53,0.18)]';

function CardHoverGlow() {
    return (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-[#006635]/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
        <Link href={href} className={`${catalogCardClass} flex flex-col p-3 sm:p-4`}>
            <CardHoverGlow />
            <div className="relative z-10 flex h-28 items-center justify-center rounded-lg bg-transparent p-2 sm:h-32 lg:h-36">
                {hasImage ? (
                    <img
                        src={imagen}
                        alt={nombre}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <Package
                        className="size-16 text-gray-500"
                        strokeWidth={1.25}
                    />
                )}
            </div>
            <h2
                className="relative z-10 mt-2 min-h-9 text-center text-xs font-semibold leading-tight sm:text-sm"
                style={{ color: BRAND_COLOR }}
            >
                {nombre}
            </h2>
        </Link>
    );
}

export default function ViewPiesasReffaciones({ modalidades }: PageProps) {
    const breadcrumb: SiteBreadcrumbItem[] = [
        { label: 'Inicio', href: home.url(), icon: Home },
        { label: 'Servicios', href: mantenimiento.url(), icon: Settings },
        { label: 'Refacciones', icon: Package },
    ];

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
                        Servicio de suministro y venta de refacciones
                    </h1>
                    <div
                        className="mt-4 h-1 w-14 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                    />
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
                        Elija primero la modalidad para consultar las
                        refacciones por modelo.
                    </p>
                </div>
            </section>

            <section className="bg-black py-6 sm:py-8">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    {modalidades.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-500 bg-black px-6 py-16 text-center text-sm text-gray-400">
                            Aún no hay modalidades publicadas.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                            {modalidades.map((item) => (
                                <CatalogImageCard
                                    key={item.slug}
                                    nombre={item.nombre}
                                    imagen={item.imagen}
                                    href={piezas.url(item.slug)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
