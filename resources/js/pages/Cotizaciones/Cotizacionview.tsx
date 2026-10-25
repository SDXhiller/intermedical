
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    Eye,
    Headphones,
    Inbox,
    Mail,
    MapPin,
    Phone,
    Save,
    Search,
    Trash2,
    UserRound,
    X,
    XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import ClienteCotisacionController from '@/actions/App/Http/Controllers/Admin/ClienteCotisacionController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    index as adminCotizacionesIndex,
    update as actualizarSeguimiento,
} from '@/routes/admin/cotizaciones';

/* =====================================================
   TIPOS ORIGINALES
===================================================== */

type EquipoItem = {
    id: number;
    nombre: string;
    slug: string;
};

type CotizacionItem = {
    id: number;
    cliente: string;
    contacto: string;
    area: string;
    telefono: string;
    correo: string;
    calle: string;
    numero: string;
    colonia: string;
    cp: string;
    ciudad: string;
    direccion: string;
    latitud: string | null;
    longitud: string | null;
    equipo: EquipoItem | null;
    created_at: string | null;
    created_at_formatted: string | null;
    es_nueva: boolean;
    estado: EstadoCotizacion;
    observaciones: string;
};

type EstadoCotizacion = 'en_espera' | 'atendida' | 'cancelada';

type FiltroEstado = 'todas' | EstadoCotizacion;

const estados: Record<
    EstadoCotizacion,
    {
        label: string;
        className: string;
        dotClass: string;
    }
> = {
    en_espera: {
        label: 'Cotización en espera',
        className:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',
        dotClass: 'bg-amber-400',
    },
    atendida: {
        label: 'Cotización atendida',
        className:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        dotClass: 'bg-emerald-400',
    },
    cancelada: {
        label: 'Cotización cancelada',
        className: 'border-red-500/20 bg-red-500/10 text-red-400',
        dotClass: 'bg-red-400',
    },
};

const estadosSeguimiento: {
    value: EstadoCotizacion;
    label: string;
}[] = [
    { value: 'en_espera', label: 'Cotización en espera' },
    { value: 'atendida', label: 'Cotización atendida' },
    { value: 'cancelada', label: 'Cotización cancelada' },
];

type MesOption = {
    value: number;
    label: string;
};

type Filtros = {
    mes: number;
    anio: number;
    buscar: string;
};

type Resumen = {
    total_mes: number;
    total_filtrado: number;
    mes: number;
    mes_nombre: string;
    anio: number;
};

type Props = {
    cotizaciones: CotizacionItem[];
    filtros: Filtros;
    resumen: Resumen;
    meses: MesOption[];
    anios_disponibles: number[];
};

const NUEVA_COTIZACION_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 10;

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function getCreatedAtMs(
    cotizacion: CotizacionItem,
): number | null {
    if (!cotizacion.created_at) {
        return null;
    }

    const parsed = Date.parse(cotizacion.created_at);

    return Number.isNaN(parsed) ? null : parsed;
}

function isNuevaCotizacion(
    cotizacion: CotizacionItem,
    nowMs: number,
): boolean {
    const createdAtMs = getCreatedAtMs(cotizacion);

    if (createdAtMs === null) {
        return cotizacion.es_nueva;
    }

    return (
        nowMs >= createdAtMs &&
        nowMs - createdAtMs < NUEVA_COTIZACION_MS
    );
}

function nextNuevaExpiryMs(
    cotizaciones: CotizacionItem[],
    nowMs: number,
): number | null {
    const expirations = cotizaciones
        .map((cotizacion) => getCreatedAtMs(cotizacion))
        .filter(
            (value): value is number =>
                value !== null,
        )
        .map(
            (createdAtMs) =>
                createdAtMs + NUEVA_COTIZACION_MS,
        )
        .filter((expiresAtMs) => expiresAtMs > nowMs)
        .sort((a, b) => a - b);

    return expirations[0] ?? null;
}

