import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Box,
    Headphones,
    Layers,
    LifeBuoy,
    Moon,
    Power,
    Sun,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BRAND_COLOR } from '@/data/equipment';
import { useAppearance } from '@/hooks/use-appearance';
import {
    dashboard as adminDashboard,
    modelosEquipos as adminModelosEquipos,
} from '@/routes/admin';
import { index as adminCotizaciones } from '@/routes/admin/cotizaciones';
import { create as adminEquipos } from '@/routes/admin/equipos';
import { update as updateMantenimientoSitio } from '@/routes/admin/mantenimiento-sitio';
import { index as adminSoporte } from '@/routes/admin/soporte';
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

type MantenimientoSitio = {
    enabled: boolean;
    hours: number;
    minutes: number;
    until: string | null;
};

type PageProps = {
    stats: StatItem[];
    acciones: AccionItem[];
    actividad: ActividadItem[];
    resumenMensual: ResumenMensual | null;
    mantenimientoSitio: MantenimientoSitio | null;
};

const statIcons = {
    equipos: Box,
    modelos: Layers,
    soporte: LifeBuoy,
    cotizaciones: Headphones,
} as const;

const statHrefs = {
    equipos: adminEquipos(),
    modelos: adminModelosEquipos(),
    soporte: adminSoporte(),
    cotizaciones: adminCotizaciones(),
} as const;

function remainingFromUntil(until: string | null): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
} {
    if (!until) {
        return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = Math.max(
        0,
        Math.floor((new Date(until).getTime() - Date.now()) / 1000),
    );

    return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        totalSeconds,
    };
}

function padTime(value: number): string {
    return String(value).padStart(2, '0');
}

