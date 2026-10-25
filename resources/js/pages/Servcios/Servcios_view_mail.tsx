
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    Eye,
    Hand,
    Image as ImageIcon,
    LifeBuoy,
    Mail,
    Monitor,
    Phone,
    Save,
    Search,
    Trash2,
    UserRound,
    Wrench,
    X,
    XCircle,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type PointerEvent,
} from 'react';

import SolicitudSoporteController from '@/actions/App/Http/Controllers/Admin/SolicitudSoporteController';
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
import { index as adminSoporteIndex } from '@/routes/admin/soporte';

/* =====================================================
   CONFIGURACIÓN
===================================================== */

const BRAND_COLOR = '#006635';
const NUEVA_SOLICITUD_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 10;

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_PASO = 0.5;

type EstadoServicio =
    | 'en_espera'
    | 'concluido'
    | 'cancelado';

type FiltroEstado = EstadoServicio | 'todos';

type SolicitudAtendidaFlash = {
    servicio: string;
    nombre: string;
};

type ServicioItem = {
    id: number;
    nombre: string;
};

type ModalidadItem = {
    id: number;
    nombre: string;
};

type EquipoItem = {
    id: number | null;
    nombre: string;
    marca: string;
};

type ClienteItem = {
    nombre: string;
    empresa: string | null;
    telefono: string;
    correo: string;
    estado: string | null;
};

type SolicitudItem = {
    id: number;
    servicio: ServicioItem;
    modalidad: ModalidadItem;
    equipo: EquipoItem | null;
    cliente: ClienteItem;
    descripcion: string;
    imagenes: string[];
    created_at: string | null;
    created_at_formatted: string | null;
    atendida: boolean;
    es_nueva: boolean;
    estado_servicio: EstadoServicio;
    observaciones: string;
};

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
    solicitudes: SolicitudItem[];
    filtros: Filtros;
    resumen: Resumen;
    meses: MesOption[];
    anios_disponibles: number[];
};

/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function getCreatedAtMs(
    solicitud: SolicitudItem,
): number | null {
    if (!solicitud.created_at) {
        return null;
    }

    const parsed = Date.parse(solicitud.created_at);

    return Number.isNaN(parsed) ? null : parsed;
}

function isNuevaSolicitud(
    solicitud: SolicitudItem,
    nowMs: number,
    estado: EstadoServicio,
): boolean {
    if (estado !== 'en_espera') {
        return false;
    }

    const createdAtMs = getCreatedAtMs(solicitud);

    if (createdAtMs === null) {
        return solicitud.es_nueva;
    }

    return (
        nowMs >= createdAtMs &&
        nowMs - createdAtMs < NUEVA_SOLICITUD_MS
    );
}

