import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Check,
    Clock3,
    Headphones,
} from 'lucide-react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { contacto } from '@/routes';

function maintenanceImage(filename: string): string {
    return `/Imagen/Mantenimiento/${encodeURIComponent(filename)}`;
}

type ServiceBlock = {
    title: string;
    slug: string;
    description: string;
    image: string;
    features: string[];
    responseTime: string;
    imageLeft: boolean;
};

const services: ServiceBlock[] = [
    {
        title: 'Mantenimiento preventivo',
        slug: 'mantenimiento-preventivo',
        description:
            'Servicio especializado orientado a conservar los equipos médicos en condiciones óptimas de funcionamiento. Incluye revisiones periódicas, limpieza, calibración, ajustes y verificación de componentes, con el objetivo de prevenir fallas, mantener un desempeño confiable y prolongar la vida útil del equipo.',
        image: maintenanceImage('Mantenimeinto preventivo.png'),
        features: ['Revisión general', 'Calibración', 'Limpieza y ajustes'],
        responseTime: '24 - 48 horas',
        imageLeft: true,
    },
    {
        title: 'Mantenimiento correctivo',
        slug: 'mantenimiento-correctivo',
        description:
            'Servicio destinado al diagnóstico y solución de fallas que puedan afectar el funcionamiento de los equipos médicos. Nuestro personal técnico realiza una evaluación especializada para identificar el origen del problema, efectuar las reparaciones necesarias y restablecer la operación del equipo de manera segura y eficiente.',
        image: maintenanceImage('mantenimiento correctivo.png'),
        features: [
            'Diagnóstico especializado',
            'Reparación de fallas',
            'Refacciones originales',
        ],
        responseTime: 'Según diagnóstico',
        imageLeft: false,
    },
    {
        title: 'Instalación y puesta en marcha',
        slug: 'instalacion-y-puesta-en-marcha',
        description:
            'Servicio integral para la correcta instalación, configuración y puesta en operación de equipos médicos. Se realizan verificaciones técnicas, pruebas de funcionamiento y ajustes necesarios para garantizar que el sistema quede preparado para su uso conforme a sus características y requerimientos de operación.',
        image: maintenanceImage('Instalacion y puesta en marca.png'),
        features: [
            'Instalación',
            'Configuración completa',
            'Pruebas de funcionamiento',
            'Capacitación básica',
        ],
        responseTime: 'Programado',
        imageLeft: true,
    },
    {
        title: 'Capacitación técnica',
        slug: 'capacitacion-tecnica',
        description:
            'Capacitación especializada dirigida al personal encargado de la operación y manejo de los equipos médicos. El objetivo es proporcionar los conocimientos necesarios para utilizar correctamente el sistema, conocer sus principales funciones y aplicar buenas prácticas que contribuyan a una operación segura, eficiente y adecuada del equipo.',
        image: maintenanceImage('capacitacion tecnica.png'),
        features: [
            'Operación de equipos',
            'Seguridad y buenas prácticas',
            'Certificado de capacitación',
        ],
        responseTime: '1 - 2 días',
        imageLeft: false,
    },
];

function ServiceSection({ service }: { service: ServiceBlock }) {
    const textOnLeft = service.imageLeft;

    return (
        <article className="relative overflow-hidden rounded-2xl border border-white/10 shadow-sm">
            <div className="relative min-h-[22rem] sm:min-h-[24rem] lg:min-h-[26rem]">
                <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 size-full object-cover object-center transition duration-700 ease-out hover:scale-[1.04]"
                />
                <div
                    className={`absolute inset-0 ${
                        textOnLeft
                            ? 'bg-gradient-to-r from-black/82 via-black/62 to-black/12'
                            : 'bg-gradient-to-l from-black/82 via-black/62 to-black/12'
                    }`}
                />
                <div className="absolute inset-0 bg-black/20" />

                <div
                    className={`relative z-10 flex h-full min-h-[inherit] items-center ${
                        textOnLeft ? 'justify-start' : 'justify-end'
                    }`}
                >
                    <div className="w-full max-w-xl px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
                        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                            {service.title}
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-white/80">
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
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        <Check
                                            className="size-2.5"
                                            strokeWidth={3}
                                        />
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
                            href={contacto.url({
                                query: { tipo: service.slug },
                            })}
                            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            <CalendarDays
                                className="size-3.5"
                                strokeWidth={1.75}
                            />
                            Solicitar servicio
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
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
                            Productos y soluciones diseñados para usted
                        </h1>
                        <div
                            className="mt-4 h-1 w-14 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <p className="mt-5 text-sm leading-relaxed text-white/90 sm:text-base">
                            Brindamos soporte técnico especializado para
                            garantizar el máximo rendimiento y disponibilidad de
                            sus equipos médicos.
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

            <section
                className={`mx-auto ${CONTENT_WIDTH} max-w-6xl space-y-5 py-10 sm:space-y-6 sm:py-12 lg:py-14`}
            >
                {services.map((service) => (
                    <ServiceSection key={service.title} service={service} />
                ))}
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