function ModoMantenimientoCard({
    mantenimientoSitio,
}: {
    mantenimientoSitio: MantenimientoSitio;
}) {
    const [hours, setHours] = useState(String(mantenimientoSitio.hours));
    const [minutes, setMinutes] = useState(String(mantenimientoSitio.minutes));
    const [processing, setProcessing] = useState(false);
    const [remaining, setRemaining] = useState(() =>
        remainingFromUntil(mantenimientoSitio.until),
    );
    const expiredReload = useRef(false);

    useEffect(() => {
        setHours(String(mantenimientoSitio.hours));
        setMinutes(String(mantenimientoSitio.minutes));
        expiredReload.current = false;
        setRemaining(remainingFromUntil(mantenimientoSitio.until));
    }, [
        mantenimientoSitio.enabled,
        mantenimientoSitio.hours,
        mantenimientoSitio.minutes,
        mantenimientoSitio.until,
    ]);

    useEffect(() => {
        if (!mantenimientoSitio.enabled || !mantenimientoSitio.until) {
            return;
        }

        const tick = () => {
            const next = remainingFromUntil(mantenimientoSitio.until);
            setRemaining(next);

            if (next.totalSeconds <= 0 && !expiredReload.current) {
                expiredReload.current = true;
                router.reload({ only: ['mantenimientoSitio'] });
            }
        };

        tick();
        const interval = window.setInterval(tick, 1000);

        return () => window.clearInterval(interval);
    }, [mantenimientoSitio.enabled, mantenimientoSitio.until]);

    const toggle = () => {
        setProcessing(true);
        router.put(
            updateMantenimientoSitio.url(),
            {
                enabled: !mantenimientoSitio.enabled,
                hours: Number(hours) || 0,
                minutes: Number(minutes) || 0,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="rounded-xl border border-[#0a7c4a]/25 bg-[#0a7c4a]/5 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                        Modo mantenimiento
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Configura el temporizador y enciende el anuncio público.
                    </p>
                </div>
                <button
                    type="button"
                    aria-label={
                        mantenimientoSitio.enabled
                            ? 'Apagar modo mantenimiento'
                            : 'Encender modo mantenimiento'
                    }
                    disabled={processing}
                    onClick={toggle}
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full border transition ${
                        mantenimientoSitio.enabled
                            ? 'border-[#0a7c4a] bg-[#0a7c4a] text-white'
                            : 'border-[#0a7c4a]/40 bg-background text-[#0a7c4a] hover:bg-[#0a7c4a]/10'
                    }`}
                >
                    <Power className="size-5" strokeWidth={1.75} />
                </button>
            </div>

            {mantenimientoSitio.enabled ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="grid gap-1.5">
                        <p className="text-xs text-muted-foreground">Horas</p>
                        <p className="rounded-md border border-border bg-background px-2 py-2 text-center text-lg font-semibold tabular-nums text-foreground">
                            {padTime(remaining.hours)}
                        </p>
                    </div>
                    <div className="grid gap-1.5">
                        <p className="text-xs text-muted-foreground">Minutos</p>
                        <p className="rounded-md border border-border bg-background px-2 py-2 text-center text-lg font-semibold tabular-nums text-foreground">
                            {padTime(remaining.minutes)}
                        </p>
                    </div>
                    <div className="grid gap-1.5">
                        <p className="text-xs text-muted-foreground">
                            Segundos
                        </p>
                        <p className="rounded-md border border-border bg-background px-2 py-2 text-center text-lg font-semibold tabular-nums text-foreground">
                            {padTime(remaining.seconds)}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="mantenimiento-horas" className="text-xs">
                            Horas
                        </Label>
                        <Input
                            id="mantenimiento-horas"
                            type="number"
                            min={0}
                            max={72}
                            value={hours}
                            disabled={processing}
                            onChange={(event) => setHours(event.target.value)}
                            className="h-9"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label
                            htmlFor="mantenimiento-minutos"
                            className="text-xs"
                        >
                            Minutos
                        </Label>
                        <Input
                            id="mantenimiento-minutos"
                            type="number"
                            min={0}
                            max={59}
                            value={minutes}
                            disabled={processing}
                            onChange={(event) =>
                                setMinutes(event.target.value)
                            }
                            className="h-9"
                        />
                    </div>
                </div>
            )}

            <p className="mt-3 text-xs text-muted-foreground">
                Estado:{' '}
                <span className="font-medium text-foreground">
                    {mantenimientoSitio.enabled ? 'Encendido' : 'Apagado'}
                </span>
            </p>
        </div>
    );
}

export default function DashboardAdmin({
    stats,
    actividad,
    resumenMensual,
    mantenimientoSitio,
}: PageProps) {
    const { auth } = usePage().props;
    const admin = auth.admin as AdminUser | null | undefined;
    const { updateAppearance } = useAppearance();
    const maxCotizaciones = Math.max(
        ...(resumenMensual?.dias.map((dia) => dia.total) ?? [0]),
        1,
    );

    return (
        <>
            <Head title="Panel de administración" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <div
                    className={`grid gap-4 ${mantenimientoSitio ? 'lg:grid-cols-[minmax(0,1fr)_20rem]' : ''}`}
                >
                    <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="absolute top-4 right-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                aria-label="Cambiar tema"
                                onClick={() => {
                                    const isDark =
                                        document.documentElement.classList.contains(
                                            'dark',
                                        );

                                    updateAppearance(
                                        isDark ? 'light' : 'dark',
                                    );
                                }}
                            >
                                <Sun className="hidden size-4 dark:block" />
                                <Moon className="size-4 dark:hidden" />
                                <span className="hidden dark:inline">
                                    Modo claro
                                </span>
                                <span className="dark:hidden">
                                    Modo oscuro
                                </span>
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
                                Consulte el estado de módulos, equipos y
                                solicitudes de soporte, y el ingreso diario de
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

                    {mantenimientoSitio ? (
                        <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <h2 className="text-sm font-semibold text-foreground">
                                Acciones rápidas
                            </h2>
                            <div className="mt-3">
                                <ModoMantenimientoCard
                                    mantenimientoSitio={mantenimientoSitio}
                                />
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
                                Aún no hay actividad reciente en módulos,
                                equipos o soporte.
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
