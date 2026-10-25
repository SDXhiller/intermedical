
import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    Eye,
    FileText,
    ImageIcon,
    Inbox,
    Mail,
    MapPin,
    Package,
    Phone,
    Save,
    Search,
    UserRound,
    X,
    XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import Heading from '@/components/heading';
import { update as actualizarSeguimiento } from '@/routes/admin/cotizaciones-refacciones';

/* =====================================================
   TIPOS
===================================================== */

type EstadoCotizacion =
    | 'pendiente'
    | 'en_revision'
    | 'cotizada'
    | 'finalizada'
    | 'cancelada';

type Cotizacion = {
    id: number;
    folio: string;
    fecha: string;
    cliente: string;
    contacto: string;
    direccion: string;
    area: string;
    telefono: string;
    correo: string;
    equipo: string;
    marca: string;
    modulo: string;
    refaccion: string;
    numero_parte: string;
    descripcion: string;
    observaciones: string;
    estado: EstadoCotizacion;
    imagenes: string[];
};

type EstadoSeguimiento = 'pendiente' | 'cotizada' | 'cancelada';

const estadosSeguimiento: { value: EstadoSeguimiento; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'cotizada', label: 'Cotizada' },
    { value: 'cancelada', label: 'Cancelada' },
];

const estadoSeguimientoInicial = (
    estado: EstadoCotizacion,
): EstadoSeguimiento => {
    if (
        estado === 'pendiente' ||
        estado === 'cotizada' ||
        estado === 'cancelada'
    ) {
        return estado;
    }

    return 'pendiente';
};

/* =====================================================
   CONFIGURACIÓN DE ESTADOS
===================================================== */

const estados: Record<
    EstadoCotizacion,
    {
        label: string;
        className: string;
        dotClass: string;
    }
> = {
    pendiente: {
        label: 'Pendiente',
        className:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',
        dotClass: 'bg-amber-400',
    },
    en_revision: {
        label: 'En revisión',
        className:
            'border-blue-500/20 bg-blue-500/10 text-blue-400',
        dotClass: 'bg-blue-400',
    },
    cotizada: {
        label: 'Cotizada',
        className:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        dotClass: 'bg-emerald-400',
    },
    finalizada: {
        label: 'Finalizada',
        className:
            'border-white/15 bg-white/5 text-white/65',
        dotClass: 'bg-white/50',
    },
    cancelada: {
        label: 'Cancelada',
        className:
            'border-red-500/20 bg-red-500/10 text-red-400',
        dotClass: 'bg-red-400',
    },
};

type FiltroEstado = 'todas' | EstadoCotizacion;

const PAGE_SIZE = 10;

const formatFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${fecha}T12:00:00Z`));
};

/* =====================================================
   COMPONENTES AUXILIARES
===================================================== */

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
            <span
                className={`size-1.5 rounded-full ${config.dotClass}`}
            />
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
            <p className="text-xs text-white/40">{label}</p>
            <p className="mt-1 break-words [overflow-wrap:anywhere] text-sm font-medium text-white/85">
                {value || '—'}
            </p>
        </div>
    );
}

/* =====================================================
   VISTA PRINCIPAL
===================================================== */

export default function CotizacionListradoView({
    cotizaciones,
}: {
    cotizaciones: Cotizacion[];
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('todas');
    const [paginaActual, setPaginaActual] = useState(1);
    const [cotizacionSeleccionada, setCotizacionSeleccionada] =
        useState<Cotizacion | null>(null);
    const [seguimientoAbierto, setSeguimientoAbierto] = useState(false);
    const seguimiento = useForm<{
        estado: EstadoSeguimiento;
        observaciones: string;
    }>({
        estado: 'pendiente',
        observaciones: '',
    });

    useEffect(() => {
        setCotizacionSeleccionada((actual) => {
            if (!actual) {
                return null;
            }

            return (
                cotizaciones.find((item) => item.id === actual.id) ??
                actual
            );
        });
    }, [cotizaciones]);

    const resumen = useMemo(() => {
        return {
            total: cotizaciones.length,
            pendientes: cotizaciones.filter(
                (item) => item.estado === 'pendiente',
            ).length,
            canceladas: cotizaciones.filter(
                (item) => item.estado === 'cancelada',
            ).length,
            cotizadas: cotizaciones.filter(
                (item) => item.estado === 'cotizada',
            ).length,
        };
    }, [cotizaciones]);

    const cotizacionesFiltradas = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase('es');

        return cotizaciones
            .filter((item) => {
                const coincideEstado =
                    filtroEstado === 'todas' ||
                    item.estado === filtroEstado;

                const texto = [
                    item.folio,
                    item.cliente,
                    item.contacto,
                    item.equipo,
                    item.marca,
                    item.modulo,
                    item.refaccion,
                    item.numero_parte,
                ]
                    .join(' ')
                    .toLocaleLowerCase('es');

                return (
                    coincideEstado &&
                    texto.includes(query)
                );
            })
            .sort((a, b) => b.id - a.id);
    }, [cotizaciones, searchTerm, filtroEstado]);

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

    const cambiarFiltro = (estado: FiltroEstado) => {
        setFiltroEstado(estado);
        setPaginaActual(1);
    };

    const cambiarBusqueda = (value: string) => {
        setSearchTerm(value);
        setPaginaActual(1);
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
            estado: estadoSeguimientoInicial(
                cotizacionSeleccionada.estado,
            ),
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
            actualizarSeguimiento.url(cotizacionSeleccionada.id),
            {
                preserveScroll: true,
                onSuccess: () => setSeguimientoAbierto(false),
            },
        );
    };

    const metricas = [
        {
            titulo: 'Total de solicitudes',
            valor: resumen.total,
            icono: Inbox,
            color: 'text-white/75',
            fondo: 'bg-white/5',
        },
        {
            titulo: 'Pendientes',
            valor: resumen.pendientes,
            icono: Clock3,
            color: 'text-amber-400',
            fondo: 'bg-amber-500/10',
        },
        {
            titulo: 'Canceladas',
            valor: resumen.canceladas,
            icono: XCircle,
            color: 'text-red-400',
            fondo: 'bg-red-500/10',
        },
        {
            titulo: 'Cotizadas',
            valor: resumen.cotizadas,
            icono: CheckCircle2,
            color: 'text-emerald-400',
            fondo: 'bg-emerald-500/10',
        },
    ];

    return (
        <>
            <Head title="Cotizaciones de refacciones" />

            <div className="flex h-full flex-1 flex-col gap-7 p-4 md:p-6">
                <Heading
                    title="Cotizaciones de refacciones"
                    description="Consulta y administra las solicitudes recibidas desde el catálogo de refacciones."
                />

                {/* =====================================
                    TARJETAS DE RESUMEN
                ===================================== */}
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {metricas.map((metrica) => {
                        const Icon = metrica.icono;

                        return (
                            <div
                                key={metrica.titulo}
                                className="rounded-xl border border-white/10 bg-[#141816] p-4 sm:p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-xs font-medium text-white/55 sm:text-sm">
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

                                <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                                    {metrica.valor}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* =====================================
                    BANDEJA DE SOLICITUDES
                ===================================== */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111513]">
                    <div className="border-b border-white/10 p-4 sm:p-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="size-5 text-[#4cc185]" />

                                <h2 className="text-lg font-semibold text-white">
                                    Bandeja de solicitudes
                                </h2>
                            </div>

                            <p className="text-sm text-white/45">
                                Revisa las solicitudes de cotización
                                enviadas por los clientes.
                            </p>
                        </div>

                        {/* Buscador */}
                        <div className="relative mt-5">
                            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />

                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) =>
                                    cambiarBusqueda(
                                        event.target.value,
                                    )
                                }
                                placeholder="Buscar por cliente, equipo, refacción o número de parte..."
                                className="h-11 w-full rounded-lg border border-white/15 bg-[#191e1b] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#006635] focus:ring-2 focus:ring-[#006635]/20"
                            />
                        </div>

                        {/* Filtros */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {(
                                [
                                    ['todas', 'Todas'],
                                    ['pendiente', 'Pendientes'],
                                    ['cotizada', 'Cotizadas'],
                                    ['finalizada', 'Finalizadas'],
                                    ['cancelada', 'Canceladas'],
                                ] as [FiltroEstado, string][]
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        cambiarFiltro(value)
                                    }
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
                    </div>

                    {/* =====================================
                        TABLA DE ESCRITORIO
                    ===================================== */}
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full min-w-[900px] text-left">
                            <thead className="border-b border-white/10 bg-[#171c19]">
                                <tr className="text-xs font-semibold uppercase tracking-wide text-white/45">
                                    <th className="px-5 py-4">
                                        Folio / Fecha
                                    </th>
                                    <th className="px-5 py-4">
                                        Cliente
                                    </th>
                                    <th className="px-5 py-4">
                                        Refacción
                                    </th>
                                    <th className="px-5 py-4">
                                        Equipo
                                    </th>
                                    <th className="px-5 py-4">
                                        Estado
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
                                                <p className="text-sm font-semibold text-white">
                                                    {item.folio}
                                                </p>

                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                                                    <CalendarDays className="size-3.5" />
                                                    {formatFecha(
                                                        item.fecha,
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="max-w-48 break-words text-sm font-medium text-white/85">
                                                    {item.cliente}
                                                </p>

                                                <p className="mt-1 text-xs text-white/40">
                                                    {item.contacto}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="max-w-56 break-words text-sm text-white/85">
                                                    {item.refaccion}
                                                </p>

                                                <p className="mt-1 text-xs text-white/40">
                                                    P/N:{' '}
                                                    {item.numero_parte ||
                                                        '—'}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm text-white/80">
                                                    {item.marca}
                                                </p>

                                                <p className="mt-1 text-xs text-white/40">
                                                    {item.modulo ||
                                                        item.equipo}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <EstadoBadge
                                                    estado={
                                                        item.estado
                                                    }
                                                />
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCotizacionSeleccionada(
                                                            item,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#252b27] px-3 py-2 text-xs font-semibold text-white transition hover:border-[#006635]/60 hover:bg-[#303b33]"
                                                >
                                                    <Eye className="size-4" />
                                                    Ver solicitud
                                                </button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* =====================================
                        TARJETAS PARA MÓVIL / TABLET
                    ===================================== */}
                    <div className="grid gap-3 p-4 lg:hidden">
                        {cotizacionesPaginadas.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-xl border border-white/10 bg-[#191e1b] p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {item.folio}
                                        </p>

                                        <p className="mt-1 text-xs text-white/40">
                                            {formatFecha(item.fecha)}
                                        </p>
                                    </div>

                                    <EstadoBadge
                                        estado={item.estado}
                                    />
                                </div>

                                <div className="mt-4 space-y-2">
                                    <p className="flex items-center gap-2 text-sm font-medium text-white">
                                        <Building2 className="size-4 shrink-0 text-[#4cc185]" />
                                        {item.cliente}
                                    </p>

                                    <p className="break-words text-sm text-white/80">
                                        {item.refaccion}
                                    </p>

                                    <p className="text-xs text-white/45">
                                        {item.marca} · {item.modulo}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCotizacionSeleccionada(
                                            item,
                                        )
                                    }
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#252b27] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#303b33]"
                                >
                                    <Eye className="size-4" />
                                    Ver solicitud
                                </button>
                            </article>
                        ))}
                    </div>

                    {/* Sin resultados */}
                    {cotizacionesPaginadas.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
                            <Inbox className="size-10 text-white/25" />

                            <p className="text-sm font-semibold text-white/70">
                                No se encontraron solicitudes
                            </p>

                            <p className="text-xs text-white/40">
                                Intenta cambiar los filtros
                                o el término de búsqueda.
                            </p>
                        </div>
                    )}

                    {/* =====================================
                        PAGINACIÓN
                    ===================================== */}
                    <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="text-xs text-white/45">
                            Mostrando{' '}
                            {cotizacionesFiltradas.length === 0
                                ? 0
                                : (paginaSegura - 1) *
                                      PAGE_SIZE +
                                  1}
                            {' - '}
                            {Math.min(
                                paginaSegura * PAGE_SIZE,
                                cotizacionesFiltradas.length,
                            )}{' '}
                            de {cotizacionesFiltradas.length}{' '}
                            solicitudes
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={paginaSegura <= 1}
                                onClick={() =>
                                    setPaginaActual(
                                        paginaSegura - 1,
                                    )
                                }
                                className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label="Página anterior"
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
                                    paginaSegura >= totalPaginas
                                }
                                onClick={() =>
                                    setPaginaActual(
                                        paginaSegura + 1,
                                    )
                                }
                                className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label="Página siguiente"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </section>

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
                            aria-labelledby="titulo-detalle-cotizacion"
                            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111513] shadow-2xl"
                        >
                            {/* Encabezado del modal */}
                            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4cc185]">
                                        {cotizacionSeleccionada.folio}
                                    </p>

                                    <h2
                                        id="titulo-detalle-cotizacion"
                                        className="mt-1 text-xl font-bold text-white"
                                    >
                                        Detalle de cotización
                                    </h2>

                                    <p className="mt-1 text-xs text-white/45">
                                        Recibida el{' '}
                                        {formatFecha(
                                            cotizacionSeleccionada.fecha,
                                        )}
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

                            {/* Contenido del modal */}
                            <div className="space-y-8 overflow-y-auto p-5 sm:p-6">
                                <div>
                                    <EstadoBadge
                                        estado={
                                            cotizacionSeleccionada.estado
                                        }
                                    />
                                </div>

                                {/* Datos del cliente */}
                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <UserRound className="size-4 text-[#4cc185]" />
                                        Datos del solicitante
                                    </h3>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <DatoDetalle
                                            label="Cliente o institución"
                                            value={
                                                cotizacionSeleccionada.cliente
                                            }
                                        />

                                        <DatoDetalle
                                            label="Nombre de contacto"
                                            value={
                                                cotizacionSeleccionada.contacto
                                            }
                                        />

                                        <DatoDetalle
                                            label="Dirección"
                                            value={
                                                cotizacionSeleccionada.direccion
                                            }
                                        />

                                        <DatoDetalle
                                            label="Área"
                                            value={
                                                cotizacionSeleccionada.area
                                            }
                                        />

                                        <DatoDetalle
                                            label="Teléfono"
                                            value={
                                                cotizacionSeleccionada.telefono
                                            }
                                        />

                                        <DatoDetalle
                                            label="Correo electrónico"
                                            value={
                                                cotizacionSeleccionada.correo
                                            }
                                        />
                                    </div>
                                </section>

                                {/* Datos de la refacción */}
                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <Package className="size-4 text-[#4cc185]" />
                                        Equipo y refacción
                                    </h3>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <DatoDetalle
                                            label="Equipo"
                                            value={
                                                cotizacionSeleccionada.equipo
                                            }
                                        />

                                        <DatoDetalle
                                            label="Marca"
                                            value={
                                                cotizacionSeleccionada.marca
                                            }
                                        />

                                        <DatoDetalle
                                            label="Módulo"
                                            value={
                                                cotizacionSeleccionada.modulo
                                            }
                                        />

                                        <DatoDetalle
                                            label="Refacción requerida"
                                            value={
                                                cotizacionSeleccionada.refaccion
                                            }
                                        />

                                        <DatoDetalle
                                            label="Número de parte"
                                            value={
                                                cotizacionSeleccionada.numero_parte
                                            }
                                        />
                                    </div>
                                </section>

                                {/* Descripción */}
                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <FileText className="size-4 text-[#4cc185]" />
                                        Descripción o comentarios
                                    </h3>

                                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-white/65">
                                        {cotizacionSeleccionada.descripcion ||
                                            'Sin comentarios adicionales.'}
                                    </p>
                                </section>

                                {/* Fotografías */}
                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <ImageIcon className="size-4 text-[#4cc185]" />
                                        Fotografías adjuntas
                                    </h3>

                                    {cotizacionSeleccionada.imagenes.length >
                                    0 ? (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {cotizacionSeleccionada.imagenes.map(
                                                (imagen, index) => (
                                                    <img
                                                        key={index}
                                                        src={imagen}
                                                        alt={`Fotografía ${index + 1}`}
                                                        className="aspect-square w-full rounded-lg border border-white/10 bg-[#1a201c] object-contain p-2"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/40">
                                            Esta solicitud no tiene
                                            fotografías adjuntas.
                                        </p>
                                    )}
                                </section>
                            </div>

                            {/* Pie del modal */}
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
                                            event.target
                                                .value as EstadoSeguimiento,
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

            </div>
        </>
    );
}
