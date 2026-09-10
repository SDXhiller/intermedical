import { router } from '@inertiajs/react';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Imagen360Controller from '@/actions/App/Http/Controllers/Admin/Imagen360Controller';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export type Imagen360Item = {
    id: number;
    imagen: string;
    es_principal: boolean;
    orden: number;
    titulo?: string | null;
    puntos: Array<{
        id: number;
        pos_x: number | string;
        pos_y: number | string;
        etiqueta?: string | null;
        destino_imagen_360_id?: number | null;
    }>;
};

type Equipo360 = {
    id: number;
    modelo: string;
    imagen: string | null;
    imagenes_360: Imagen360Item[];
};

type DraftPoint = {
    key: string;
    pos_x: number;
    pos_y: number;
    etiqueta: string;
    destino_imagen_360_id: number | null;
};

function imageUrl(path: string): string {
    return `/${path.replace(/^\//, '')}`;
}

function serializePuntos(
    puntos: Imagen360Item['puntos'] | undefined,
): string {
    return JSON.stringify(
        (puntos ?? []).map((punto) => ({
            id: punto.id,
            pos_x: Number(punto.pos_x),
            pos_y: Number(punto.pos_y),
            etiqueta: punto.etiqueta ?? '',
            destino_imagen_360_id: punto.destino_imagen_360_id ?? null,
        })),
    );
}

