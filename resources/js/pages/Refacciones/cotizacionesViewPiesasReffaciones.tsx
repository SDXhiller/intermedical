import { Head, Link } from '@inertiajs/react';
import { Home, Package, Settings } from 'lucide-react';
import { SiteBreadcrumb } from '@/components/site-breadcrumb';
import { CONTENT_WIDTH } from '@/data/equipment';
import { home, mantenimiento, refacciones as refaccionesRoute } from '@/routes';
import { piezas, show } from '@/routes/refacciones';

type RefaccionCotizacion = {
    id: number;
    nombre: string;
    modalidad: {
        slug: string;
        nombre: string;
    };
};

export default function CotizacionesViewPiesasReffaciones({
    refaccion,
}: {
    refaccion: RefaccionCotizacion;
}) {
    return (
        <>
            <Head title={`Cotizar ${refaccion.nombre}`} />

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
                        {
                            label: refaccion.nombre,
                            href: show.url({
                                modalidad: refaccion.modalidad.slug,
                                refaccion: refaccion.id,
                            }),
                            icon: Package,
                        },
                        { label: 'Cotización', icon: Package },
                    ]}
                />

                <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-10">
                    <p className="text-xs font-bold tracking-[0.14em] text-[#0a7c4a] uppercase">
                        Solicitar cotización
                    </p>
                    <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        {refaccion.nombre}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        El formulario para cotizar esta refacción se trabajará
                        en esta pantalla. Por ahora solo está preparada la
                        vista de {refaccion.nombre}.
                    </p>
                    <Link
                        href={show.url({
                            modalidad: refaccion.modalidad.slug,
                            refaccion: refaccion.id,
                        })}
                        className="mt-6 inline-flex text-sm font-semibold text-[#0a7c4a] hover:underline"
                    >
                        Volver a los detalles
                    </Link>
                </section>
            </div>
        </>
    );
}