function NotificationDot() {
    return (
        <span
            className="inline-block size-2.5 shrink-0 animate-pulse rounded-full bg-red-500 ring-2 ring-red-500/25"
            aria-label="Nueva solicitud"
        />
    );
}

function EstadoBadge({
    estado,
}: {
    estado: EstadoCotizacion;
}) {
    const config = estados[estado];

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${config.className}`}
        >
            <span className={`size-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
        </span>
    );
}

function DatoDetalle({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs text-white/40">
                {label}
            </p>

            <p className="mt-1 break-words [overflow-wrap:anywhere] text-sm font-medium text-white/85">
                {value || '—'}
            </p>
        </div>
    );
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

export default function Cotizacionview({
    cotizaciones,
    filtros,
    resumen,
    meses,
    anios_disponibles,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string | null };
    }>().props;

    const [nowMs, setNowMs] = useState(
        () => Date.now(),
    );

    const [buscar, setBuscar] = useState(
        filtros.buscar,
    );

    const [
        cotizacionSeleccionada,
        setCotizacionSeleccionada,
    ] = useState<CotizacionItem | null>(null);

    const [
        cotizacionToDelete,
        setCotizacionToDelete,
    ] = useState<CotizacionItem | null>(null);

    const [isDeleting, setIsDeleting] =
        useState(false);

    const [paginaActual, setPaginaActual] =
        useState(1);

    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('todas');

    const [seguimientoAbierto, setSeguimientoAbierto] =
        useState(false);

    const seguimiento = useForm<{
        estado: EstadoCotizacion;
        observaciones: string;
    }>({
        estado: 'en_espera',
        observaciones: '',
    });

    useEffect(() => {
        setCotizacionSeleccionada((actual) => {
            if (!actual) {
                return null;
            }

            return (
                cotizaciones.find(
                    (item) => item.id === actual.id,
                ) ?? actual
            );
        });
    }, [cotizaciones]);

    /* =====================================
       FILTROS ORIGINALES DE LARAVEL
    ===================================== */

    useEffect(() => {
        setBuscar(filtros.buscar);
    }, [filtros.buscar]);

    const applyFilters = (next: Partial<Filtros>) => {
        const params = {
            mes: next.mes ?? filtros.mes,
            anio: next.anio ?? filtros.anio,
            buscar: next.buscar ?? filtros.buscar,
        };

        router.get(
            adminCotizacionesIndex.url({
                query: {
                    mes: params.mes,
                    anio: params.anio,
                    ...(params.buscar !== ''
                        ? { buscar: params.buscar }
                        : {}),
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (buscar !== filtros.buscar) {
                applyFilters({ buscar });
            }
        }, 400);

        return () => window.clearTimeout(timer);
    }, [buscar, filtros.buscar]);

    /* =====================================
       NOTIFICACIONES DE NUEVAS SOLICITUDES
    ===================================== */

    const nuevaIds = useMemo(() => {
        return new Set(
            cotizaciones
                .filter((cotizacion) =>
                    isNuevaCotizacion(
                        cotizacion,
                        nowMs,
                    ),
                )
                .map((cotizacion) => cotizacion.id),
        );
    }, [cotizaciones, nowMs]);

    const hasNuevas = nuevaIds.size > 0;

    useEffect(() => {
        const expiresAtMs = nextNuevaExpiryMs(
            cotizaciones,
            nowMs,
        );

        if (expiresAtMs === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            setNowMs(Date.now());
        }, Math.max(expiresAtMs - Date.now(), 0));

        return () => window.clearTimeout(timer);
    }, [cotizaciones, nowMs]);

    /* =====================================
       PAGINACIÓN LOCAL
    ===================================== */

    const cotizacionesFiltradas = useMemo(() => {
        if (filtroEstado === 'todas') {
            return cotizaciones;
        }

        return cotizaciones.filter(
            (item) => item.estado === filtroEstado,
        );
    }, [cotizaciones, filtroEstado]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(cotizacionesFiltradas.length / PAGE_SIZE),
    );

    const paginaSegura = Math.min(
        paginaActual,
        totalPaginas,
    );

    const cotizacionesPaginadas =
        cotizacionesFiltradas.slice(
            (paginaSegura - 1) * PAGE_SIZE,
            paginaSegura * PAGE_SIZE,
        );

    useEffect(() => {
        setPaginaActual(1);
    }, [filtros.mes, filtros.anio, filtros.buscar, filtroEstado]);

    /* =====================================
       ELIMINAR SOLICITUD
    ===================================== */

    const confirmDelete = () => {
        if (!cotizacionToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(
            ClienteCotisacionController.destroy.url(
                cotizacionToDelete.id,
                {
                    query: {
                        mes: filtros.mes,
                        anio: filtros.anio,
                        ...(filtros.buscar
                            ? { buscar: filtros.buscar }
                            : {}),
                    },
                },
            ),
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsDeleting(false);
                    setCotizacionToDelete(null);
                },
            },
        );
    };

    const cerrarDetalle = () => {
        setSeguimientoAbierto(false);
        setCotizacionSeleccionada(null);
    };

    const abrirSeguimiento = () => {
        if (!cotizacionSeleccionada) {
            return;
        }

        seguimiento.setData({
            estado: cotizacionSeleccionada.estado,
            observaciones: cotizacionSeleccionada.observaciones,
        });
        seguimiento.clearErrors();
        setSeguimientoAbierto(true);
    };

    const guardarSeguimiento = (event: FormEvent) => {
        event.preventDefault();

        if (!cotizacionSeleccionada) {
            return;
        }

        seguimiento.patch(
            actualizarSeguimiento.url(cotizacionSeleccionada.id, {
                query: {
                    mes: filtros.mes,
                    anio: filtros.anio,
                    ...(filtros.buscar !== ''
                        ? { buscar: filtros.buscar }
                        : {}),
                },
            }),
            {
                preserveScroll: true,
                onSuccess: () => setSeguimientoAbierto(false),
            },
        );
    };

    const conteoEstado = (estado: EstadoCotizacion) =>
        cotizaciones.filter((item) => item.estado === estado)
            .length;

    const metricas = [
        {
            titulo: 'Solicitudes del mes',
            valor: resumen.total_mes,
            icono: Inbox,
            color: 'text-[#4cc185]',
            fondo: 'bg-[#006635]/15',
        },
        {
            titulo: 'Cotización en espera',
            valor: conteoEstado('en_espera'),
            icono: Clock3,
            color: 'text-amber-400',
            fondo: 'bg-amber-500/10',
        },
        {
            titulo: 'Cotización atendida',
            valor: conteoEstado('atendida'),
            icono: CheckCircle2,
            color: 'text-emerald-400',
            fondo: 'bg-emerald-500/10',
        },
        {
            titulo: 'Cotización cancelada',
            valor: conteoEstado('cancelada'),
            icono: XCircle,
            color: 'text-red-400',
            fondo: 'bg-red-500/10',
        },
    ];

    return (
        <>
            <Head title="Cotizaciones" />

            <div className="flex h-full flex-1 flex-col gap-7 p-4 md:p-6">
                <Heading
                    title="Cotizaciones"
                    description="Solicitudes enviadas desde el formulario público de cotización."
                />

                {flash?.success && (
                    <div className="rounded-xl border border-[#006635]/30 bg-[#006635]/10 px-4 py-3 text-sm font-medium text-[#4cc185]">
                        {flash.success}
                    </div>
                )}

                {/* =====================================
                    INDICADORES
                ===================================== */}
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {metricas.map((metrica) => {
                        const Icon = metrica.icono;

                        return (
                            <div
                                key={metrica.titulo}
                                className="rounded-xl border border-white/10 bg-[#141816] p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-medium text-white/55">
                                        {metrica.titulo}
                                    </p>

                                    <div
                                        className={`rounded-lg p-2 ${metrica.fondo}`}
                                    >
                                        <Icon
                                            className={`size-5 ${metrica.color}`}
                                        />
                                    </div>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-white">
                                    {metrica.valor}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* =====================================
                    FILTROS
                ===================================== */}
                <section className="rounded-2xl border border-white/10 bg-[#111513] p-5 sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            Filtros de búsqueda
                        </h2>

                        <p className="mt-1 text-sm text-white/45">
                            Consulta solicitudes por período
                            o nombre del cliente.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label
                                htmlFor="filtro-mes"
                                className="text-sm font-medium text-white/75"
                            >
                                Mes
                            </label>

                            <Select
                                value={String(filtros.mes)}
                                onValueChange={(value) =>
                                    applyFilters({
                                        mes: Number(value),
                                    })
                                }
                            >
                                <SelectTrigger
                                    id="filtro-mes"
                                    className="h-11 w-full border-white/15 bg-[#191e1b] text-white"
                                >
                                    <SelectValue placeholder="Seleccionar mes" />
                                </SelectTrigger>

                                <SelectContent>
                                    {meses.map((mes) => (
                                        <SelectItem
                                            key={mes.value}
                                            value={String(
                                                mes.value,
                                            )}
                                        >
                                            {mes.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="filtro-anio"
                                className="text-sm font-medium text-white/75"
                            >
                                Año
                            </label>

                            <Select
                                value={String(filtros.anio)}
                                onValueChange={(value) =>
                                    applyFilters({
                                        anio: Number(value),
                                    })
                                }
                            >
                                <SelectTrigger
                                    id="filtro-anio"
                                    className="h-11 w-full border-white/15 bg-[#191e1b] text-white"
                                >
                                    <SelectValue placeholder="Seleccionar año" />
                                </SelectTrigger>

                                <SelectContent>
                                    {anios_disponibles.map(
                                        (anio) => (
                                            <SelectItem
                                                key={anio}
                                                value={String(
                                                    anio,
                                                )}
                                            >
                                                {anio}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="filtro-buscar"
                                className="text-sm font-medium text-white/75"
                            >
                                Buscar por cliente
                            </label>

                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />

                                <input
                                    id="filtro-buscar"
                                    type="search"
                                    value={buscar}
                                    onChange={(event) =>
                                        setBuscar(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nombre del hospital o clínica"
                                    className="h-11 w-full rounded-lg border border-white/15 bg-[#191e1b] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#006635]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#006635]/25 bg-[#006635]/10 px-4 py-3">
                        <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#4cc185]" />

                        <div className="text-sm">
                            <p className="font-medium text-white/85">
                                En {resumen.mes_nombre} de{' '}
                                {resumen.anio} se solicitaron{' '}
                                {resumen.total_mes}{' '}
                                {resumen.total_mes === 1
                                    ? 'cotización'
                                    : 'cotizaciones'}.
                            </p>

                            {filtros.buscar !== '' && (
                                <p className="mt-1 text-white/50">
                                    Mostrando{' '}
                                    {resumen.total_filtrado}{' '}
                                    {resumen.total_filtrado ===
                                    1
                                        ? 'resultado'
                                        : 'resultados'}{' '}
                                    para "{filtros.buscar}".
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* =====================================
                    BANDEJA DE SOLICITUDES
                ===================================== */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111513]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <Headphones className="size-5 text-[#4cc185]" />

                            <h2 className="text-lg font-semibold text-white">
                                Solicitudes recibidas
                            </h2>

                            {hasNuevas && (
                                <NotificationDot />
                            )}
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/65">
                            {cotizacionesFiltradas.length}{' '}
                            {cotizacionesFiltradas.length === 1
                                ? 'solicitud'
                                : 'solicitudes'}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 border-b border-white/10 px-5 py-4 sm:px-6">
                        {(
                            [
                                ['todas', 'Todas'],
                                ['en_espera', 'Cotización en espera'],
                                ['atendida', 'Cotización atendida'],
                                ['cancelada', 'Cotización cancelada'],
                            ] as [FiltroEstado, string][]
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFiltroEstado(value)}
                                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                                    filtroEstado === value
                                        ? 'bg-[#006635] text-white'
                                        : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {cotizaciones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
                            <Inbox className="size-10 text-white/25" />

                            <p className="text-sm font-semibold text-white/70">
                                {filtros.buscar !== ''
                                    ? 'No se encontraron clientes con ese nombre'
                                    : `No hay solicitudes en ${resumen.mes_nombre} de ${resumen.anio}`}
                            </p>

                            <p className="text-xs text-white/40">
                                {filtros.buscar !== ''
                                    ? 'Prueba con otro nombre o limpia el buscador.'
                                    : 'Selecciona otro mes o año para consultar solicitudes anteriores.'}
                            </p>
                        </div>
                    ) : cotizacionesFiltradas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
                            <Inbox className="size-10 text-white/25" />

                            <p className="text-sm font-semibold text-white/70">
                                No hay solicitudes con ese estado.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tabla escritorio */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[850px] text-left">
                                    <thead className="border-b border-white/10 bg-[#171c19]">
                                        <tr className="text-xs font-semibold uppercase tracking-wide text-white/45">
                                            <th className="px-5 py-4">
                                                Cliente
                                            </th>
                                            <th className="px-5 py-4">
                                                Contacto
                                            </th>
                                            <th className="px-5 py-4">
                                                Equipo
                                            </th>
                                            <th className="px-5 py-4">
                                                Fecha
                                            </th>
                                            <th className="px-5 py-4">
                                                Estado
                                            </th>
                                            <th className="px-5 py-4">
                                                Notificación
                                            </th>
                                            <th className="px-5 py-4 text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/10">
                                        {cotizacionesPaginadas.map(
                                            (item) => (
                                                <tr
                                                    key={item.id}
                                                    className="transition hover:bg-white/[0.035]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="max-w-52 break-words text-sm font-semibold text-white">
                                                            {item.cliente}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-white/80">
                                                            {item.contacto}
                                                        </p>

                                                        <p className="mt-1 text-xs text-white/40">
                                                            {item.area ||
                                                                'Sin área'}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-white/75">
                                                            {item.equipo
                                                                ?.nombre ??
                                                                'Sin equipo'}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-xs text-white/55">
                                                            {item.created_at_formatted ??
                                                                '—'}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <EstadoBadge
                                                            estado={item.estado}
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {nuevaIds.has(
                                                            item.id,
                                                        ) ? (
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                                                                <NotificationDot />
                                                                Nueva
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-white/40">
                                                                Anterior
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setCotizacionSeleccionada(
                                                                        item,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#252b27] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#303b33]"
                                                            >
                                                                <Eye className="size-4" />
                                                                Ver solicitud
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setCotizacionToDelete(
                                                                        item,
                                                                    )
                                                                }
                                                                className="inline-flex size-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10"
                                                                aria-label="Eliminar solicitud"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tarjetas móvil */}
                            <div className="grid gap-3 p-4 lg:hidden">
                                {cotizacionesPaginadas.map(
                                    (item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-xl border border-white/10 bg-[#191e1b] p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    {nuevaIds.has(
                                                        item.id,
                                                    ) && (
                                                        <NotificationDot />
                                                    )}

                                                    <p className="break-words text-sm font-semibold text-white">
                                                        {item.cliente}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-xs text-white/40">
                                                    {item.created_at_formatted ??
                                                        '—'}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm text-white/65">
                                                {item.contacto}
                                            </p>

                                            <p className="mt-1 text-xs text-white/40">
                                                {item.equipo?.nombre ??
                                                    'Sin equipo'}
                                            </p>

                                            <div className="mt-3">
                                                <EstadoBadge
                                                    estado={item.estado}
                                                />
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCotizacionSeleccionada(
                                                            item,
                                                        )
                                                    }
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#252b27] px-3 py-2.5 text-xs font-semibold text-white"
                                                >
                                                    <Eye className="size-4" />
                                                    Ver solicitud
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCotizacionToDelete(
                                                            item,
                                                        )
                                                    }
                                                    className="inline-flex size-10 items-center justify-center rounded-lg border border-red-500/20 text-red-400"
                                                    aria-label="Eliminar solicitud"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>

                            {/* Paginación */}
                            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-white/45">
                                    Mostrando{' '}
                                    {(paginaSegura - 1) *
                                        PAGE_SIZE +
                                        1}{' '}
                                    -{' '}
                                    {Math.min(
                                        paginaSegura *
                                            PAGE_SIZE,
                                        cotizaciones.length,
                                    )}{' '}
                                    de {cotizacionesFiltradas.length}{' '}
                                    solicitudes
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={
                                            paginaSegura <= 1
                                        }
                                        onClick={() =>
                                            setPaginaActual(
                                                paginaSegura -
                                                    1,
                                            )
                                        }
                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </button>

                                    <span className="px-2 text-xs text-white/65">
                                        Página {paginaSegura} de{' '}
                                        {totalPaginas}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            paginaSegura >=
                                            totalPaginas
                                        }
                                        onClick={() =>
                                            setPaginaActual(
                                                paginaSegura +
                                                    1,
                                            )
                                        }
                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* =====================================
                MODAL DE DETALLES
            ===================================== */}
            {cotizacionSeleccionada && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            cerrarDetalle();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="detalle-cotizacion-titulo"
                        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111513] shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#4cc185]">
                                    Solicitud #{cotizacionSeleccionada.id}
                                </p>

                                <h2
                                    id="detalle-cotizacion-titulo"
                                    className="mt-1 text-xl font-bold text-white"
                                >
                                    Detalle de cotización
                                </h2>

                                <p className="mt-1 text-xs text-white/45">
                                    {cotizacionSeleccionada.created_at_formatted ??
                                        'Sin fecha'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarDetalle}
                                className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                                aria-label="Cerrar detalles"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="space-y-8 overflow-y-auto p-5 sm:p-6">
                            <EstadoBadge
                                estado={cotizacionSeleccionada.estado}
                            />

                            <section>
                                <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                    <UserRound className="size-4 text-[#4cc185]" />
                                    Datos del solicitante
                                </h3>

                                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                    <DatoDetalle
                                        label="Cliente o institución"
                                        value={cotizacionSeleccionada.cliente}
                                    />

                                    <DatoDetalle
                                        label="Nombre de contacto"
                                        value={cotizacionSeleccionada.contacto}
                                    />

                                    <DatoDetalle
                                        label="Área"
                                        value={cotizacionSeleccionada.area}
                                    />

                                    <DatoDetalle
                                        label="Equipo"
                                        value={
                                            cotizacionSeleccionada.equipo
                                                ?.nombre
                                        }
                                    />

                                    <DatoDetalle
                                        label="Teléfono"
                                        value={cotizacionSeleccionada.telefono}
                                    />

                                    <DatoDetalle
                                        label="Correo electrónico"
                                        value={cotizacionSeleccionada.correo}
                                    />

                                    <div className="sm:col-span-2">
                                        <DatoDetalle
                                            label="Dirección"
                                            value={cotizacionSeleccionada.direccion}
                                        />
                                    </div>
                                </div>
                            </section>

                            {cotizacionSeleccionada.latitud &&
                                cotizacionSeleccionada.longitud && (
                                    <section>
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                            <MapPin className="size-4 text-[#4cc185]" />
                                            Ubicación
                                        </h3>

                                        <a
                                            href={`https://www.google.com/maps?q=${encodeURIComponent(
                                                `${cotizacionSeleccionada.latitud},${cotizacionSeleccionada.longitud}`,
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-medium text-[#4cc185] hover:underline"
                                        >
                                            <MapPin className="size-4" />
                                            Ver ubicación en Google Maps
                                        </a>
                                    </section>
                                )}
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-4 sm:flex-row sm:justify-end sm:p-5">
                            <button
                                type="button"
                                onClick={abrirSeguimiento}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                <ClipboardList className="size-4" />
                                Seguimiento
                            </button>

                            <button
                                type="button"
                                onClick={cerrarDetalle}
                                className="rounded-lg bg-[#006635] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087a43]"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {cotizacionSeleccionada && seguimientoAbierto && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSeguimientoAbierto(false);
                        }
                    }}
                >
                    <form
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-seguimiento-cotizacion"
                        onSubmit={guardarSeguimiento}
                        className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#111513] p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-center gap-2">
                            <ClipboardList className="size-4 text-[#4cc185]" />
                            <h2
                                id="titulo-seguimiento-cotizacion"
                                className="text-base font-semibold text-white"
                            >
                                Seguimiento administrativo
                            </h2>
                        </div>

                        <label className="mt-5 block text-sm text-white/70">
                            Estado de la solicitud
                            <select
                                value={seguimiento.data.estado}
                                onChange={(event) =>
                                    seguimiento.setData(
                                        'estado',
                                        event.target.value as EstadoCotizacion,
                                    )
                                }
                                className="mt-2 h-11 w-full appearance-none rounded-lg border border-white/15 bg-[#191e1b] px-4 text-sm text-white outline-none focus:border-[#006635] focus:ring-2 focus:ring-[#006635]/20"
                            >
                                {estadosSeguimiento.map((estado) => (
                                    <option
                                        key={estado.value}
                                        value={estado.value}
                                    >
                                        {estado.label}
                                    </option>
                                ))}
                            </select>
                            {seguimiento.errors.estado && (
                                <p className="mt-2 text-xs text-red-400">
                                    {seguimiento.errors.estado}
                                </p>
                            )}
                        </label>

                        <label className="mt-5 block text-sm text-white/70">
                            Observaciones internas
                            <textarea
                                value={seguimiento.data.observaciones}
                                onChange={(event) =>
                                    seguimiento.setData(
                                        'observaciones',
                                        event.target.value,
                                    )
                                }
                                rows={4}
                                placeholder="Agregar notas sobre la solicitud..."
                                className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-[#191e1b] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#006635] focus:ring-2 focus:ring-[#006635]/20"
                            />
                            {seguimiento.errors.observaciones && (
                                <p className="mt-2 text-xs text-red-400">
                                    {seguimiento.errors.observaciones}
                                </p>
                            )}
                        </label>

                        <button
                            type="submit"
                            disabled={seguimiento.processing}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#006635] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087a43] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <Save className="size-4" />
                            {seguimiento.processing
                                ? 'Guardando...'
                                : 'Guardar seguimiento'}
                        </button>
                    </form>
                </div>
            )}

            {/* =====================================
                CONFIRMACIÓN DE ELIMINACIÓN ORIGINAL
            ===================================== */}
            <Dialog
                open={cotizacionToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setCotizacionToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>
                        Eliminar solicitud
                    </DialogTitle>

                    <DialogDescription>
                        ¿Desea eliminar la solicitud de{' '}
                        <span className="font-semibold text-foreground">
                            {cotizacionToDelete?.cliente}
                        </span>
                        ? Esta acción no se puede deshacer.
                    </DialogDescription>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                        </DialogClose>

                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={confirmDelete}
                        >
                            {isDeleting
                                ? 'Eliminando...'
                                : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