function nextNuevaExpiryMs(
    solicitudes: SolicitudItem[],
    nowMs: number,
): number | null {
    const expirations = solicitudes
        .filter((solicitud) => {
            const estado =
                solicitud.estado_servicio ??
                (solicitud.atendida
                    ? 'concluido'
                    : 'en_espera');

            return estado === 'en_espera';
        })
        .map(getCreatedAtMs)
        .filter(
            (value): value is number => value !== null,
        )
        .map(
            (createdAtMs) =>
                createdAtMs + NUEVA_SOLICITUD_MS,
        )
        .filter((expiry) => expiry > nowMs)
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

function Campo({
    titulo,
    valor,
}: {
    titulo: string;
    valor?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-white/40">
                {titulo}
            </p>

            <p className="mt-1 break-words text-sm font-medium text-white/85 [overflow-wrap:anywhere]">
                {valor?.trim() || 'No indicado'}
            </p>
        </div>
    );
}

function EstadoBadge({
    estado,
}: {
    estado: EstadoServicio;
}) {
    const estilos = {
        en_espera: {
            label: 'Servicio en espera',
            icon: Clock3,
            className:
                'border-amber-500/25 bg-amber-500/10 text-amber-400',
        },
        concluido: {
            label: 'Servicio concluido',
            icon: CheckCircle2,
            className:
                'border-green-500/25 bg-green-500/10 text-green-400',
        },
        cancelado: {
            label: 'Servicio cancelado',
            icon: XCircle,
            className:
                'border-red-500/25 bg-red-500/10 text-red-400',
        },
    };

    const config = estilos[estado];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${config.className}`}
        >
            <Icon className="size-3.5" />
            {config.label}
        </span>
    );
}

/* =====================================================
   GALERÍA DE FOTOGRAFÍAS
===================================================== */

function GaleriaFotografias({
    imagenes,
}: {
    imagenes: string[];
}) {
    const [indice, setIndice] =
        useState<number | null>(null);

    const [zoom, setZoom] = useState(ZOOM_MIN);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    const [herramienta, setHerramienta] =
        useState<'zoom' | 'mano'>('zoom');

    const [arrastrando, setArrastrando] =
        useState(false);

    const arrastre = useRef<{
        x: number;
        y: number;
        panX: number;
        panY: number;
    } | null>(null);

    const varias = imagenes.length > 1;
    const actual =
        indice === null ? null : imagenes[indice];

    const puedeMover =
        herramienta === 'mano' && zoom > ZOOM_MIN;

    useEffect(() => {
        setZoom(ZOOM_MIN);
        setPan({ x: 0, y: 0 });
        setArrastrando(false);
        arrastre.current = null;
    }, [indice]);

    useEffect(() => {
        if (indice === null || !varias) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();

                setIndice((actualIndice) =>
                    actualIndice === null
                        ? actualIndice
                        : (actualIndice -
                              1 +
                              imagenes.length) %
                          imagenes.length,
                );
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();

                setIndice((actualIndice) =>
                    actualIndice === null
                        ? actualIndice
                        : (actualIndice + 1) %
                          imagenes.length,
                );
            }
        };

        window.addEventListener(
            'keydown',
            onKeyDown,
        );

        return () =>
            window.removeEventListener(
                'keydown',
                onKeyDown,
            );
    }, [imagenes.length, indice, varias]);

    const mover = (direccion: -1 | 1) => {
        setIndice((actualIndice) => {
            if (actualIndice === null) {
                return actualIndice;
            }

            return (
                (actualIndice +
                    direccion +
                    imagenes.length) %
                imagenes.length
            );
        });
    };

    const cambiarZoom = (siguiente: number) => {
        const limitado = Math.min(
            ZOOM_MAX,
            Math.max(ZOOM_MIN, siguiente),
        );

        setZoom(limitado);

        if (limitado === ZOOM_MIN) {
            setPan({ x: 0, y: 0 });
        }
    };

    const iniciarArrastre = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (!puedeMover) {
            return;
        }

        event.currentTarget.setPointerCapture(
            event.pointerId,
        );

        arrastre.current = {
            x: event.clientX,
            y: event.clientY,
            panX: pan.x,
            panY: pan.y,
        };

        setArrastrando(true);
    };

    const moverArrastre = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (!arrastre.current) {
            return;
        }

        setPan({
            x:
                arrastre.current.panX +
                (event.clientX - arrastre.current.x),
            y:
                arrastre.current.panY +
                (event.clientY - arrastre.current.y),
        });
    };

    const soltarArrastre = () => {
        arrastre.current = null;
        setArrastrando(false);
    };

    if (imagenes.length === 0) {
        return (
            <p className="text-sm text-white/40">
                No se adjuntaron fotografías.
            </p>
        );
    }

    return (
        <div className="min-w-0">
            <div className="flex flex-wrap gap-3">
                {imagenes.map((src, index) => (
                    <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => setIndice(index)}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-white/5"
                        aria-label={`Ver fotografía ${index + 1}`}
                    >
                        <img
                            src={src}
                            alt={`Fotografía ${index + 1}`}
                            className="size-20 object-cover transition-transform group-hover:scale-105 sm:size-24"
                        />
                    </button>
                ))}
            </div>

            <Dialog
                open={indice !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setIndice(null);
                    }
                }}
            >
                <DialogContent className="border-white/15 bg-black p-3 text-white sm:max-w-4xl">
                    <DialogTitle className="sr-only">
                        Fotografía ampliada
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        Vista ampliada de la fotografía
                        enviada con la solicitud.
                    </DialogDescription>

                    {actual && (
                        <div
                            className={`relative h-[65vh] overflow-hidden touch-none ${
                                herramienta === 'mano'
                                    ? arrastrando
                                        ? 'cursor-grabbing'
                                        : 'cursor-grab'
                                    : 'cursor-zoom-in'
                            }`}
                            onPointerDown={iniciarArrastre}
                            onPointerMove={moverArrastre}
                            onPointerUp={soltarArrastre}
                            onPointerCancel={soltarArrastre}
                            onClick={() => {
                                if (
                                    herramienta === 'zoom'
                                ) {
                                    cambiarZoom(
                                        zoom + ZOOM_PASO,
                                    );
                                }
                            }}
                        >
                            <img
                                src={actual}
                                alt={`Fotografía ${
                                    (indice ?? 0) + 1
                                }`}
                                draggable={false}
                                className="h-full w-full object-contain select-none"
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                }}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            aria-label="Acercar"
                            onClick={() => {
                                setHerramienta('zoom');
                                cambiarZoom(
                                    zoom + ZOOM_PASO,
                                );
                            }}
                            className="flex size-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
                        >
                            <ZoomIn className="size-5" />
                        </button>

                        <button
                            type="button"
                            aria-label="Alejar"
                            onClick={() =>
                                cambiarZoom(
                                    zoom - ZOOM_PASO,
                                )
                            }
                            className="flex size-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
                        >
                            <ZoomOut className="size-5" />
                        </button>

                        <button
                            type="button"
                            aria-label="Mover imagen"
                            onClick={() =>
                                setHerramienta('mano')
                            }
                            className={`flex size-10 items-center justify-center rounded-full ${
                                herramienta === 'mano'
                                    ? 'bg-white text-black'
                                    : 'bg-white/15 text-white'
                            }`}
                        >
                            <Hand className="size-5" />
                        </button>

                        <span className="min-w-12 text-center text-sm">
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>

                    {varias && (
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => mover(-1)}
                                className="rounded-lg bg-white/15 p-2 hover:bg-white/25"
                                aria-label="Fotografía anterior"
                            >
                                <ChevronLeft className="size-5" />
                            </button>

                            <span className="text-sm text-white/70">
                                {(indice ?? 0) + 1} de{' '}
                                {imagenes.length}
                            </span>

                            <button
                                type="button"
                                onClick={() => mover(1)}
                                className="rounded-lg bg-white/15 p-2 hover:bg-white/25"
                                aria-label="Fotografía siguiente"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

export default function ServciosViewMail({
    solicitudes,
    filtros,
    resumen,
    meses,
    anios_disponibles,
}: Props) {
    const { flash } = usePage<{
        flash?: {
            success?: string | null;
            solicitud_atendida?:
                | SolicitudAtendidaFlash
                | null;
        };
    }>().props;

    const [nowMs, setNowMs] = useState(
        () => Date.now(),
    );

    const [buscar, setBuscar] = useState(
        filtros.buscar,
    );

    const [filtroEstado, setFiltroEstado] =
        useState<FiltroEstado>('todos');

    const [paginaActual, setPaginaActual] =
        useState(1);

    const [
        solicitudSeleccionada,
        setSolicitudSeleccionada,
    ] = useState<SolicitudItem | null>(null);

    const [
        solicitudToDelete,
        setSolicitudToDelete,
    ] = useState<SolicitudItem | null>(null);

    const [isDeleting, setIsDeleting] =
        useState(false);

    const [seguimientoAbierto, setSeguimientoAbierto] =
        useState(false);

    const seguimiento = useForm<{
        estado: EstadoServicio;
        observaciones: string;
    }>({
        estado: 'en_espera',
        observaciones: '',
    });

    const [
        solicitudAtendida,
        setSolicitudAtendida,
    ] = useState<SolicitudAtendidaFlash | null>(
        flash?.solicitud_atendida ?? null,
    );

    const obtenerEstado = (
        solicitud: SolicitudItem,
    ): EstadoServicio => {
        return (
            solicitud.estado_servicio ??
            (solicitud.atendida ? 'concluido' : 'en_espera')
        );
    };

    useEffect(() => {
        setSolicitudSeleccionada((actual) => {
            if (!actual) {
                return null;
            }

            return (
                solicitudes.find(
                    (item) => item.id === actual.id,
                ) ?? actual
            );
        });
    }, [solicitudes]);

    /* =====================================
       FILTROS DE LARAVEL
    ===================================== */

    useEffect(() => {
        setBuscar(filtros.buscar);
    }, [filtros.buscar]);

    const applyFilters = (
        next: Partial<Filtros>,
    ) => {
        const params = {
            mes: next.mes ?? filtros.mes,
            anio: next.anio ?? filtros.anio,
            buscar: next.buscar ?? filtros.buscar,
        };

        router.get(
            adminSoporteIndex.url({
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

        return () =>
            window.clearTimeout(timer);
    }, [
        buscar,
        filtros.buscar,
        filtros.mes,
        filtros.anio,
    ]);

    useEffect(() => {
        setPaginaActual(1);
    }, [
        filtros.mes,
        filtros.anio,
        filtros.buscar,
        filtroEstado,
    ]);

    /* =====================================
       AVISOS DE SOLICITUDES NUEVAS
    ===================================== */

    useEffect(() => {
        if (flash?.solicitud_atendida) {
            setSolicitudAtendida(
                flash.solicitud_atendida,
            );
        }
    }, [flash?.solicitud_atendida]);

    const nuevaIds = useMemo(() => {
        return new Set(
            solicitudes
                .filter((solicitud) =>
                    isNuevaSolicitud(
                        solicitud,
                        nowMs,
                        obtenerEstado(solicitud),
                    ),
                )
                .map((solicitud) => solicitud.id),
        );
    }, [solicitudes, nowMs]);

    const hasNuevas = nuevaIds.size > 0;

    useEffect(() => {
        const timerExpiry = nextNuevaExpiryMs(
            solicitudes.filter(
                (solicitud) =>
                    obtenerEstado(solicitud) ===
                    'en_espera',
            ),
            nowMs,
        );

        if (timerExpiry === null) {
            return;
        }

        const timer = window.setTimeout(
            () => setNowMs(Date.now()),
            Math.max(
                timerExpiry - Date.now(),
                0,
            ),
        );

        return () =>
            window.clearTimeout(timer);
    }, [solicitudes, nowMs]);

    /* =====================================
       ESTADÍSTICAS Y FILTRADO LOCAL
    ===================================== */

    const totalEspera = solicitudes.filter(
        (solicitud) =>
            obtenerEstado(solicitud) ===
            'en_espera',
    ).length;

    const totalConcluido = solicitudes.filter(
        (solicitud) =>
            obtenerEstado(solicitud) ===
            'concluido',
    ).length;

    const totalCancelado = solicitudes.filter(
        (solicitud) =>
            obtenerEstado(solicitud) ===
            'cancelado',
    ).length;

    const solicitudesFiltradas =
        solicitudes.filter((solicitud) => {
            return (
                filtroEstado === 'todos' ||
                obtenerEstado(solicitud) ===
                    filtroEstado
            );
        });

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            solicitudesFiltradas.length /
                PAGE_SIZE,
        ),
    );

    const paginaSegura = Math.min(
        paginaActual,
        totalPaginas,
    );

    const solicitudesPaginadas =
        solicitudesFiltradas.slice(
            (paginaSegura - 1) *
                PAGE_SIZE,
            paginaSegura * PAGE_SIZE,
        );

    /* =====================================
       CAMBIO DE ESTADO
    ===================================== */

    const cerrarDetalle = () => {
        setSeguimientoAbierto(false);
        setSolicitudSeleccionada(null);
    };

    const abrirSeguimiento = () => {
        if (!solicitudSeleccionada) {
            return;
        }

        seguimiento.setData({
            estado: obtenerEstado(solicitudSeleccionada),
            observaciones: solicitudSeleccionada.observaciones,
        });
        seguimiento.clearErrors();
        setSeguimientoAbierto(true);
    };

    const guardarSeguimiento = (event: FormEvent) => {
        event.preventDefault();

        if (!solicitudSeleccionada) {
            return;
        }

        seguimiento.patch(
            SolicitudSoporteController.update.url(
                solicitudSeleccionada.id,
                {
                    query: {
                        mes: filtros.mes,
                        anio: filtros.anio,
                        ...(filtros.buscar !== ''
                            ? { buscar: filtros.buscar }
                            : {}),
                    },
                },
            ),
            {
                preserveScroll: true,
                onSuccess: () => setSeguimientoAbierto(false),
            },
        );
    };

    /* =====================================
       ELIMINAR SOLICITUD
    ===================================== */

    const confirmDelete = () => {
        if (!solicitudToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(
            SolicitudSoporteController.destroy.url(
                solicitudToDelete.id,
                {
                    query: {
                        mes: filtros.mes,
                        anio: filtros.anio,
                        ...(filtros.buscar
                            ? {
                                  buscar:
                                      filtros.buscar,
                              }
                            : {}),
                    },
                },
            ),
            {
                preserveScroll: true,

                onFinish: () => {
                    setIsDeleting(false);
                    setSolicitudToDelete(null);
                },
            },
        );
    };

    const metricas = [
        {
            titulo: 'Total del mes',
            valor: resumen.total_mes,
            icono: LifeBuoy,
            color: 'text-[#4cc185]',
            fondo: 'bg-[#006635]/15',
        },
        {
            titulo: 'En espera',
            valor: totalEspera,
            icono: Clock3,
            color: 'text-amber-400',
            fondo: 'bg-amber-500/10',
        },
        {
            titulo: 'Concluidos',
            valor: totalConcluido,
            icono: CheckCircle2,
            color: 'text-green-400',
            fondo: 'bg-green-500/10',
        },
        {
            titulo: 'Cancelados',
            valor: totalCancelado,
            icono: XCircle,
            color: 'text-red-400',
            fondo: 'bg-red-500/10',
        },
    ];

    /* =================================================
       RENDER PRINCIPAL
    ================================================= */

    return (
        <>
            <Head title="Servicios de mantenimiento" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-7 overflow-x-hidden p-4 md:p-6">
                <Heading
                    title="Servicios de mantenimiento"
                    description="Administración y seguimiento de solicitudes de mantenimiento, soporte técnico y otros servicios."
                />

                {flash?.success && (
                    <div className="rounded-xl border border-[#006635]/30 bg-[#006635]/10 px-4 py-3 text-sm font-medium text-[#4cc185]">
                        {flash.success}
                    </div>
                )}

                {/* =================================
                    TARJETAS DE ESTADÍSTICAS
                ================================= */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

                {/* =================================
                    FILTROS
                ================================= */}

                <section className="rounded-2xl border border-white/10 bg-[#111513] p-5 sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            Filtros de búsqueda
                        </h2>

                        <p className="mt-1 text-sm text-white/45">
                            Consulta solicitudes por fecha,
                            servicio, equipo o cliente.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="servicio-mes"
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
                                    id="servicio-mes"
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
                                htmlFor="servicio-anio"
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
                                    id="servicio-anio"
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
                                htmlFor="servicio-estado"
                                className="text-sm font-medium text-white/75"
                            >
                                Estado del servicio
                            </label>

                            <Select
                                value={filtroEstado}
                                onValueChange={(value) =>
                                    setFiltroEstado(
                                        value as FiltroEstado,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="servicio-estado"
                                    className="h-11 w-full border-white/15 bg-[#191e1b] text-white"
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="todos">
                                        Todos los estados
                                    </SelectItem>

                                    <SelectItem value="en_espera">
                                        Servicio en espera
                                    </SelectItem>

                                    <SelectItem value="concluido">
                                        Servicio concluido
                                    </SelectItem>

                                    <SelectItem value="cancelado">
                                        Servicio cancelado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="servicio-buscar"
                                className="text-sm font-medium text-white/75"
                            >
                                Buscar solicitud
                            </label>

                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />

                                <input
                                    id="servicio-buscar"
                                    type="search"
                                    value={buscar}
                                    onChange={(event) =>
                                        setBuscar(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Servicio, equipo o cliente"
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
                                {resumen.anio} se recibieron{' '}
                                {resumen.total_mes}{' '}
                                {resumen.total_mes === 1
                                    ? 'solicitud'
                                    : 'solicitudes'}.
                            </p>

                            {filtros.buscar !== '' && (
                                <p className="mt-1 text-white/50">
                                    Mostrando{' '}
                                    {resumen.total_filtrado}{' '}
                                    {resumen.total_filtrado === 1
                                        ? 'resultado'
                                        : 'resultados'}{' '}
                                    para "{filtros.buscar}".
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* =================================
                    BANDEJA DE SOLICITUDES
                ================================= */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111513]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <Wrench className="size-5 text-[#4cc185]" />

                            <h2 className="text-lg font-semibold text-white">
                                Solicitudes recibidas
                            </h2>

                            {hasNuevas && (
                                <NotificationDot />
                            )}
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/65">
                            {solicitudesFiltradas.length}{' '}
                            {solicitudesFiltradas.length === 1
                                ? 'solicitud'
                                : 'solicitudes'}
                        </span>
                    </div>

                    {solicitudesFiltradas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
                            <LifeBuoy className="size-10 text-white/25" />

                            <p className="text-sm font-semibold text-white/70">
                                No se encontraron solicitudes
                            </p>

                            <p className="text-xs text-white/40">
                                Modifica los filtros para
                                consultar otros registros.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tabla escritorio */}

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1000px] text-left">
                                    <thead className="border-b border-white/10 bg-[#171c19]">
                                        <tr className="text-xs font-semibold uppercase tracking-wide text-white/45">
                                            <th className="px-5 py-4">
                                                Cliente
                                            </th>
                                            <th className="px-5 py-4">
                                                Servicio
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
                                            <th className="px-5 py-4 text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/10">
                                        {solicitudesPaginadas.map(
                                            (solicitud) => (
                                                <tr
                                                    key={solicitud.id}
                                                    className="transition hover:bg-white/[0.035]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-start gap-2">
                                                            {nuevaIds.has(
                                                                solicitud.id,
                                                            ) && (
                                                                <span className="mt-1.5">
                                                                    <NotificationDot />
                                                                </span>
                                                            )}

                                                            <div>
                                                                <p className="max-w-48 break-words text-sm font-semibold text-white">
                                                                    {solicitud.cliente.nombre}
                                                                </p>

                                                                <p className="mt-1 text-xs text-white/40">
                                                                    {solicitud.cliente.empresa ||
                                                                        'Particular'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-medium text-white/85">
                                                            {solicitud.servicio.nombre}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#4cc185]">
                                                            {solicitud.modalidad.nombre}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-white/75">
                                                            {solicitud.equipo?.nombre ||
                                                                'No indicado'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-white/40">
                                                            {solicitud.equipo?.marca ||
                                                                ''}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-xs text-white/55">
                                                            {solicitud.created_at_formatted ||
                                                                '—'}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <EstadoBadge
                                                            estado={obtenerEstado(
                                                                solicitud,
                                                            )}
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSolicitudSeleccionada(
                                                                        solicitud,
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
                                                                    setSolicitudToDelete(
                                                                        solicitud,
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

                            {/* Tarjetas móviles */}

                            <div className="grid gap-3 p-4 lg:hidden">
                                {solicitudesPaginadas.map(
                                    (solicitud) => (
                                        <article
                                            key={solicitud.id}
                                            className="rounded-xl border border-white/10 bg-[#191e1b] p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2">
                                                    {nuevaIds.has(
                                                        solicitud.id,
                                                    ) && (
                                                        <span className="mt-1.5">
                                                            <NotificationDot />
                                                        </span>
                                                    )}

                                                    <p className="text-sm font-semibold text-white">
                                                        {solicitud.cliente.nombre}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-xs text-white/40">
                                                    {solicitud.created_at_formatted ||
                                                        '—'}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm font-medium text-white/75">
                                                {solicitud.servicio.nombre}
                                            </p>

                                            <p className="mt-1 text-xs text-white/40">
                                                {solicitud.modalidad.nombre}
                                            </p>

                                            <div className="mt-3">
                                                <EstadoBadge
                                                    estado={obtenerEstado(
                                                        solicitud,
                                                    )}
                                                />
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSolicitudSeleccionada(
                                                            solicitud,
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
                                                        setSolicitudToDelete(
                                                            solicitud,
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
                                        solicitudesFiltradas.length,
                                    )}{' '}
                                    de{' '}
                                    {solicitudesFiltradas.length}{' '}
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
                                                paginaSegura - 1,
                                            )
                                        }
                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
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
                                            paginaSegura >=
                                            totalPaginas
                                        }
                                        onClick={() =>
                                            setPaginaActual(
                                                paginaSegura + 1,
                                            )
                                        }
                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
                                        aria-label="Página siguiente"
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* =================================
                MODAL DE DETALLES
            ================================= */}

            <Dialog
                open={solicitudSeleccionada !== null}
                onOpenChange={(open) => {
                    if (!open && !seguimientoAbierto) {
                        cerrarDetalle();
                    }
                }}
            >
                <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-3xl flex-col overflow-hidden border-white/15 bg-[#111513] p-0 text-white sm:max-w-3xl">
                    <DialogTitle className="sr-only">
                        Detalle de solicitud de servicio
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        Información del cliente, equipo,
                        servicio y fotografías adjuntas.
                    </DialogDescription>

                    {solicitudSeleccionada && (
                        <>
                            <div className="shrink-0 border-b border-white/10 p-5 sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#4cc185]">
                                            Solicitud #
                                            {solicitudSeleccionada.id}
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold text-white">
                                            Detalle del servicio
                                        </h2>

                                        <p className="mt-1 text-xs text-white/45">
                                            {solicitudSeleccionada.created_at_formatted ||
                                                'Sin fecha'}
                                        </p>
                                    </div>

                                    <EstadoBadge
                                        estado={obtenerEstado(
                                            solicitudSeleccionada,
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-7 overflow-y-auto p-5 sm:p-6">
                                {/* Información del servicio */}

                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <Wrench className="size-4 text-[#4cc185]" />
                                        Información del servicio
                                    </h3>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <Campo
                                            titulo="Servicio solicitado"
                                            valor={
                                                solicitudSeleccionada
                                                    .servicio.nombre
                                            }
                                        />

                                        <Campo
                                            titulo="Modalidad"
                                            valor={
                                                solicitudSeleccionada
                                                    .modalidad.nombre
                                            }
                                        />

                                        <Campo
                                            titulo="Marca del equipo"
                                            valor={
                                                solicitudSeleccionada
                                                    .equipo?.marca
                                            }
                                        />

                                        <Campo
                                            titulo="Modelo del equipo"
                                            valor={
                                                solicitudSeleccionada
                                                    .equipo?.nombre
                                            }
                                        />
                                    </div>
                                </section>

                                {/* Datos del cliente */}

                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <UserRound className="size-4 text-[#4cc185]" />
                                        Datos del solicitante
                                    </h3>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <Campo
                                            titulo="Nombre"
                                            valor={
                                                solicitudSeleccionada
                                                    .cliente.nombre
                                            }
                                        />

                                        <Campo
                                            titulo="Empresa o institución"
                                            valor={
                                                solicitudSeleccionada
                                                    .cliente.empresa
                                            }
                                        />

                                        <Campo
                                            titulo="Teléfono"
                                            valor={
                                                solicitudSeleccionada
                                                    .cliente.telefono
                                            }
                                        />

                                        <Campo
                                            titulo="Correo electrónico"
                                            valor={
                                                solicitudSeleccionada
                                                    .cliente.correo
                                            }
                                        />

                                        <Campo
                                            titulo="Estado o ciudad"
                                            valor={
                                                solicitudSeleccionada
                                                    .cliente.estado
                                            }
                                        />
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {solicitudSeleccionada
                                            .cliente.telefono && (
                                            <a
                                                href={`tel:${solicitudSeleccionada.cliente.telefono.replace(/\s/g, '')}`}
                                                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                                            >
                                                <Phone className="size-4" />
                                                Llamar
                                            </a>
                                        )}

                                        {solicitudSeleccionada
                                            .cliente.correo && (
                                            <a
                                                href={`mailto:${solicitudSeleccionada.cliente.correo}`}
                                                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                                            >
                                                <Mail className="size-4" />
                                                Enviar correo
                                            </a>
                                        )}
                                    </div>
                                </section>

                                {/* Descripción */}

                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <Monitor className="size-4 text-[#4cc185]" />
                                        Descripción de la falla
                                    </h3>

                                    <div className="rounded-xl border border-white/10 bg-[#191e1b] p-4">
                                        <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-white/75 [overflow-wrap:anywhere]">
                                            {solicitudSeleccionada.descripcion.trim() ||
                                                'No se proporcionó una descripción.'}
                                        </p>
                                    </div>
                                </section>

                                {/* Fotografías */}

                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-white">
                                        <ImageIcon className="size-4 text-[#4cc185]" />
                                        Fotografías adjuntas
                                    </h3>

                                    <GaleriaFotografias
                                        imagenes={
                                            solicitudSeleccionada.imagenes
                                        }
                                    />
                                </section>

                            </div>

                            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 p-4 sm:flex-row sm:justify-end sm:p-5">
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
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {solicitudSeleccionada && seguimientoAbierto && (
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
                        aria-labelledby="titulo-seguimiento-servicio"
                        onSubmit={guardarSeguimiento}
                        className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#111513] p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-center gap-2">
                            <ClipboardList className="size-4 text-[#4cc185]" />
                            <h2
                                id="titulo-seguimiento-servicio"
                                className="text-base font-semibold text-white"
                            >
                                Seguimiento administrativo
                            </h2>
                        </div>

                        <p className="mt-2 text-xs text-white/45">
                            {solicitudSeleccionada.servicio.nombre}
                            {' · '}
                            {solicitudSeleccionada.cliente.nombre}
                        </p>

                        <label className="mt-5 block text-sm text-white/70">
                            Estado de la solicitud
                            <select
                                value={seguimiento.data.estado}
                                onChange={(event) =>
                                    seguimiento.setData(
                                        'estado',
                                        event.target
                                            .value as EstadoServicio,
                                    )
                                }
                                className="mt-2 h-11 w-full appearance-none rounded-lg border border-white/15 bg-[#191e1b] px-4 text-sm text-white outline-none focus:border-[#006635] focus:ring-2 focus:ring-[#006635]/20"
                            >
                                <option value="en_espera">
                                    Servicio en espera
                                </option>
                                <option value="concluido">
                                    Servicio concluido
                                </option>
                                <option value="cancelado">
                                    Servicio cancelado
                                </option>
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

            {/* =================================
                AVISO DE SOLICITUD ATENDIDA
            ================================= */}

            <Dialog
                open={solicitudAtendida !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSolicitudAtendida(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center gap-4 px-2 pt-2 text-center">
                        <span
                            className="flex size-14 items-center justify-center rounded-full text-white"
                            style={{
                                backgroundColor:
                                    BRAND_COLOR,
                            }}
                        >
                            <Check className="size-7" />
                        </span>

                        <DialogTitle className="text-xl">
                            Solicitud atendida
                        </DialogTitle>

                        <DialogDescription className="text-base leading-relaxed">
                            La solicitud de{' '}
                            <span className="font-semibold">
                                {solicitudAtendida?.servicio}
                            </span>{' '}
                            de{' '}
                            <span className="font-semibold">
                                {solicitudAtendida?.nombre}
                            </span>{' '}
                            quedó marcada como atendida.
                        </DialogDescription>

                        <button
                            type="button"
                            onClick={() =>
                                setSolicitudAtendida(null)
                            }
                            className="mt-1 w-full rounded-xl bg-[#006635] px-5 py-3 text-sm font-semibold text-white hover:bg-[#087a43]"
                        >
                            Entendido
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* =================================
                CONFIRMAR ELIMINACIÓN
            ================================= */}

            <Dialog
                open={solicitudToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSolicitudToDelete(null);
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
                            {solicitudToDelete?.servicio.nombre}
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
