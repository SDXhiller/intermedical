import { Head, Link } from '@inertiajs/react';
import {
    Clock3,
    Headphones,
    Home,
    Mail,
    MessageCircle,
    Phone,
    ShieldCheck,
    UserRoundCog,
    type LucideIcon,
} from 'lucide-react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { getMaintenanceServiceBySlug } from '@/data/maintenance-services';
import { home, mantenimiento } from '@/routes';

type ServicioIcono = 'telefono' | 'soporte' | 'correo' | 'whatsapp';

type ServicioTelefono = {
    id: number;
    nombre: string;
    numero: string;
    tipo: string;
};

type ServicioCorreo = {
    id: number;
    nombre: string;
    correo: string;
};

type ServicioHorario = {
    id: number;
    dias: string;
    hora_inicio: string;
    hora_fin: string;
};

type ServicioPublico = {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string | null;
    icono: ServicioIcono;
    telefono: ServicioTelefono | null;
    correo: ServicioCorreo | null;
    horario: ServicioHorario | null;
};

const trustFeatures = [
    {
        icon: UserRoundCog,
        title: 'Ingenieros capacitados',
        description: 'Personal especializado en equipos médicos.',
    },
    {
        icon: Headphones,
        title: 'Atención personalizada',
        description: 'Soluciones a la medida de sus necesidades.',
    },
    {
        icon: ShieldCheck,
        title: 'Compromiso y calidad',
        description: 'Servicios confiables y garantizados.',
    },
] as const;

const iconMap: Record<ServicioIcono, LucideIcon> = {
    telefono: Phone,
    soporte: Headphones,
    correo: Mail,
    whatsapp: MessageCircle,
};

function maintenanceImage(filename: string): string {
    return `/Imagen/Mantenimiento/${encodeURIComponent(filename)}`;
}

function formatTime(value: string): string {
    return value.slice(0, 5);
}

function phoneDigits(numero: string): string {
    return numero.replace(/\D/g, '');
}

function telHref(numero: string): string {
    const digits = numero.replace(/[^\d+]/g, '');

    return `tel:${digits}`;
}

function whatsappHref(numero: string): string {
    return `https://wa.me/${phoneDigits(numero)}`;
}

function cardPresentation(servicio: ServicioPublico): {
    Icon: LucideIcon;
    subtitle: string | null;
    highlight: string | null;
    highlightHref: string | null;
    actionLabel: string;
    actionHref: string | null;
    outlined: boolean;
} {
    const Icon = iconMap[servicio.icono] ?? Phone;

    if (servicio.icono === 'correo') {
        const email = servicio.correo?.correo ?? null;

        return {
            Icon,
            subtitle: servicio.descripcion,
            highlight: email,
            highlightHref: email ? `mailto:${email}` : null,
            actionLabel: 'Enviar correo',
            actionHref: email ? `mailto:${email}` : null,
            outlined: true,
        };
    }

    const phone = servicio.telefono?.numero ?? null;

    if (servicio.icono === 'whatsapp') {
        return {
            Icon,
            subtitle:
                servicio.descripcion ??
                servicio.telefono?.nombre ??
                'Mensaje por WhatsApp',
            highlight: phone,
            highlightHref: phone ? whatsappHref(phone) : null,
            actionLabel: 'Escribir por WhatsApp',
            actionHref: phone ? whatsappHref(phone) : null,
            outlined: false,
        };
    }

    return {
        Icon,
        subtitle:
            servicio.descripcion ??
            servicio.telefono?.nombre ??
            (servicio.icono === 'soporte'
                ? 'Asistencia para equipos y servicios técnicos'
                : 'Ventas y servicios'),
        highlight: phone,
        highlightHref: phone ? telHref(phone) : null,
        actionLabel: servicio.icono === 'soporte' ? 'Llamar a soporte' : 'Llamar',
        actionHref: phone ? telHref(phone) : null,
        outlined: false,
    };
}

