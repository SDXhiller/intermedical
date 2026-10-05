import { Head, router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Hand,
    LifeBuoy,
    Search,
    Trash2,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import SolicitudSoporteController from '@/actions/App/Http/Controllers/Admin/SolicitudSoporteController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as adminSoporteIndex } from '@/routes/admin/soporte';

const NUEVA_SOLICITUD_MS = 24 * 60 * 60 * 1000;
const BRAND_COLOR = '#0a7c4a';
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_PASO = 0.5;

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

function getCreatedAtMs(solicitud: SolicitudItem): number | null {
    if (!solicitud.created_at) {
        return null;
    }

    const parsed = Date.parse(solicitud.created_at);

    return Number.isNaN(parsed) ? null : parsed;
}

function isNuevaSolicitud(solicitud: SolicitudItem, nowMs: number): boolean {
    if (solicitud.atendida) {
        return false;
    }

    const createdAtMs = getCreatedAtMs(solicitud);

    if (createdAtMs === null) {
        return solicitud.es_nueva;
    }

    return nowMs - createdAtMs < NUEVA_SOLICITUD_MS;
}

function Campo({
    titulo,
    valor,
}: {
    titulo: string;
    valor: string | null | undefined;
}) {
    const texto =
        valor !== null && valor !== undefined && valor.trim() !== ''
            ? valor
            : 'No indicado';

    return (
        <div className="grid min-w-0 gap-0.5">
            <p className="text-xs font-semibold text-muted-foreground">
                {titulo}
            </p>
            <p className="min-w-0 text-sm break-words text-foreground">{texto}</p>
        </div>
    );
}

function nextNuevaExpiryMs(
    solicitudes: SolicitudItem[],
    nowMs: number,
): number | null {
    const expirations = solicitudes
        .map((solicitud) => getCreatedAtMs(solicitud))
        .filter((createdAtMs): createdAtMs is number => createdAtMs !== null)
        .map((createdAtMs) => createdAtMs + NUEVA_SOLICITUD_MS)
        .filter((expiresAtMs) => expiresAtMs > nowMs)
        .sort((left, right) => left - right);

    return expirations[0] ?? null;
}

function GaleriaFotografias({ imagenes }: { imagenes: string[] }) {
    const [indice, setIndice] = useState<number | null>(null);
    const [zoom, setZoom] = useState(ZOOM_MIN);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [herramienta, setHerramienta] = useState<'zoom' | 'mano'>('zoom');
    const [arrastrando, setArrastrando] = useState(false);
    const arrastre = useRef<{
        x: number;
        y: number;
        panX: number;
        panY: number;
    } | null>(null);
    const varias = imagenes.length > 1;
    const actual = indice === null ? null : imagenes[indice];
    const puedeMover = herramienta === 'mano' && zoom > ZOOM_MIN;

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
                setIndice(
                    (actualIndice) =>
                        actualIndice === null
                            ? actualIndice
                            : (actualIndice - 1 + imagenes.length) %
                              imagenes.length,
                );
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                setIndice(
                    (actualIndice) =>
                        actualIndice === null
                            ? actualIndice
                            : (actualIndice + 1) % imagenes.length,
                );
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [imagenes.length, indice, varias]);

    const mover = (direccion: -1 | 1) => {
        setIndice((actualIndice) => {
            if (actualIndice === null) {
                return actualIndice;
            }

            return (
                (actualIndice + direccion + imagenes.length) % imagenes.length
            );
        });
    };

    const cambiarZoom = (siguiente: number) => {
        const limitado = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, siguiente));

        setZoom(limitado);

        if (limitado === ZOOM_MIN) {
            setPan({ x: 0, y: 0 });
        }
    };

    const iniciarArrastre = (event: PointerEvent<HTMLDivElement>) => {
        if (!puedeMover) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        arrastre.current = {
            x: event.clientX,
            y: event.clientY,
            panX: pan.x,
            panY: pan.y,
        };
        setArrastrando(true);
    };

    const moverArrastre = (event: PointerEvent<HTMLDivElement>) => {
        if (!arrastre.current) {
            return;
        }

        setPan({
            x: arrastre.current.panX + (event.clientX - arrastre.current.x),
            y: arrastre.current.panY + (event.clientY - arrastre.current.y),
        });
    };

    const soltarArrastre = () => {
        arrastre.current = null;
        setArrastrando(false);
    };

    return (
        <div className="grid gap-2 sm:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground">
                Fotografías
            </p>
            <div className="flex flex-wrap gap-2">
                {imagenes.map((src, index) => (
                    <button
                        key={src}
                        type="button"
                        onClick={() => setIndice(index)}
                        className="overflow-hidden rounded-lg"
                        aria-label={`Ver fotografía ${index + 1}`}
                    >
                        <img
                            src={src}
                            alt={`Fotografía ${index + 1}`}
                            className="h-16 w-16 object-cover"
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
                <DialogContent className="border-none bg-black p-3 sm:max-w-4xl">
                    <DialogTitle className="sr-only">
                        {indice === null
                            ? 'Fotografía'
                            : `Fotografía ${indice + 1} de ${imagenes.length}`}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Vista ampliada de la fotografía enviada con la solicitud.
                    </DialogDescription>
                    {actual ? (
                        <div
                            className={`relative h-[70vh] overflow-hidden ${herramienta === 'mano' ? (arrastrando ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'}`}
                            onPointerDown={iniciarArrastre}
                            onPointerMove={moverArrastre}
                            onPointerUp={soltarArrastre}
                            onPointerCancel={soltarArrastre}
                            onClick={() => {
                                if (herramienta === 'zoom') {
                                    cambiarZoom(zoom + ZOOM_PASO);
                                }
                            }}
                        >
                            <img
                                src={actual}
                                alt={
                                    indice === null
                                        ? 'Fotografía'
                                        : `Fotografía ${indice + 1}`
                                }
                                draggable={false}
                                className="h-full w-full object-contain select-none"
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                }}
                            />
                        </div>
                    ) : null}
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                            type="button"
                            aria-label="Acercar"
                            aria-pressed={herramienta === 'zoom'}
                            onClick={() => {
                                setHerramienta('zoom');
                                cambiarZoom(zoom + ZOOM_PASO);
                            }}
                            className={`flex size-10 items-center justify-center rounded-full transition ${herramienta === 'zoom' ? 'bg-white text-black' : 'bg-white/15 text-white hover:bg-white/25'}`}
                        >
                            <ZoomIn className="size-5" />
                        </button>
                        <button
                            type="button"
                            aria-label="Alejar"
                            onClick={() => cambiarZoom(zoom - ZOOM_PASO)}
                            className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                        >
                            <ZoomOut className="size-5" />
                        </button>
                        <button
                            type="button"
                            aria-label="Mano para mover el zoom"
                            aria-pressed={herramienta === 'mano'}
                            onClick={() => setHerramienta('mano')}
                            className={`flex size-10 items-center justify-center rounded-full transition ${herramienta === 'mano' ? 'bg-white text-black' : 'bg-white/15 text-white hover:bg-white/25'}`}
                        >
                            <Hand className="size-5" />
                        </button>
                        <span className="ml-1 min-w-12 text-center text-sm font-medium text-white">
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>
                    {varias ? (
                        <>
                            <button
                                type="button"
                                aria-label="Fotografía anterior"
                                onClick={() => mover(-1)}
                                className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                            >
                                <ChevronLeft className="size-5" />
                            </button>
                            <button
                                type="button"
                                aria-label="Fotografía siguiente"
                                onClick={() => mover(1)}
                                className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                            <p className="text-center text-sm font-medium text-white">
                                {indice !== null ? indice + 1 : 1} de{' '}
                                {imagenes.length}
                            </p>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function NotificationDot() {
    return (
        <span
            className="size-2.5 shrink-0 animate-pulse rounded-full bg-red-500 ring-2 ring-red-500/30"
            aria-label="Nueva solicitud"
        />
    );
}

function SolicitudAccordionItem({
    solicitud,
    showNotification,
    onDelete,
    isDeleting,
    onAtender,
    isAtendiendo,
}: {
    solicitud: SolicitudItem;
    showNotification: boolean;
    onDelete: (solicitud: SolicitudItem) => void;
    isDeleting: boolean;
    onAtender: (solicitud: SolicitudItem) => void;
    isAtendiendo: boolean;
}) {
    return (
        <Collapsible
            defaultOpen={false}
            className="border-b border-border last:border-b-0"
        >
            <div className="flex items-start gap-2 px-5 py-4 md:px-6">
                <CollapsibleTrigger className="group flex min-w-0 flex-1 items-start gap-3 text-left transition-colors hover:opacity-90">
                    <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />

                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            {showNotification && <NotificationDot />}
                            <h3 className="text-base font-semibold text-foreground">
                                {solicitud.cliente.nombre}
                            </h3>
                            <Badge className="bg-[#0a7c4a]/10 text-[#0a7c4a] hover:bg-[#0a7c4a]/10">
                                {solicitud.modalidad.nombre}
                            </Badge>
                            <Badge variant="secondary">
                                {solicitud.servicio.nombre}
                            </Badge>
                        </div>

                        <time
                            dateTime={solicitud.created_at ?? undefined}
                            className="shrink-0 text-sm text-muted-foreground"
                        >
                            {solicitud.created_at_formatted}
                        </time>
                    </div>
                </CollapsibleTrigger>

                {solicitud.atendida ? (
                    <span className="mt-0.5 inline-flex h-8 shrink-0 items-center rounded-full bg-[#0a7c4a]/10 px-3 text-xs font-semibold text-[#0a7c4a]">
                        Atendido
                    </span>
                ) : (
                    <button
                        type="button"
                        disabled={isAtendiendo}
                        onClick={(event) => {
                            event.stopPropagation();
                            onAtender(solicitud);
                        }}
                        className="mt-0.5 inline-flex h-8 shrink-0 items-center rounded-full border border-[#0a7c4a]/40 px-3 text-xs font-semibold text-[#0a7c4a] transition hover:bg-[#0a7c4a]/10 disabled:opacity-50"
                    >
                        {isAtendiendo ? 'Guardando...' : 'Atendido'}
                    </button>
                )}

                <button
                    type="button"
                    title="Eliminar solicitud"
                    aria-label="Eliminar solicitud"
                    disabled={isDeleting}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(solicitud);
                    }}
                    className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-destructive/30 text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                >
                    <Trash2 className="size-3.5" />
                </button>
            </div>

            <CollapsibleContent className="min-w-0 px-5 pb-5 md:px-6">
                <div className="ml-7 grid min-w-0 gap-4 sm:grid-cols-2">
                    <Campo titulo="Servicio" valor={solicitud.servicio.nombre} />
                    <Campo
                        titulo="Modalidad"
                        valor={solicitud.modalidad.nombre}
                    />
                    <Campo
                        titulo="Marca"
                        valor={solicitud.equipo?.marca}
                    />
                    <Campo
                        titulo="Modelo"
                        valor={solicitud.equipo?.nombre}
                    />
                    <Campo titulo="Nombre" valor={solicitud.cliente.nombre} />
                    <Campo
                        titulo="Empresa"
                        valor={solicitud.cliente.empresa}
                    />
                    <Campo
                        titulo="Teléfono"
                        valor={solicitud.cliente.telefono}
                    />
                    <Campo
                        titulo="Correo electrónico"
                        valor={solicitud.cliente.correo}
                    />
                    <Campo
                        titulo="Estado o ciudad"
                        valor={solicitud.cliente.estado}
                    />
                    <div className="grid min-w-0 gap-0.5 sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                            Descripción de la falla
                        </p>
                        <p className="min-w-0 text-sm break-words whitespace-pre-wrap text-foreground">
                            {solicitud.descripcion.trim() !== ''
                                ? solicitud.descripcion
                                : 'No indicado'}
                        </p>
                    </div>
                    {solicitud.imagenes.length > 0 ? (
                        <GaleriaFotografias imagenes={solicitud.imagenes} />
                    ) : null}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

export default function ServciosViewMail({
    solicitudes,
    filtros,
    resumen,
    meses,
    anios_disponibles,
}: {
    solicitudes: SolicitudItem[];
    filtros: Filtros;
    resumen: Resumen;
    meses: MesOption[];
    anios_disponibles: number[];
}) {
    const { flash } = usePage<{
        flash?: {
            success?: string | null;
            solicitud_atendida?: SolicitudAtendidaFlash | null;
        };
    }>().props;
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [solicitudToDelete, setSolicitudToDelete] =
        useState<SolicitudItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [atendiendoId, setAtendiendoId] = useState<number | null>(null);
    const [avisosOcultos, setAvisosOcultos] = useState<number[]>([]);
    const [solicitudAtendida, setSolicitudAtendida] =
        useState<SolicitudAtendidaFlash | null>(
            flash?.solicitud_atendida ?? null,
        );
    const [buscar, setBuscar] = useState(filtros.buscar);

    useEffect(() => {
        if (flash?.solicitud_atendida) {
            setSolicitudAtendida(flash.solicitud_atendida);
        }
    }, [flash?.solicitud_atendida]);

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
            adminSoporteIndex.url({
                query: {
                    mes: params.mes,
                    anio: params.anio,
                    ...(params.buscar !== '' ? { buscar: params.buscar } : {}),
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

    const nuevaIds = useMemo(() => {
        return new Set(
            solicitudes
                .filter((solicitud) => isNuevaSolicitud(solicitud, nowMs))
                .map((solicitud) => solicitud.id),
        );
    }, [solicitudes, nowMs]);

    const hasNuevas = solicitudes.some(
        (solicitud) =>
            nuevaIds.has(solicitud.id) && !avisosOcultos.includes(solicitud.id),
    );

    useEffect(() => {
        const expiresAtMs = nextNuevaExpiryMs(solicitudes, nowMs);

        if (expiresAtMs === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            setNowMs(Date.now());
        }, Math.max(expiresAtMs - Date.now(), 0));

        return () => window.clearTimeout(timer);
    }, [solicitudes, nowMs]);

    const marcarAtendida = (solicitud: SolicitudItem) => {
        setAtendiendoId(solicitud.id);
        setAvisosOcultos((current) =>
            current.includes(solicitud.id) ? current : [...current, solicitud.id],
        );

        router.patch(
            SolicitudSoporteController.atender.url(solicitud.id, {
                query: {
                    mes: filtros.mes,
                    anio: filtros.anio,
                    ...(filtros.buscar ? { buscar: filtros.buscar } : {}),
                },
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSolicitudAtendida({
                        servicio: solicitud.servicio.nombre,
                        nombre: solicitud.cliente.nombre,
                    });
                },
                onError: () => {
                    setAvisosOcultos((current) =>
                        current.filter((id) => id !== solicitud.id),
                    );
                },
                onFinish: () => setAtendiendoId(null),
            },
        );
    };

    const confirmDelete = () => {
        if (!solicitudToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(
            SolicitudSoporteController.destroy.url(solicitudToDelete.id, {
                query: {
                    mes: filtros.mes,
                    anio: filtros.anio,
                    ...(filtros.buscar ? { buscar: filtros.buscar } : {}),
                },
            }),
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsDeleting(false);
                    setSolicitudToDelete(null);
                },
            },
        );
    };

    const resumenSolicitud =
        resumen.total_mes === 1 ? 'solicitud' : 'solicitudes';
    const resumenFiltrado =
        resumen.total_filtrado === 1 ? 'resultado' : 'resultados';

    return (
        <>
            <Head title="Soporte" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <Heading
                    title="Soporte"
                    description="Solicitudes enviadas desde el formulario público de soporte técnico."
                />

                {flash?.success && (
                    <div className="rounded-xl border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="filtro-mes">Mes</Label>
                            <Select
                                value={String(filtros.mes)}
                                onValueChange={(value) =>
                                    applyFilters({ mes: Number(value) })
                                }
                            >
                                <SelectTrigger id="filtro-mes" className="w-full">
                                    <SelectValue placeholder="Seleccionar mes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {meses.map((mes) => (
                                        <SelectItem
                                            key={mes.value}
                                            value={String(mes.value)}
                                        >
                                            {mes.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="filtro-anio">Año</Label>
                            <Select
                                value={String(filtros.anio)}
                                onValueChange={(value) =>
                                    applyFilters({ anio: Number(value) })
                                }
                            >
                                <SelectTrigger
                                    id="filtro-anio"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Seleccionar año" />
                                </SelectTrigger>
                                <SelectContent>
                                    {anios_disponibles.map((anio) => (
                                        <SelectItem
                                            key={anio}
                                            value={String(anio)}
                                        >
                                            {anio}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
                            <Label htmlFor="filtro-buscar">Buscar</Label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="filtro-buscar"
                                    value={buscar}
                                    onChange={(event) =>
                                        setBuscar(event.target.value)
                                    }
                                    placeholder="Servicio, modalidad, equipo o cliente"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#0a7c4a]/20 bg-[#0a7c4a]/5 px-4 py-3">
                        <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#0a7c4a]" />
                        <div className="space-y-1 text-sm">
                            <p className="font-medium text-foreground">
                                En {resumen.mes_nombre} de {resumen.anio} se
                                recibieron {resumen.total_mes} {resumenSolicitud}.
                            </p>
                            {filtros.buscar !== '' && (
                                <p className="text-muted-foreground">
                                    Mostrando {resumen.total_filtrado}{' '}
                                    {resumenFiltrado} para &quot;{filtros.buscar}
                                    &quot;.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
                        <div className="flex items-center gap-2">
                            <LifeBuoy className="size-5 text-[#0a7c4a]" />
                            <h2 className="text-base font-semibold text-foreground">
                                Solicitudes recibidas
                            </h2>
                            {hasNuevas && <NotificationDot />}
                        </div>
                        <Badge variant="secondary">
                            {resumen.total_filtrado}{' '}
                            {resumen.total_filtrado === 1
                                ? 'solicitud'
                                : 'solicitudes'}
                        </Badge>
                    </div>

                    {solicitudes.length === 0 ? (
                        <div className="px-5 py-12 text-center md:px-6">
                            <LifeBuoy className="mx-auto size-10 text-muted-foreground/50" />
                            <p className="mt-4 text-sm font-medium text-foreground">
                                {filtros.buscar !== ''
                                    ? 'No se encontraron solicitudes con esa búsqueda'
                                    : `No hay solicitudes en ${resumen.mes_nombre} de ${resumen.anio}`}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {filtros.buscar !== ''
                                    ? 'Pruebe con otro servicio, modalidad o equipo.'
                                    : 'Seleccione otro mes o año para consultar solicitudes anteriores.'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {solicitudes.map((solicitud) => (
                                <SolicitudAccordionItem
                                    key={solicitud.id}
                                    solicitud={solicitud}
                                    showNotification={
                                        nuevaIds.has(solicitud.id) &&
                                        !avisosOcultos.includes(solicitud.id)
                                    }
                                    onDelete={setSolicitudToDelete}
                                    isDeleting={
                                        isDeleting &&
                                        solicitudToDelete?.id === solicitud.id
                                    }
                                    onAtender={marcarAtendida}
                                    isAtendiendo={atendiendoId === solicitud.id}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

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
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            <Check className="size-7" strokeWidth={2.25} />
                        </span>
                        <DialogTitle className="text-xl">
                            Solicitud atendida
                        </DialogTitle>
                        <DialogDescription className="text-base leading-relaxed text-foreground">
                            La solicitud de{' '}
                            <span className="font-semibold">
                                {solicitudAtendida?.servicio}
                            </span>{' '}
                            de{' '}
                            <span className="font-semibold">
                                {solicitudAtendida?.nombre}
                            </span>{' '}
                            quedó atendida.
                        </DialogDescription>
                        <button
                            type="button"
                            onClick={() => setSolicitudAtendida(null)}
                            className="mt-1 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            Entendido
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={solicitudToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSolicitudToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar solicitud</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar la solicitud de{' '}
                        <span className="font-semibold text-foreground">
                            {solicitudToDelete?.servicio.nombre}
                        </span>
                        ? Esta acción no se puede deshacer.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={confirmDelete}
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
