import { Head, router, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    ChevronDown,
    Headphones,
    Mail,
    MapPin,
    Phone,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ClienteCotisacionController from '@/actions/App/Http/Controllers/Admin/ClienteCotisacionController';
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
import { index as adminCotizacionesIndex } from '@/routes/admin/cotizaciones';

const NUEVA_COTIZACION_MS = 24 * 60 * 60 * 1000;

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

function getCreatedAtMs(cotizacion: CotizacionItem): number | null {
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

    return nowMs - createdAtMs < NUEVA_COTIZACION_MS;
}

function nextNuevaExpiryMs(
    cotizaciones: CotizacionItem[],
    nowMs: number,
): number | null {
    const expirations = cotizaciones
        .map((cotizacion) => getCreatedAtMs(cotizacion))
        .filter((createdAtMs): createdAtMs is number => createdAtMs !== null)
        .map((createdAtMs) => createdAtMs + NUEVA_COTIZACION_MS)
        .filter((expiresAtMs) => expiresAtMs > nowMs)
        .sort((left, right) => left - right);

    return expirations[0] ?? null;
}

function NotificationDot() {
    return (
        <span
            className="size-2.5 shrink-0 animate-pulse rounded-full bg-red-500 ring-2 ring-red-500/30"
            aria-label="Nueva solicitud"
        />
    );
}

function CotizacionAccordionItem({
    cotizacion,
    showNotification,
    onDelete,
    isDeleting,
}: {
    cotizacion: CotizacionItem;
    showNotification: boolean;
    onDelete: (cotizacion: CotizacionItem) => void;
    isDeleting: boolean;
}) {
    return (
        <Collapsible defaultOpen={false} className="border-b border-border last:border-b-0">
            <div className="flex items-start gap-2 px-5 py-4 md:px-6">
                <CollapsibleTrigger className="group flex min-w-0 flex-1 items-start gap-3 text-left transition-colors hover:opacity-90">
                    <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />

                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            {showNotification && <NotificationDot />}
                            <h3 className="text-base font-semibold text-foreground">
                                {cotizacion.cliente}
                            </h3>
                            {cotizacion.equipo && (
                                <Badge className="bg-[#0a7c4a]/10 text-[#0a7c4a] hover:bg-[#0a7c4a]/10">
                                    {cotizacion.equipo.nombre}
                                </Badge>
                            )}
                        </div>

                        <time
                            dateTime={cotizacion.created_at ?? undefined}
                            className="shrink-0 text-sm text-muted-foreground"
                        >
                            {cotizacion.created_at_formatted}
                        </time>
                    </div>
                </CollapsibleTrigger>

                <button
                    type="button"
                    title="Eliminar solicitud"
                    aria-label="Eliminar solicitud"
                    disabled={isDeleting}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(cotizacion);
                    }}
                    className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-destructive/30 text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                >
                    <Trash2 className="size-3.5" />
                </button>
            </div>

            <CollapsibleContent className="px-5 pb-5 md:px-6">
                <div className="ml-7 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                        <User className="size-4 shrink-0" />
                        <span>
                            {cotizacion.contacto}
                            {cotizacion.area ? ` · ${cotizacion.area}` : ''}
                        </span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Phone className="size-4 shrink-0" />
                        <a
                            href={`tel:${cotizacion.telefono.replace(/\s/g, '')}`}
                            className="hover:text-[#0a7c4a]"
                        >
                            {cotizacion.telefono}
                        </a>
                    </p>
                    <p className="flex items-center gap-2 sm:col-span-2">
                        <Mail className="size-4 shrink-0" />
                        <a
                            href={`mailto:${cotizacion.correo}`}
                            className="hover:text-[#0a7c4a]"
                        >
                            {cotizacion.correo}
                        </a>
                    </p>
                    <p className="flex items-start gap-2 sm:col-span-2">
                        <Building2 className="mt-0.5 size-4 shrink-0" />
                        <span>{cotizacion.direccion}</span>
                    </p>
                    {cotizacion.latitud && cotizacion.longitud && (
                        <p className="flex items-center gap-2 sm:col-span-2">
                            <MapPin className="size-4 shrink-0" />
                            <a
                                href={`https://www.google.com/maps?q=${cotizacion.latitud},${cotizacion.longitud}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-[#0a7c4a]"
                            >
                                Ver en mapa ({cotizacion.latitud},{' '}
                                {cotizacion.longitud})
                            </a>
                        </p>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

export default function Cotizacionview({
    cotizaciones,
    filtros,
    resumen,
    meses,
    anios_disponibles,
}: {
    cotizaciones: CotizacionItem[];
    filtros: Filtros;
    resumen: Resumen;
    meses: MesOption[];
    anios_disponibles: number[];
}) {
    const { flash } = usePage<{ flash?: { success?: string | null } }>().props;
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [cotizacionToDelete, setCotizacionToDelete] =
        useState<CotizacionItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [buscar, setBuscar] = useState(filtros.buscar);

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
            cotizaciones
                .filter((cotizacion) => isNuevaCotizacion(cotizacion, nowMs))
                .map((cotizacion) => cotizacion.id),
        );
    }, [cotizaciones, nowMs]);

    const hasNuevas = nuevaIds.size > 0;

    useEffect(() => {
        const expiresAtMs = nextNuevaExpiryMs(cotizaciones, nowMs);

        if (expiresAtMs === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            setNowMs(Date.now());
        }, Math.max(expiresAtMs - Date.now(), 0));

        return () => window.clearTimeout(timer);
    }, [cotizaciones, nowMs]);

    const confirmDelete = () => {
        if (!cotizacionToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(
            ClienteCotisacionController.destroy.url(cotizacionToDelete.id, {
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
                    setCotizacionToDelete(null);
                },
            },
        );
    };

    const resumenSolicitud =
        resumen.total_mes === 1 ? 'cotización' : 'cotizaciones';
    const resumenFiltrado =
        resumen.total_filtrado === 1 ? 'resultado' : 'resultados';

    return (
        <>
            <Head title="Cotizaciones" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Cotizaciones"
                    description="Solicitudes enviadas desde el formulario público de cotización."
                />

                {flash?.success && (
                    <div className="rounded-xl border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-mes">Mes</Label>
                                <Select
                                    value={String(filtros.mes)}
                                    onValueChange={(value) =>
                                        applyFilters({ mes: Number(value) })
                                    }
                                >
                                    <SelectTrigger
                                        id="filtro-mes"
                                        className="w-full"
                                    >
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
                                <Label htmlFor="filtro-buscar">
                                    Buscar por cliente
                                </Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="filtro-buscar"
                                        value={buscar}
                                        onChange={(event) =>
                                            setBuscar(event.target.value)
                                        }
                                        placeholder="Nombre del hospital o clínica"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#0a7c4a]/20 bg-[#0a7c4a]/5 px-4 py-3">
                        <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#0a7c4a]" />
                        <div className="space-y-1 text-sm">
                            <p className="font-medium text-foreground">
                                En {resumen.mes_nombre} de {resumen.anio} se
                                solicitaron {resumen.total_mes}{' '}
                                {resumenSolicitud}.
                            </p>
                            {filtros.buscar !== '' && (
                                <p className="text-muted-foreground">
                                    Mostrando {resumen.total_filtrado}{' '}
                                    {resumenFiltrado} para &quot;
                                    {filtros.buscar}&quot;.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
                        <div className="flex items-center gap-2">
                            <Headphones className="size-5 text-[#0a7c4a]" />
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

                    {cotizaciones.length === 0 ? (
                        <div className="px-5 py-12 text-center md:px-6">
                            <Headphones className="mx-auto size-10 text-muted-foreground/50" />
                            <p className="mt-4 text-sm font-medium text-foreground">
                                {filtros.buscar !== ''
                                    ? 'No se encontraron clientes con ese nombre'
                                    : `No hay solicitudes en ${resumen.mes_nombre} de ${resumen.anio}`}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {filtros.buscar !== ''
                                    ? 'Pruebe con otro nombre o limpie el buscador.'
                                    : 'Seleccione otro mes o año para consultar solicitudes anteriores.'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {cotizaciones.map((cotizacion) => (
                                <CotizacionAccordionItem
                                    key={cotizacion.id}
                                    cotizacion={cotizacion}
                                    showNotification={nuevaIds.has(
                                        cotizacion.id,
                                    )}
                                    onDelete={setCotizacionToDelete}
                                    isDeleting={
                                        isDeleting &&
                                        cotizacionToDelete?.id ===
                                            cotizacion.id
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <Dialog
                open={cotizacionToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setCotizacionToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar solicitud</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar la solicitud de{' '}
                        <span className="font-semibold text-foreground">
                            {cotizacionToDelete?.cliente}
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