function ServicioCard({ servicio }: { servicio: ServicioPublico }) {
    const presentation = cardPresentation(servicio);
    const Icon = presentation.Icon;

    return (
        <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
                <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                    style={{ color: BRAND_COLOR }}
                >
                    <Icon className="size-5" strokeWidth={1.75} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {servicio.nombre}
                </h3>
            </div>

            {presentation.subtitle && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {presentation.subtitle}
                </p>
            )}

            {presentation.highlight && presentation.highlightHref ? (
                <a
                    href={presentation.highlightHref}
                    className={`mt-4 break-all font-bold transition hover:opacity-80 ${
                        servicio.icono === 'correo'
                            ? 'text-base sm:text-lg'
                            : 'text-xl sm:text-2xl'
                    }`}
                    style={{ color: BRAND_COLOR }}
                >
                    {presentation.highlight}
                </a>
            ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                    Datos de contacto no disponibles
                </p>
            )}

            {servicio.horario && (
                <>
                    <div className="mt-4 border-t border-gray-200 dark:border-neutral-700" />
                    <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                        <Clock3
                            className="mt-0.5 size-4 shrink-0"
                            style={{ color: BRAND_COLOR }}
                            strokeWidth={1.75}
                        />
                        <span>
                            <span className="block">{servicio.horario.dias}</span>
                            <span className="block">
                                {formatTime(servicio.horario.hora_inicio)} a{' '}
                                {formatTime(servicio.horario.hora_fin)} h
                            </span>
                        </span>
                    </p>
                </>
            )}

            <div className="mt-auto pt-6">
                {presentation.actionHref ? (
                    <a
                        href={presentation.actionHref}
                        target={
                            servicio.icono === 'whatsapp'
                                ? '_blank'
                                : undefined
                        }
                        rel={
                            servicio.icono === 'whatsapp'
                                ? 'noopener noreferrer'
                                : undefined
                        }
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                            presentation.outlined
                                ? 'border-2 bg-white hover:bg-[#0a7c4a]/5 dark:bg-neutral-950'
                                : 'text-white hover:opacity-90'
                        }`}
                        style={
                            presentation.outlined
                                ? {
                                      borderColor: BRAND_COLOR,
                                      color: BRAND_COLOR,
                                  }
                                : {
                                      backgroundColor: BRAND_COLOR,
                                  }
                        }
                    >
                        {servicio.icono === 'correo' ? (
                            <Mail className="size-4" />
                        ) : servicio.icono === 'whatsapp' ? (
                            <MessageCircle className="size-4" />
                        ) : (
                            <Phone className="size-4" />
                        )}
                        {presentation.actionLabel}
                    </a>
                ) : (
                    <span className="inline-flex w-full items-center justify-center rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
                        Sin acción disponible
                    </span>
                )}
            </div>
        </article>
    );
}

type TipoServicio = {
    id: number;
    nombre: string;
    slug: string;
};

export default function MostrarContacto({
    servicios,
    tipoServicio = null,
}: {
    servicios: ServicioPublico[];
    tipoServicio?: TipoServicio | null;
}) {
    const heroTitle =
        tipoServicio !== null
            ? `Solicitar ${tipoServicio.nombre.toLowerCase()}`
            : 'Solicitar un servicio';

    const heroDescription =
        tipoServicio !== null
            ? (getMaintenanceServiceBySlug(tipoServicio.slug)?.description ??
              'Consulte nuestros canales de atención y contáctenos directamente. Nuestro equipo le responderá a la brevedad.')
            : 'Consulte nuestros canales de atención y contáctenos directamente. Nuestro equipo le responderá a la brevedad.';

    return (
        <>
            <Head title="Contacto" />

            <section className="relative min-h-[280px] overflow-hidden sm:min-h-[320px] lg:min-h-[360px]">
                <img
                    src={maintenanceImage('Mantenimeinto.png')}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-slate-950/75" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/25" />

                <div
                    className={`relative mx-auto flex min-h-[inherit] ${CONTENT_WIDTH} max-w-6xl items-center py-12 sm:py-14`}
                >
                    <div className="max-w-2xl">
                        <p
                            className="text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                            style={{ color: BRAND_COLOR }}
                        >
                            Contacto
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
                            {heroTitle}
                        </h1>
                        <div
                            className="mt-4 h-1 w-14 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                            {heroDescription}
                        </p>
                    </div>
                </div>
            </section>

            <nav
                aria-label="Breadcrumb"
                className="border-b border-gray-200 bg-gray-100 dark:border-neutral-800 dark:bg-neutral-900"
            >
                <div
                    className={`mx-auto flex ${CONTENT_WIDTH} max-w-6xl flex-wrap items-center gap-1.5 py-3 text-xs text-muted-foreground sm:text-sm`}
                >
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 transition hover:text-[#0a7c4a]"
                    >
                        <Home className="size-3.5 shrink-0" />
                        Inicio
                    </Link>
                    <span aria-hidden="true">›</span>
                    <Link
                        href={mantenimiento()}
                        className="transition hover:text-[#0a7c4a]"
                    >
                        Mantenimiento
                    </Link>
                    <span aria-hidden="true">›</span>
                    <span
                        className="font-semibold"
                        style={{ color: BRAND_COLOR }}
                        aria-current="page"
                    >
                        {tipoServicio?.nombre ?? 'Contacto'}
                    </span>
                </div>
            </nav>

            <section className="bg-gray-50 py-12 dark:bg-neutral-950 sm:py-14 lg:py-16">
                <div className={`mx-auto ${CONTENT_WIDTH} max-w-6xl`}>
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Estamos para ayudarle
                        </h2>
                        <div
                            className="mx-auto mt-3 h-1 w-12 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            {tipoServicio
                                ? `Canales de atención para ${tipoServicio.nombre.toLowerCase()}.`
                                : 'Elija el canal que prefiera. Nuestro equipo de ventas y soporte técnico está listo para atenderle.'}
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-6">
                        {servicios.length > 0 ? (
                            servicios.map((servicio) => (
                                <ServicioCard
                                    key={servicio.id}
                                    servicio={servicio}
                                />
                            ))
                        ) : (
                            <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
                                <p className="text-sm text-muted-foreground">
                                    {tipoServicio
                                        ? `Aún no hay contactos publicados para ${tipoServicio.nombre.toLowerCase()}.`
                                        : 'Aún no hay servicios publicados. Regístrelos desde el panel de administración.'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="relative mt-8 overflow-hidden rounded-xl border border-[#0a7c4a]/25 bg-gray-50 lg:mt-10 dark:border-[#0a7c4a]/30 dark:bg-neutral-900">
                        <div className="relative min-h-[9.5rem] sm:min-h-[10.5rem] lg:min-h-[11.5rem]">
                            <img
                                src={maintenanceImage(
                                    'capacitacion tecnica.png',
                                )}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 size-full object-cover object-[center_20%] opacity-90 sm:object-[70%_center]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 from-35% via-gray-50/90 via-55% to-transparent to-78% dark:from-neutral-900 dark:via-neutral-900/90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/40 to-transparent sm:hidden dark:from-neutral-900/50" />

                            <div className="relative z-10 flex h-full min-h-[inherit] items-center gap-4 px-5 py-5 sm:gap-5 sm:px-7 sm:py-6 lg:max-w-[58%]">
                                <span
                                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10 shadow-sm"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    <ShieldCheck
                                        className="size-6"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                                        Servicio profesional y confiable
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                                        Todos nuestros servicios están
                                        supervisados por ingenieros capacitados
                                        y personal profesional, garantizando
                                        calidad, seguridad y el mejor
                                        rendimiento de sus equipos médicos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#1a1d21] text-white">
                <div
                    className={`mx-auto grid ${CONTENT_WIDTH} max-w-6xl gap-8 py-10 sm:grid-cols-3 sm:gap-6 sm:py-12`}
                >
                    {trustFeatures.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center lg:flex-row lg:items-start lg:text-left"
                            >
                                <span
                                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/15"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    <Icon
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div>
                                    <p className="font-bold">{feature.title}</p>
                                    <p className="mt-1 text-sm text-white/70">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}
