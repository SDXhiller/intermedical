import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Box,
    Headphones,
    Layers,
    Moon,
    Plus,
    Sun,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND_COLOR } from '@/data/equipment';
import { useAppearance } from '@/hooks/use-appearance';
import {
    dashboard as adminDashboard,
    modelosEquipos as adminModelosEquipos,
} from '@/routes/admin';
import { index as adminCotizaciones } from '@/routes/admin/cotizaciones';
import { create as adminEquipos } from '@/routes/admin/equipos';
import { index as adminServicios } from '@/routes/admin/servicios';
import type { AdminUser } from '@/types';

type StatItem = {
    key: string;
    title: string;
    value: number;
    status: string;
    trend: string;
};

type AccionItem = {
    key: string;
    title: string;
};

type ActividadItem = {
    id: string;
    title: string;
    time: string;
};

type ResumenMensual = {
    mes: string;
    total: number;
    dias: Array<{
        dia: number;
        total: number;
        esHoy: boolean;
    }>;
};

type PageProps = {
    stats: StatItem[];
    acciones: AccionItem[];
    actividad: ActividadItem[];
    resumenMensual: ResumenMensual | null;
};

const statIcons = {
    equipos: Box,
    modelos: Layers,
    servicios: Wrench,
    cotizaciones: Headphones,
} as const;

const accionIcons = {
    equipos: Box,
    modelos: Layers,
    servicios: Wrench,
    cotizaciones: Headphones,
} as const;

const statHrefs = {
    equipos: adminEquipos(),
    modelos: adminModelosEquipos(),
    servicios: adminServicios(),
    cotizaciones: adminCotizaciones(),
} as const;

const accionHrefs = statHrefs;

export default function DashboardAdmin({
    stats,
    acciones,
    actividad,
    resumenMensual,
}: PageProps) {
    const { auth } = usePage().props;
    const admin = auth.admin as AdminUser | null | undefined;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const maxCotizaciones = Math.max(
        ...(resumenMensual?.dias.map((dia) => dia.total) ?? [0]),
        1,
    );

    return (
        <>
            <Head title="Panel de administración" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <div
                    className={`grid gap-4 ${acciones.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_18rem]' : ''}`}
                >
                    <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="absolute top-4 right-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    updateAppearance(isDark ? 'light' : 'dark')
                                }
                            >
                                {isDark ? (
                                    <Sun className="size-4" />
                                ) : (
                                    <Moon className="size-4" />
                                )}
                                Modo {isDark ? 'claro' : 'oscuro'}
                            </Button>
                        </div>

                        <div className="max-w-2xl pr-28">
                            <p className="text-xs font-semibold tracking-wider text-[#0a7c4a]">
                                MEDICAL IMAGING GROUP
                            </p>
                            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                                Bienvenido al panel de control
                                {admin?.name ? `, ${admin.name}` : ''}
                            </h1>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Consulte el estado de equipos, modelos y
                                servicios registrados, y el ingreso diario de
                                cotizaciones.
                            </p>
                        </div>

                        <div
                            className="pointer-events-none absolute -right-6 -bottom-8 opacity-10"
                            aria-hidden="true"
                        >
                            <div
                                className="grid size-40 grid-cols-3 gap-2"
                                style={{ color: BRAND_COLOR }}
                            >
                                {Array.from({ length: 9 }).map((_, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-current"
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {acciones.length > 0 ? (
                        <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <h2 className="text-sm font-semibold text-foreground">
                                Acciones rápidas
                            </h2>
                            <div className="mt-3 space-y-2">
                                {acciones.map((accion) => {
                                    const Icon =
                                        accionIcons[
                                            accion.key as keyof typeof accionIcons
                                        ] ?? Box;

                                    return (
                                        <Link
                                            key={accion.key}
                                            href={
                                                accionHrefs[
                                                    accion.key as keyof typeof accionHrefs
                                                ]
                                            }
                                            prefetch
                                            className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:border-[#0a7c4a]/40 hover:bg-[#0a7c4a]/5"
                                        >
                                            <Icon
                                                className="size-4 text-[#0a7c4a]"
                                                strokeWidth={1.75}
                                            />
                                            {accion.title}
                                            <Plus className="ml-auto size-3.5 text-muted-foreground" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </aside>
                    ) : null}
                </div>

                {stats.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => {
                            const Icon =
                                statIcons[
                                    stat.key as keyof typeof statIcons
                                ] ?? Box;
                            const href =
                                statHrefs[stat.key as keyof typeof statHrefs];

                            return (
                                <Link
                                    key={stat.key}
                                    href={href}
                                    prefetch
                                    className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-[#0a7c4a]/40 hover:bg-[#0a7c4a]/5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {stat.title}
                                        </p>
                                        <Icon
                                            className="size-4 text-[#0a7c4a]"
                                            strokeWidth={1.75}
                                        />
                                    </div>
                                    <p className="mt-3 text-3xl font-bold text-foreground">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-foreground">
                                        {stat.status}
                                    </p>
                                    <p className="mt-2 text-xs text-[#0a7c4a]">
                                        {stat.trend}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                ) : null}

                <div
                    className={`grid gap-4 ${resumenMensual ? 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]' : ''}`}
                >
                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Activity className="size-4 text-[#0a7c4a]" />
                            <h2 className="text-sm font-semibold text-foreground">
                                Actividad reciente
                            </h2>
                        </div>
                        {actividad.length === 0 ? (
                            <p className="mt-4 text-sm text-muted-foreground">
                                Aún no hay actividad reciente en equipos,
                                modelos o servicios.
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {actividad.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 size-2 shrink-0 rounded-full bg-[#0a7c4a]" />
                                            <p className="text-sm text-foreground">
                                                {item.title}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {item.time}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {resumenMensual ? (
                        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-foreground">
                                Resumen mensual
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Cotizaciones recibidas en {resumenMensual.mes}:{' '}
                                {resumenMensual.total}
                            </p>
                            <div className="mt-6 flex h-40 items-end gap-0.5 px-1">
                                {resumenMensual.dias.map((dia) => (
                                    <div
                                        key={dia.dia}
                                        title={`${dia.dia}: ${dia.total} ${dia.total === 1 ? 'cotización' : 'cotizaciones'}`}
                                        className={`flex-1 rounded-t-md ${
                                            dia.esHoy
                                                ? 'bg-[#0a7c4a]'
                                                : 'bg-[#0a7c4a]/70'
                                        }`}
                                        style={{
                                            height: `${Math.max(
                                                (dia.total / maxCotizaciones) *
                                                    100,
                                                dia.total > 0 ? 8 : 2,
                                            )}%`,
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                                <span>1</span>
                                <span>
                                    {Math.ceil(resumenMensual.dias.length / 2)}
                                </span>
                                <span>
                                    {
                                        resumenMensual.dias[
                                            resumenMensual.dias.length - 1
                                        ]?.dia
                                    }
                                </span>
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
        </>
    );
}

DashboardAdmin.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: adminDashboard(),
        },
    ],
};
