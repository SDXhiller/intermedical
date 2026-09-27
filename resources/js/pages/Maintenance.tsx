import { Head } from '@inertiajs/react';

const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';

export default function Maintenance({ until }: { until: string | null }) {
    const untilLabel = until
        ? new Date(until).toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short',
          })
        : null;

    return (
        <>
            <Head title="Sitio en mantenimiento" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
                <img
                    src={MIG_HORIZONTAL_WHITE}
                    alt="Medical Imaging Group"
                    className="h-12 w-auto max-w-[240px] object-contain"
                />
                <h1 className="mt-8 text-3xl font-bold tracking-tight">
                    Sitio en mantenimiento
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                    Estamos realizando labores de mantenimiento. El sitio
                    volverá a estar disponible en breve.
                </p>
                {untilLabel ? (
                    <p className="mt-4 text-xs text-white/50">
                        Estimado: {untilLabel}
                    </p>
                ) : null}
            </div>
        </>
    );
}