export default function Imagen360Editor({
    equipo,
    open,
    onOpenChange,
}: {
    equipo: Equipo360 | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const angleInputRef = useRef<HTMLInputElement>(null);
    const dirtyRef = useRef(false);
    const dragMovedRef = useRef(false);
    const [activeImageId, setActiveImageId] = useState<number | null>(null);
    const [points, setPoints] = useState<DraftPoint[]>([]);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [placingMode, setPlacingMode] = useState(false);
    const [draggingKey, setDraggingKey] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingDeleteImage, setPendingDeleteImage] = useState<{
        id: number;
        label: string;
    } | null>(null);
    const [pendingAssignKey, setPendingAssignKey] = useState<string | null>(
        null,
    );
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const lastSyncedImageIdRef = useRef<number | null>(null);

    const images = equipo?.imagenes_360 ?? [];

    const activeImage = useMemo(
        () =>
            images.find((image) => image.id === activeImageId) ??
            images[0] ??
            null,
        [images, activeImageId],
    );

    const reusableImages = useMemo(
        () => images.filter((image) => image.id !== activeImage?.id),
        [images, activeImage?.id],
    );

    const serverPuntosKey = useMemo(
        () => serializePuntos(activeImage?.puntos),
        [activeImage?.id, activeImage?.puntos],
    );

    const canvasSrc = activeImage
        ? imageUrl(activeImage.imagen)
        : equipo?.imagen
          ? imageUrl(equipo.imagen)
          : null;

    useEffect(() => {
        if (!open || !equipo) {
            return;
        }

        dirtyRef.current = false;
        lastSyncedImageIdRef.current = null;
        setStatusMessage(null);
        setErrorMessage(null);
        setSelectedKey(null);
        setPendingDeleteImage(null);

        const initial =
            images.find((image) => image.es_principal)?.id ??
            images[0]?.id ??
            null;
        setActiveImageId(initial);
        setPlacingMode(false);
        setPendingAssignKey(null);
    }, [open, equipo?.id]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (
            activeImageId !== null &&
            images.length > 0 &&
            !images.some((image) => image.id === activeImageId)
        ) {
            setActiveImageId(
                images.find((image) => image.es_principal)?.id ??
                    images[0]?.id ??
                    null,
            );
            setSelectedKey(null);
        }
    }, [images, open, activeImageId]);

    useEffect(() => {
        if (!activeImage) {
            setPoints([]);
            setSelectedKey(null);
            lastSyncedImageIdRef.current = null;
            return;
        }

        if (dirtyRef.current) {
            return;
        }

        const nextPoints = activeImage.puntos.map((punto) => ({
            key: `db-${punto.id}`,
            pos_x: Number(punto.pos_x),
            pos_y: Number(punto.pos_y),
            etiqueta: punto.etiqueta ?? '',
            destino_imagen_360_id: punto.destino_imagen_360_id ?? null,
        }));

        setPoints(nextPoints);

        const switchedImage =
            lastSyncedImageIdRef.current !== activeImage.id;
        lastSyncedImageIdRef.current = activeImage.id;

        if (switchedImage) {
            setSelectedKey(null);
            return;
        }

        setSelectedKey((current) =>
            current && nextPoints.some((point) => point.key === current)
                ? current
                : null,
        );
    }, [activeImage?.id, serverPuntosKey]);

    const markDirty = () => {
        dirtyRef.current = true;
        setErrorMessage(null);
    };

    const updatePointPosition = (key: string, posX: number, posY: number) => {
        markDirty();
        setPoints((current) =>
            current.map((point) =>
                point.key === key
                    ? {
                          ...point,
                          pos_x: Math.min(100, Math.max(0, posX)),
                          pos_y: Math.min(100, Math.max(0, posY)),
                      }
                    : point,
            ),
        );
    };

    const placePointAt = (posX: number, posY: number) => {
        const key = `new-${Date.now()}`;
        markDirty();
        setPoints((current) => [
            ...current,
            {
                key,
                pos_x: posX,
                pos_y: posY,
                etiqueta: `Ángulo ${current.length + 1}`,
                destino_imagen_360_id: null,
            },
        ]);
        setSelectedKey(key);
        setPlacingMode(false);
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current || draggingKey || !placingMode) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const posX = ((event.clientX - rect.left) / rect.width) * 100;
        const posY = ((event.clientY - rect.top) / rect.height) * 100;
        placePointAt(posX, posY);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingKey || !canvasRef.current) {
            return;
        }

        dragMovedRef.current = true;
        const rect = canvasRef.current.getBoundingClientRect();
        const posX = ((event.clientX - rect.left) / rect.width) * 100;
        const posY = ((event.clientY - rect.top) / rect.height) * 100;
        updatePointPosition(draggingKey, posX, posY);
    };

    const payloadPuntos = () =>
        points.map((point) => ({
            pos_x: Number(point.pos_x.toFixed(2)),
            pos_y: Number(point.pos_y.toFixed(2)),
            etiqueta: point.etiqueta || null,
            destino_imagen_360_id: point.destino_imagen_360_id || null,
        }));

    const savePoints = () => {
        if (!equipo || !activeImage) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        router.put(
            Imagen360Controller.syncPuntos.url({
                equipoModulo: equipo.id,
                imagen360: activeImage.id,
            }),
            {
                puntos: payloadPuntos(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    dirtyRef.current = false;
                    setStatusMessage('Puntos guardados correctamente.');
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    setErrorMessage(
                        typeof firstError === 'string'
                            ? firstError
                            : 'No se pudieron guardar los puntos. Revise los datos.',
                    );
                },
                onFinish: () => setIsSaving(false),
            },
        );
    };

    const linkExistingDestino = (pointKey: string, destinoId: number) => {
        markDirty();
        setPoints((current) =>
            current.map((point) =>
                point.key === pointKey
                    ? { ...point, destino_imagen_360_id: destinoId }
                    : point,
            ),
        );
        setStatusMessage(
            'Vista existente vinculada. Pulse «Guardar puntos» para persistir.',
        );
    };

    const clearDestino = (pointKey: string) => {
        markDirty();
        setPoints((current) =>
            current.map((point) =>
                point.key === pointKey
                    ? { ...point, destino_imagen_360_id: null }
                    : point,
            ),
        );
    };

    const uploadAngleImage = (file: File, pointKey: string) => {
        if (!equipo || !activeImage) {
            return;
        }

        setIsUploading(true);
        setErrorMessage(null);

        router.post(
            Imagen360Controller.store.url(equipo.id),
            {
                imagen: file,
                titulo: file.name.replace(/\.[^.]+$/, ''),
                es_principal: false,
                origen_imagen_360_id: activeImage.id,
                puntos: points.map((point) => ({
                    pos_x: Number(point.pos_x.toFixed(2)),
                    pos_y: Number(point.pos_y.toFixed(2)),
                    etiqueta: point.etiqueta || null,
                    destino_imagen_360_id: point.destino_imagen_360_id || null,
                    asignar_destino: point.key === pointKey,
                })),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    dirtyRef.current = false;
                    setStatusMessage(
                        'Imagen del ángulo cargada y punto vinculado.',
                    );
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    setErrorMessage(
                        typeof firstError === 'string'
                            ? firstError
                            : 'No se pudo subir la imagen del ángulo.',
                    );
                },
                onFinish: () => {
                    setIsUploading(false);
                    setPendingAssignKey(null);
                },
            },
        );
    };

    const uploadExtraView = (file: File, asPrincipal = false) => {
        if (!equipo) {
            return;
        }

        setIsUploading(true);
        setErrorMessage(null);

        router.post(
            Imagen360Controller.store.url(equipo.id),
            {
                imagen: file,
                titulo: asPrincipal
                    ? 'Principal'
                    : file.name.replace(/\.[^.]+$/, ''),
                es_principal: asPrincipal,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    dirtyRef.current = false;
                    setStatusMessage(
                        asPrincipal
                            ? 'Imagen principal actualizada.'
                            : 'Vista 360 agregada correctamente.',
                    );
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    setErrorMessage(
                        typeof firstError === 'string'
                            ? firstError
                            : 'No se pudo subir la imagen.',
                    );
                },
                onFinish: () => setIsUploading(false),
            },
        );
    };

    const requestDeleteImage = (image: Imagen360Item, index: number) => {
        setPendingDeleteImage({
            id: image.id,
            label: image.es_principal
                ? `Vista ${index + 1} (principal)`
                : (image.titulo ?? `Vista ${index + 1}`),
        });
    };

    const confirmDeleteImage = () => {
        if (!equipo || !pendingDeleteImage) {
            return;
        }

        const imageId = pendingDeleteImage.id;

        setIsDeleting(true);
        setErrorMessage(null);

        router.delete(
            Imagen360Controller.destroy.url({
                equipoModulo: equipo.id,
                imagen360: imageId,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    dirtyRef.current = false;
                    setSelectedKey(null);
                    setPendingDeleteImage(null);
                    setStatusMessage('Vista 360 eliminada correctamente.');
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    setErrorMessage(
                        typeof firstError === 'string'
                            ? firstError
                            : 'No se pudo eliminar la vista.',
                    );
                },
                onFinish: () => setIsDeleting(false),
            },
        );
    };

    const selectedPoint = points.find((point) => point.key === selectedKey);
    const selectedDestino = selectedPoint?.destino_imagen_360_id
        ? images.find(
              (image) => image.id === selectedPoint.destino_imagen_360_id,
          )
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-full flex-col gap-4 overflow-hidden sm:max-w-6xl">
                <div className="shrink-0">
                    <DialogTitle>
                        Editor 360{equipo ? ` — ${equipo.modelo}` : ''}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                        Agregue un punto verde y asígnele una vista: reutilice
                        una ya subida (p. ej. la lateral) o suba una nueva.
                        Elimine vistas con la X en la miniatura. Pulse «Guardar
                        puntos» para persistir.
                    </DialogDescription>
                </div>

                {statusMessage && (
                    <div className="shrink-0 rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-3 py-2 text-sm text-[#0a7c4a]">
                        {statusMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="shrink-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {errorMessage}
                    </div>
                )}

                {pendingDeleteImage && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
                        <div
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="eliminar-imagen-360-title"
                            aria-describedby="eliminar-imagen-360-desc"
                            className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-xl"
                        >
                            <h3
                                id="eliminar-imagen-360-title"
                                className="text-base font-semibold text-foreground"
                            >
                                ¿Estás seguro de que quieres eliminar la
                                imagen?
                            </h3>
                            <p
                                id="eliminar-imagen-360-desc"
                                className="mt-2 text-sm text-muted-foreground"
                            >
                                Se eliminará «{pendingDeleteImage.label}», sus
                                puntos y los vínculos que la usen como destino.
                                Los cambios de puntos no guardados se perderán.
                            </p>
                            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={isDeleting}
                                    onClick={() => setPendingDeleteImage(null)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={isDeleting}
                                    onClick={confirmDeleteImage}
                                >
                                    {isDeleting
                                        ? 'Eliminando...'
                                        : 'Sí, eliminar imagen'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {!equipo || (!canvasSrc && images.length === 0) ? (
                    <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                        Este modelo aún no tiene imagen. Suba una para
                        comenzar.
                        {equipo && (
                            <div className="mt-4 flex justify-center">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                                    <ImagePlus className="size-4 text-[#0a7c4a]" />
                                    Subir imagen
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        disabled={isUploading}
                                        onChange={(event) => {
                                            const file =
                                                event.target.files?.[0];
                                            if (file) {
                                                uploadExtraView(file, true);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_16rem]">
                        <div className="min-w-0 space-y-3">
                            {images.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto px-1 pt-2 pb-1">
                                    {images.map((image, index) => (
                                        <div
                                            key={image.id}
                                            className={`relative h-16 w-20 shrink-0 ${
                                                activeImage?.id === image.id
                                                    ? 'z-10'
                                                    : ''
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    dirtyRef.current = false;
                                                    setSelectedKey(null);
                                                    setActiveImageId(image.id);
                                                }}
                                                className={`size-full overflow-hidden rounded-lg border-2 ${
                                                    activeImage?.id === image.id
                                                        ? 'border-[#0a7c4a]'
                                                        : 'border-border'
                                                }`}
                                                title={
                                                    image.es_principal
                                                        ? `Vista ${index + 1} · Principal`
                                                        : (image.titulo ??
                                                          `Vista ${index + 1}`)
                                                }
                                            >
                                                <img
                                                    src={imageUrl(image.imagen)}
                                                    alt={
                                                        image.titulo ??
                                                        `Vista ${index + 1}`
                                                    }
                                                    className="size-full object-cover"
                                                />
                                                <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 text-[10px] font-semibold text-white">
                                                    {index + 1}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isDeleting}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    requestDeleteImage(
                                                        image,
                                                        index,
                                                    );
                                                }}
                                                className="absolute right-0 top-0 z-20 flex size-5 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full bg-destructive text-white shadow-md hover:bg-destructive/90 disabled:opacity-50"
                                                title={`Eliminar vista ${index + 1}`}
                                                aria-label={`Eliminar vista ${index + 1}`}
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                ref={canvasRef}
                                className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-neutral-100 dark:bg-neutral-900 ${
                                    placingMode
                                        ? 'cursor-crosshair ring-2 ring-[#0a7c4a]/40'
                                        : 'cursor-default'
                                }`}
                                onClick={handleCanvasClick}
                                onPointerMove={handlePointerMove}
                                onPointerUp={() => setDraggingKey(null)}
                                onPointerLeave={() => setDraggingKey(null)}
                            >
                                {canvasSrc && (
                                    <img
                                        src={canvasSrc}
                                        alt={equipo?.modelo ?? '360'}
                                        className="size-full object-cover object-center"
                                        draggable={false}
                                    />
                                )}

                                {placingMode && (
                                    <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                                        <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                                            Haga clic en la imagen para colocar
                                            el punto
                                        </span>
                                    </div>
                                )}

                                {points.map((point) => (
                                    <button
                                        key={point.key}
                                        type="button"
                                        className={`absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-base font-bold text-white shadow-lg ring-4 ${
                                            selectedKey === point.key
                                                ? 'ring-white'
                                                : point.destino_imagen_360_id
                                                  ? 'ring-[#0a7c4a]/50'
                                                  : 'ring-white/30'
                                        }`}
                                        style={{
                                            left: `${point.pos_x}%`,
                                            top: `${point.pos_y}%`,
                                            backgroundColor: '#0a7c4a',
                                        }}
                                        title={
                                            point.destino_imagen_360_id
                                                ? 'Clic: ver ángulo · Segundo clic: ir a esa vista'
                                                : 'Clic para seleccionar y elegir vista en el panel'
                                        }
                                        onClick={(event) => {
                                            event.stopPropagation();

                                            if (dragMovedRef.current) {
                                                dragMovedRef.current = false;
                                                return;
                                            }

                                            if (selectedKey === point.key) {
                                                if (
                                                    point.destino_imagen_360_id
                                                ) {
                                                    dirtyRef.current = false;
                                                    setActiveImageId(
                                                        point.destino_imagen_360_id,
                                                    );
                                                    return;
                                                }

                                                setStatusMessage(
                                                    'Elija una vista existente en el panel o suba una nueva.',
                                                );
                                                return;
                                            }

                                            setSelectedKey(point.key);
                                        }}
                                        onPointerDown={(event) => {
                                            event.stopPropagation();
                                            dragMovedRef.current = false;
                                            event.currentTarget.setPointerCapture(
                                                event.pointerId,
                                            );
                                            setDraggingKey(point.key);
                                            setSelectedKey(point.key);
                                        }}
                                    >
                                        +
                                    </button>
                                ))}
                            </div>
                        </div>

                        <aside className="flex h-fit flex-col gap-3 rounded-xl border border-border bg-card p-4">
                            <h3 className="text-sm font-semibold text-foreground">
                                Panel de control
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                1) Agregue un punto. 2) Colóquelo. 3) En el
                                panel, reutilice una vista (1, 2, 3…) o suba una
                                nueva. 4) Guarde los puntos.
                            </p>

                            <Button
                                type="button"
                                disabled={!canvasSrc || !activeImage}
                                className="w-full gap-2 bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                onClick={() => setPlacingMode(true)}
                            >
                                <Plus className="size-4" />
                                Agregar punto
                            </Button>

                            {placingMode && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => setPlacingMode(false)}
                                >
                                    Cancelar colocación
                                </Button>
                            )}

                            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition hover:border-[#0a7c4a]/40">
                                <ImagePlus className="size-3.5 text-[#0a7c4a]" />
                                Subir otra vista
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    disabled={isUploading}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            uploadExtraView(file, false);
                                        }
                                        event.target.value = '';
                                    }}
                                />
                            </label>

                            <input
                                ref={angleInputRef}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                disabled={isUploading}
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    const key =
                                        pendingAssignKey ?? selectedKey;
                                    if (file && key) {
                                        uploadAngleImage(file, key);
                                    }
                                    event.target.value = '';
                                }}
                            />

                            {selectedPoint ? (
                                <div className="space-y-3 border-t border-border pt-3">
                                    <p className="text-xs font-semibold text-foreground">
                                        Punto seleccionado
                                    </p>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="punto-etiqueta">
                                            Etiqueta
                                        </Label>
                                        <input
                                            id="punto-etiqueta"
                                            value={selectedPoint.etiqueta}
                                            onChange={(event) => {
                                                markDirty();
                                                setPoints((current) =>
                                                    current.map((point) =>
                                                        point.key ===
                                                        selectedKey
                                                            ? {
                                                                  ...point,
                                                                  etiqueta:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : point,
                                                    ),
                                                );
                                            }}
                                            className="border-input h-9 rounded-md border bg-background px-3 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2 rounded-lg bg-muted/40 p-2">
                                        <p className="text-xs font-medium text-foreground">
                                            Imagen del ángulo
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Reutilice una vista ya subida (p.
                                            ej. lateral = vista 2) o cargue una
                                            nueva.
                                        </p>

                                        {reusableImages.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {reusableImages.map((image) => {
                                                    const index =
                                                        images.findIndex(
                                                            (item) =>
                                                                item.id ===
                                                                image.id,
                                                        ) + 1;
                                                    const isLinked =
                                                        selectedPoint.destino_imagen_360_id ===
                                                        image.id;

                                                    return (
                                                        <button
                                                            key={image.id}
                                                            type="button"
                                                            onClick={() =>
                                                                linkExistingDestino(
                                                                    selectedPoint.key,
                                                                    image.id,
                                                                )
                                                            }
                                                            className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                                                                isLinked
                                                                    ? 'border-[#0a7c4a] ring-1 ring-[#0a7c4a]/40'
                                                                    : 'border-border hover:border-[#0a7c4a]/50'
                                                            }`}
                                                            title={`Usar vista ${index}`}
                                                        >
                                                            <img
                                                                src={imageUrl(
                                                                    image.imagen,
                                                                )}
                                                                alt={`Vista ${index}`}
                                                                className="size-full object-cover"
                                                            />
                                                            <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 text-[10px] font-semibold text-white">
                                                                {index}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                Aún no hay otras vistas. Suba
                                                una con «Subir otra vista» o el
                                                botón de abajo.
                                            </p>
                                        )}

                                        {selectedDestino ? (
                                            <div className="space-y-2 border-t border-border/60 pt-2">
                                                <img
                                                    src={imageUrl(
                                                        selectedDestino.imagen,
                                                    )}
                                                    alt={
                                                        selectedDestino.titulo ??
                                                        'Ángulo'
                                                    }
                                                    className="h-20 w-full rounded-md object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => {
                                                        dirtyRef.current = false;
                                                        setActiveImageId(
                                                            selectedDestino.id,
                                                        );
                                                    }}
                                                >
                                                    Ver este ángulo
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() =>
                                                        clearDestino(
                                                            selectedPoint.key,
                                                        )
                                                    }
                                                >
                                                    Quitar vínculo
                                                </Button>
                                            </div>
                                        ) : null}

                                        <Button
                                            type="button"
                                            className="w-full bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                            disabled={isUploading}
                                            onClick={() => {
                                                setPendingAssignKey(
                                                    selectedPoint.key,
                                                );
                                                angleInputRef.current?.click();
                                            }}
                                        >
                                            Subir nueva imagen del ángulo
                                        </Button>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="w-full gap-2"
                                        onClick={() => {
                                            markDirty();
                                            setPoints((current) =>
                                                current.filter(
                                                    (point) =>
                                                        point.key !==
                                                        selectedKey,
                                                ),
                                            );
                                            setSelectedKey(null);
                                        }}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Eliminar punto
                                    </Button>
                                </div>
                            ) : (
                                <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                                    Seleccione un punto en la imagen para
                                    editarlo.
                                </p>
                            )}
                        </aside>
                    </div>
                )}

                <DialogFooter className="shrink-0 gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cerrar
                    </Button>
                    <Button
                        type="button"
                        disabled={!activeImage || isSaving}
                        className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                        onClick={savePoints}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar puntos'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
