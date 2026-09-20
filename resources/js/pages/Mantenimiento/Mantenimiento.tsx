import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Check,
    Clock3,
    Headphones,
} from 'lucide-react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import {
    maintenanceServices,
    type MaintenanceService,
} from '@/data/maintenance-services';
import { contacto } from '@/routes';
import { soporte } from '@/routes/mantenimiento';

const attendedModalities = [
    'Ultrasonido',
    'Rayos X',
    'Mastografía',
    'Angiografía',
    'Arco en C',
    'Resonancia Magnética',
    'Tomografía',
    'Medicina Nuclear e Imagen Molecular',
] as const;

function maintenanceImage(filename: string): string {
    return `/Imagen/Mantenimiento/${encodeURIComponent(filename)}`;
}

function ServiceCard({ service }: { service: MaintenanceService }) {
    return (
        <article className="flex h-full min-h-[280px] flex-col rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-sm dark:bg-black sm:min-h-[300px]">
            <h2 className="text-lg font-bold tracking-tight text-white">
                {service.title}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/75">
                {service.description}
            </p>

            <ul className="mt-3.5 space-y-1.5">
                {service.features.map((feature) => (
                    <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-white"
                    >
                        <span
                            className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            <Check className="size-2.5" strokeWidth={3} />
                        </span>
                        {feature}
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex items-start gap-2">
                <Clock3
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: BRAND_COLOR }}
                    strokeWidth={1.75}
                />
                <div>
                    <p className="text-[11px] text-white/65">
                        Tiempo estimado de respuesta
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-white">
                        {service.responseTime}
                    </p>
                </div>
            </div>

            <Link
                href={soporte.url({
                    query: { servicio: service.slug },
                })}
                className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: BRAND_COLOR }}
            >
                <CalendarDays className="size-3.5" strokeWidth={1.75} />
                Solicitar servicio
                <ArrowRight className="size-3.5" />
            </Link>
        </article>
    );
}

export default function Mantenimiento() {
    return (
        <>
            <Head title="Mantenimiento" />

            <section className="relative min-h-[480px] overflow-hidden sm:min-h-[540px] lg:min-h-[620px]">
                <img
                    src={maintenanceImage('Mantenimeinto.png')}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-slate-950/75" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/30" />

                <div
                    className={`relative mx-auto flex min-h-[inherit] ${CONTENT_WIDTH} items-center py-14 sm:py-16 lg:py-20`}
                >
                    <div className="w-[90%] max-w-none animate-[fade-up_0.7s_ease-out]">
                        <p
                            className="text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                            style={{ color: BRAND_COLOR }}
                        >
                            Nuestros servicios más solicitados
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                            Soporte técnico para equipos de diagnóstico por imagen
                        </h1>
                        <h2>
                        Contamos con ingenieros especializados y capacitados por marcas líderes a nivel mundial.
                        </h2>
                        <div
                            className="mt-4 h-1 w-14 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <p className="mt-5 text-sm leading-relaxed text-white/90 sm:text-base">
                        Brindamos diagnóstico, mantenimiento preventivo y correctivo, renta, instalación, desinstalación y puesta en marcha de equipos.
                        Acompañamos a hospitales, clínicas y gabinetes de imagenología con atención especializada y soluciones acordes con sus necesidades.
                        </p>

                        <h2 className="mt-7 text-lg font-bold tracking-tight text-white sm:text-xl">
                            Soporte especializado para sus equipos médicos
                        </h2>
                        <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            <p>
                                Todos nuestros servicios de{' '}
                                <strong className="font-semibold text-white">
                                    mantenimiento preventivo y correctivo,
                                    instalación, puesta en marcha y capacitación
                                    técnica
                                </strong>{' '}
                                son realizados y supervisados por personal
                                profesional e ingenieros capacitados en equipos
                                médicos. Cada procedimiento se lleva a cabo con
                                atención a los requerimientos técnicos de cada
                                sistema, buscando garantizar un funcionamiento
                                seguro, confiable y eficiente.
                            </p>
                            <p>
                                Nuestro equipo brinda acompañamiento durante
                                cada etapa del servicio, desde la evaluación
                                inicial y el diagnóstico hasta la instalación,
                                verificación y capacitación del personal,
                                ofreciendo atención especializada y soluciones
                                adecuadas a las necesidades de cada equipo e
                                institución médica.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-white/10 bg-neutral-950 py-10 dark:bg-black sm:py-12">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Modalidades que atendemos
                    </h2>
                    <div
                        className="mt-3 h-1 w-14 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                    />
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                        Brindamos soporte técnico especializado para equipos de:
                    </p>
                    <ul className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-white sm:text-[15px]">
                        {attendedModalities.map((modality, index) => (
                            <li
                                key={modality}
                                className="inline-flex items-center gap-2"
                            >
                                {index > 0 && (
                                    <span
                                        className="select-none"
                                        style={{ color: BRAND_COLOR }}
                                        aria-hidden="true"
                                    >
                                        ·
                                    </span>
                                )}
                                <span className="font-medium">{modality}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section
                className={`mx-auto ${CONTENT_WIDTH} py-10 sm:py-12 lg:py-14`}
            >
                <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
                    {maintenanceServices.map((service) => (
                        <ServiceCard key={service.slug} service={service} />
                    ))}
                </div>
            </section>

            <section
                className={`mx-auto ${CONTENT_WIDTH} max-w-6xl pb-12 lg:pb-16`}
            >
                <div
                    id="contacto"
                    className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 sm:flex-row sm:items-center sm:px-6 dark:border-neutral-800 dark:bg-neutral-900/80"
                >
                    <div className="flex items-start gap-4 sm:items-center">
                        <span
                            className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            <Headphones className="size-5" strokeWidth={1.75} />
                        </span>
                        <p className="text-sm leading-relaxed text-gray-700 sm:text-base dark:text-gray-200">
                            ¿Necesita asesoría o atención inmediata? Nuestro
                            equipo está listo para ayudarle.
                        </p>
                    </div>

                    <Link
                        href={contacto()}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-[#0a7c4a]/5 dark:bg-neutral-950"
                        style={{
                            borderColor: BRAND_COLOR,
                            color: BRAND_COLOR,
                        }}
                    >
                        Contáctenos
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>

            <style>{`
                @keyframes fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
