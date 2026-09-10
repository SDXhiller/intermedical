import { Form, Head, router, usePage } from '@inertiajs/react';
import { ImagePlus, List, Pencil, Power, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import EquipoModuloController from '@/actions/App/Http/Controllers/Admin/EquipoModuloController';
import Heading from '@/components/heading';
import Imagen360Editor from '@/components/imagen-360-editor';
import type { Imagen360Item } from '@/components/imagen-360-editor';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { modelosEquipos } from '@/routes/admin';

/**
 * Flags espejo de App\Support\EquipoFieldFlags.
 * false = campo deshabilitado (código conservado, no se muestra, se guarda null).
 */
const ENABLE_EQUIPO_ESTADO = false;
const ENABLE_EQUIPO_DISPONIBILIDAD = false;

type OptionItem = {
    id: number;
    nombre?: string;
    modulo?: string;
    tipo?: string;
    slug?: string;
    color?: string;
};

type EquipoItem = {
    id: number;
    modulo_id: number;
    fabricante_id: number;
    modelo: string;
    imagen: string | null;
    descripcion_corta: string | null;
    estado: string | null;
    modalidad: string | null;
    aplicaciones: string | null;
    anio: number | null;
    tipo_equipo_id: number;
    disponibilidad_id: number | null;
    precio: string | null;
    activo: boolean;
    modulo: { id: number; modulo: string } | null;
    fabricante: { id: number; nombre: string } | null;
    tipo_equipo: { id: number; tipo: string; slug: string } | null;
    disponibilidad: { id: number; nombre: string; color: string } | null;
    imagenes_360?: Imagen360Item[];
};

type PageProps = {
    flash?: {
        success?: string | null;
        open_360_equipo_id?: number | null;
    };
};

const selectClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]';

const textareaClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px]';

function imageSrc(path: string): string {
    return `/${path.replace(/^\//, '')}`;
}

export default function RegistroEquiposModelos({
    modulos,
    fabricantes,
    tiposEquipos,
    disponibilidades,
    equipos,
}: {
    modulos: OptionItem[];
    fabricantes: OptionItem[];
    tiposEquipos: OptionItem[];
    disponibilidades: OptionItem[];
    equipos: EquipoItem[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [preview, setPreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const [listOpen, setListOpen] = useState(false);
    const [equipoToDelete, setEquipoToDelete] = useState<EquipoItem | null>(
        null,
    );
    const [equipoToEditId, setEquipoToEditId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [equipo360Id, setEquipo360Id] = useState<number | null>(null);
    const [closedFlash360Id, setClosedFlash360Id] = useState<number | null>(
        null,
    );
    const [saveFirstOpen, setSaveFirstOpen] = useState(false);

    const flash360Id = flash?.open_360_equipo_id ?? null;

    const resolved360Id = useMemo(() => {
        if (equipo360Id !== null) {
            return equipo360Id;
        }

        if (flash360Id !== null && flash360Id !== closedFlash360Id) {
            return flash360Id;
        }

        return null;
    }, [equipo360Id, flash360Id, closedFlash360Id]);

    const equipo360 = useMemo(
        () =>
            resolved360Id !== null
                ? (equipos.find((item) => item.id === resolved360Id) ?? null)
                : null,
        [equipos, resolved360Id],
    );

    const equipoToEdit = useMemo(
        () =>
            equipoToEditId !== null
                ? (equipos.find((item) => item.id === equipoToEditId) ?? null)
                : null,
        [equipos, equipoToEditId],
    );

    const openEquipo360Editor = (equipoId: number) => {
        if (!equipos.some((item) => item.id === equipoId)) {
            return;
        }

        setEquipo360Id(equipoId);
    };

    const closeEquipo360Editor = () => {
        if (flash360Id !== null) {
            setClosedFlash360Id(flash360Id);
        }

        setEquipo360Id(null);
    };

    const openPreview360Editor = () => {
        const targetId =
            flash360Id ??
            equipos.find((item) => item.imagen)?.id ??
            null;

        if (targetId) {
            openEquipo360Editor(targetId);

            return;
        }

        setSaveFirstOpen(true);
    };

    const openEditModal = (item: EquipoItem) => {
        setEquipoToEditId(item.id);
        setEditPreview(item.imagen ? imageSrc(item.imagen) : null);
        setListOpen(false);
    };

    const closeEditModal = () => {
        setEquipoToEditId(null);
        setEditPreview(null);
    };

    const confirmDelete = () => {
        if (!equipoToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(EquipoModuloController.destroy.url(equipoToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setEquipoToDelete(null);
            },
        });
    };

    const toggleStatus = (item: EquipoItem) => {
        setTogglingId(item.id);

        router.patch(
            EquipoModuloController.toggleStatus.url(item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    return (
        <>
            <Head title="Modelos de equipos" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Modelos de equipos"
                        description="Registre modelos asociados a módulos, fabricantes y disponibilidad."
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 gap-2"
                        onClick={() => setListOpen(true)}
                    >
                        <List className="size-4" />
                        Ver modelos ({equipos.length})
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <h2 className="text-base font-semibold text-foreground">
                        Registrar modelo
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete los campos del modelo. La tabla de registros
                        está disponible en el modal.
                    </p>

                    <Form
                        {...EquipoModuloController.store.form()}
                        encType="multipart/form-data"
                        resetOnSuccess
                        className="mt-6 space-y-5"
                        onSuccess={() => setPreview(null)}
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="modulo_id">
                                            Módulo
                                        </Label>
                                        <select
                                            id="modulo_id"
                                            name="modulo_id"
                                            required
                                            defaultValue=""
                                            className={selectClassName}
                                        >
                                            <option value="" disabled>
                                                Seleccione un módulo
                                            </option>
                                            {modulos.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.modulo}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.modulo_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="fabricante_id">
                                            Fabricante
                                        </Label>
                                        <select
                                            id="fabricante_id"
                                            name="fabricante_id"
                                            required
                                            defaultValue=""
                                            className={selectClassName}
                                        >
                                            <option value="" disabled>
                                                Seleccione un fabricante
                                            </option>
                                            {fabricantes.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.fabricante_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="modelo">Modelo</Label>
                                        <Input
                                            id="modelo"
                                            name="modelo"
                                            required
                                            placeholder="Ej. MAGNETOM Vida"
                                        />
                                        <InputError message={errors.modelo} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="tipo_equipo_id">
                                            Tipo de equipo
                                        </Label>
                                        <select
                                            id="tipo_equipo_id"
                                            name="tipo_equipo_id"
                                            required
                                            defaultValue=""
                                            className={selectClassName}
                                        >
                                            <option value="" disabled>
                                                Seleccione un tipo
                                            </option>
                                            {tiposEquipos.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.tipo}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.tipo_equipo_id}
                                        />
                                    </div>

                                    {ENABLE_EQUIPO_DISPONIBILIDAD ? (
                                        <div className="grid gap-2">
                                            <Label htmlFor="disponibilidad_id">
                                                Disponibilidad
                                            </Label>
                                            <select
                                                id="disponibilidad_id"
                                                name="disponibilidad_id"
                                                required
                                                defaultValue=""
                                                className={selectClassName}
                                            >
                                                <option value="" disabled>
                                                    Seleccione disponibilidad
                                                </option>
                                                {disponibilidades.map(
                                                    (item) => (
                                                        <option
                                                            key={item.id}
                                                            value={item.id}
                                                        >
                                                            {item.nombre}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <InputError
                                                message={
                                                    errors.disponibilidad_id
                                                }
                                            />
                                        </div>
                                    ) : null}

                                    {ENABLE_EQUIPO_ESTADO ? (
                                        <div className="grid gap-2">
                                            <Label htmlFor="estado">
                                                Estado
                                            </Label>
                                            <select
                                                id="estado"
                                                name="estado"
                                                required
                                                defaultValue=""
                                                className={selectClassName}
                                            >
                                                <option value="" disabled>
                                                    Seleccione el estado
                                                </option>
                                                <option value="Nuevo">
                                                    Nuevo
                                                </option>
                                                <option value="Reacondicionado">
                                                    Reacondicionado
                                                </option>
                                                <option value="Demostración">
                                                    Demostración
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.estado}
                                            />
                                        </div>
                                    ) : null}

                                    <div className="grid gap-2">
                                        <Label htmlFor="modalidad">
                                            Modalidad
                                        </Label>
                                        <Input
                                            id="modalidad"
                                            name="modalidad"
                                            required
                                            placeholder="Ej. Diagnóstico por imagen"
                                        />
                                        <InputError
                                            message={errors.modalidad}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="precio">
                                            Precio (opcional)
                                        </Label>
                                        <Input
                                            id="precio"
                                            name="precio"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.precio} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="anio">Año</Label>
                                        <Input
                                            id="anio"
                                            name="anio"
                                            type="number"
                                            min="1990"
                                            max={
                                                new Date().getFullYear() + 1
                                            }
                                            placeholder="Ej. 2022"
                                        />
                                        <InputError message={errors.anio} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="activo">Estatus</Label>
                                        <select
                                            id="activo"
                                            name="activo"
                                            required
                                            defaultValue="1"
                                            className={selectClassName}
                                        >
                                            <option value="1">Activo</option>
                                            <option value="0">Inactivo</option>
                                        </select>
                                        <InputError message={errors.activo} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="aplicaciones">
                                        Aplicaciones
                                    </Label>
                                    <textarea
                                        id="aplicaciones"
                                        name="aplicaciones"
                                        required
                                        rows={2}
                                        placeholder="Ej. Hospitalario, ambulatorio y clínica especializada"
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px]"
                                    />
                                    <InputError
                                        message={errors.aplicaciones}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="descripcion_corta">
                                        Descripción del equipo
                                    </Label>
                                    <textarea
                                        id="descripcion_corta"
                                        name="descripcion_corta"
                                        rows={6}
                                        maxLength={5000}
                                        placeholder="Descripción del modelo visible en la ficha pública"
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px]"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Máximo 5000 caracteres. Se muestra en la
                                        pestaña Descripción del equipo.
                                    </p>
                                    <InputError
                                        message={errors.descripcion_corta}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="imagen">Imagen</Label>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                        <label className="flex min-h-32 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition hover:border-[#0a7c4a]/40 hover:bg-[#0a7c4a]/5">
                                            <ImagePlus className="size-6 text-[#0a7c4a]" />
                                            <span className="text-sm font-medium text-foreground">
                                                Seleccionar imagen
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                PNG, JPG o WEBP. Máx. 5 MB.
                                            </span>
                                            <input
                                                id="imagen"
                                                name="imagen"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(event) => {
                                                    const file =
                                                        event.target
                                                            .files?.[0];

                                                    if (!file) {
                                                        setPreview(null);

                                                        return;
                                                    }

                                                    setPreview(
                                                        URL.createObjectURL(
                                                            file,
                                                        ),
                                                    );
                                                }}
                                            />
                                        </label>
                                        {preview && (
                                            <button
                                                type="button"
                                                title="Clic para editar recorrido 360"
                                                onClick={openPreview360Editor}
                                                className="group relative h-32 w-40 shrink-0 overflow-hidden rounded-lg border-2 border-[#0a7c4a] bg-muted/20 transition hover:ring-2 hover:ring-[#0a7c4a]/40"
                                            >
                                                <img
                                                    src={preview}
                                                    alt="Vista previa"
                                                    className="size-full object-cover"
                                                />
                                                <span className="absolute inset-x-0 bottom-0 bg-[#0a7c4a] px-2 py-1.5 text-left text-[10px] font-semibold text-white">
                                                    Editar 360°
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    <InputError message={errors.imagen} />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                    >
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar modelo'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>
            </div>

            <Dialog open={listOpen} onOpenChange={setListOpen}>
                <DialogContent className="flex max-h-[85vh] w-full flex-col gap-4 sm:max-w-5xl">
                    <DialogTitle>Modelos registrados</DialogTitle>
                    <DialogDescription>
                        Listado de modelos de equipos en la base de datos.
                    </DialogDescription>

                    <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border">
                        {equipos.length === 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                Aún no hay modelos registrados.
                            </div>
                        ) : (
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-3 py-2 font-semibold">
                                            Modelo
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Módulo
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Fabricante
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Tipo
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Disponibilidad
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Estatus
                                        </th>
                                        <th className="px-3 py-2 text-right font-semibold">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipos.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-border last:border-0"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#0a7c4a]/50 bg-muted">
                                                        {item.imagen ? (
                                                            <button
                                                                type="button"
                                                                title="Clic para editar recorrido 360"
                                                                className="size-full"
                                                                onClick={() =>
                                                                    setEquipo360Id(
                                                                        item.id,
                                                                    )
                                                                }
                                                            >
                                                                <img
                                                                    src={imageSrc(
                                                                        item.imagen,
                                                                    )}
                                                                    alt={
                                                                        item.modelo
                                                                    }
                                                                    className="size-full object-cover"
                                                                />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                title="Clic para editar recorrido 360"
                                                                className="flex size-full items-center justify-center text-[9px] font-semibold text-[#0a7c4a]"
                                                                onClick={() =>
                                                                    setEquipo360Id(
                                                                        item.id,
                                                                    )
                                                                }
                                                            >
                                                                360°
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-foreground">
                                                            {item.modelo}
                                                        </p>
                                                        {item.precio && (
                                                            <p className="text-xs text-muted-foreground">
                                                                $
                                                                {Number(
                                                                    item.precio,
                                                                ).toLocaleString(
                                                                    'es-MX',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                    },
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {item.modulo?.modulo ?? '—'}
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {item.fabricante?.nombre ??
                                                    '—'}
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {item.tipo_equipo?.tipo ?? '—'}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-xs font-medium text-foreground">
                                                    {item.disponibilidad
                                                        ?.nombre ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        item.activo
                                                            ? 'bg-[#0a7c4a]/15 text-[#0a7c4a]'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {item.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="Editar modelo"
                                                        aria-label="Editar modelo"
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title={
                                                            item.activo
                                                                ? 'Desactivar modelo'
                                                                : 'Activar modelo'
                                                        }
                                                        aria-label={
                                                            item.activo
                                                                ? 'Desactivar modelo'
                                                                : 'Activar modelo'
                                                        }
                                                        disabled={
                                                            togglingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            toggleStatus(item)
                                                        }
                                                        className={`inline-flex size-8 items-center justify-center rounded-full border transition disabled:opacity-50 ${
                                                            item.activo
                                                                ? 'border-[#0a7c4a]/30 text-[#0a7c4a] hover:bg-[#0a7c4a]/10'
                                                                : 'border-border text-muted-foreground hover:bg-muted'
                                                        }`}
                                                    >
                                                        <Power className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Eliminar modelo"
                                                        aria-label="Eliminar modelo"
                                                        onClick={() =>
                                                            setEquipoToDelete(
                                                                item,
                                                            )
                                                        }
                                                        className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive transition hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={equipoToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setEquipoToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar modelo</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar el modelo
                        {equipoToDelete
                            ? ` "${equipoToDelete.modelo}"`
                            : ''}
                        ? Esta acción no se puede deshacer.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={equipoToEdit !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEditModal();
                    }
                }}
            >
                <DialogContent className="flex max-h-[90vh] w-full flex-col gap-4 overflow-hidden sm:max-w-3xl">
                    <div>
                        <DialogTitle>
                            Editar modelo
                            {equipoToEdit ? ` — ${equipoToEdit.modelo}` : ''}
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                            Actualice los datos del equipo. La imagen es
                            opcional; si no selecciona una nueva se conserva la
                            actual.
                        </DialogDescription>
                    </div>

                    {equipoToEdit && (
                        <Form
                            key={equipoToEdit.id}
                            {...EquipoModuloController.update.form(
                                equipoToEdit.id,
                            )}
                            encType="multipart/form-data"
                            className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
                            onSuccess={() => {
                                closeEditModal();
                            }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-modulo_id">
                                                Módulo
                                            </Label>
                                            <select
                                                id="edit-modulo_id"
                                                name="modulo_id"
                                                required
                                                defaultValue={
                                                    equipoToEdit.modulo_id
                                                }
                                                className={selectClassName}
                                            >
                                                {modulos.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.modulo}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.modulo_id}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-fabricante_id">
                                                Fabricante
                                            </Label>
                                            <select
                                                id="edit-fabricante_id"
                                                name="fabricante_id"
                                                required
                                                defaultValue={
                                                    equipoToEdit.fabricante_id
                                                }
                                                className={selectClassName}
                                            >
                                                {fabricantes.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.fabricante_id}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-modelo">
                                                Modelo
                                            </Label>
                                            <Input
                                                id="edit-modelo"
                                                name="modelo"
                                                required
                                                defaultValue={
                                                    equipoToEdit.modelo
                                                }
                                            />
                                            <InputError
                                                message={errors.modelo}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-tipo_equipo_id">
                                                Tipo de equipo
                                            </Label>
                                            <select
                                                id="edit-tipo_equipo_id"
                                                name="tipo_equipo_id"
                                                required
                                                defaultValue={
                                                    equipoToEdit.tipo_equipo_id
                                                }
                                                className={selectClassName}
                                            >
                                                {tiposEquipos.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.tipo}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.tipo_equipo_id}
                                            />
                                        </div>

                                        {ENABLE_EQUIPO_DISPONIBILIDAD ? (
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-disponibilidad_id">
                                                    Disponibilidad
                                                </Label>
                                                <select
                                                    id="edit-disponibilidad_id"
                                                    name="disponibilidad_id"
                                                    required
                                                    defaultValue={
                                                        equipoToEdit.disponibilidad_id ??
                                                        ''
                                                    }
                                                    className={selectClassName}
                                                >
                                                    {disponibilidades.map(
                                                        (item) => (
                                                            <option
                                                                key={item.id}
                                                                value={item.id}
                                                            >
                                                                {item.nombre}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <InputError
                                                    message={
                                                        errors.disponibilidad_id
                                                    }
                                                />
                                            </div>
                                        ) : null}

                                        {ENABLE_EQUIPO_ESTADO ? (
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-estado">
                                                    Estado
                                                </Label>
                                                <select
                                                    id="edit-estado"
                                                    name="estado"
                                                    required
                                                    defaultValue={
                                                        equipoToEdit.estado ??
                                                        ''
                                                    }
                                                    className={selectClassName}
                                                >
                                                    <option value="Nuevo">
                                                        Nuevo
                                                    </option>
                                                    <option value="Reacondicionado">
                                                        Reacondicionado
                                                    </option>
                                                    <option value="Demostración">
                                                        Demostración
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={errors.estado}
                                                />
                                            </div>
                                        ) : null}

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-modalidad">
                                                Modalidad
                                            </Label>
                                            <Input
                                                id="edit-modalidad"
                                                name="modalidad"
                                                required
                                                defaultValue={
                                                    equipoToEdit.modalidad ??
                                                    ''
                                                }
                                            />
                                            <InputError
                                                message={errors.modalidad}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-precio">
                                                Precio (opcional)
                                            </Label>
                                            <Input
                                                id="edit-precio"
                                                name="precio"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                defaultValue={
                                                    equipoToEdit.precio ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.precio}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-anio">
                                                Año
                                            </Label>
                                            <Input
                                                id="edit-anio"
                                                name="anio"
                                                type="number"
                                                min="1990"
                                                max={
                                                    new Date().getFullYear() + 1
                                                }
                                                defaultValue={
                                                    equipoToEdit.anio ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.anio}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-activo">
                                                Estatus
                                            </Label>
                                            <select
                                                id="edit-activo"
                                                name="activo"
                                                required
                                                defaultValue={
                                                    equipoToEdit.activo
                                                        ? '1'
                                                        : '0'
                                                }
                                                className={selectClassName}
                                            >
                                                <option value="1">
                                                    Activo
                                                </option>
                                                <option value="0">
                                                    Inactivo
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.activo}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-aplicaciones">
                                            Aplicaciones
                                        </Label>
                                        <textarea
                                            id="edit-aplicaciones"
                                            name="aplicaciones"
                                            required
                                            rows={2}
                                            defaultValue={
                                                equipoToEdit.aplicaciones ?? ''
                                            }
                                            className={textareaClassName}
                                        />
                                        <InputError
                                            message={errors.aplicaciones}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-descripcion_corta">
                                            Descripción del equipo
                                        </Label>
                                        <textarea
                                            id="edit-descripcion_corta"
                                            name="descripcion_corta"
                                            rows={6}
                                            maxLength={5000}
                                            defaultValue={
                                                equipoToEdit.descripcion_corta ??
                                                ''
                                            }
                                            className={textareaClassName}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Máximo 5000 caracteres. Se muestra
                                            en la pestaña Descripción del
                                            equipo.
                                        </p>
                                        <InputError
                                            message={errors.descripcion_corta}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-imagen">
                                            Imagen
                                        </Label>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                            <label className="flex min-h-28 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-center transition hover:border-[#0a7c4a]/40">
                                                <ImagePlus className="size-5 text-[#0a7c4a]" />
                                                <span className="text-sm font-medium">
                                                    Cambiar imagen
                                                </span>
                                                <input
                                                    id="edit-imagen"
                                                    name="imagen"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(event) => {
                                                        const file =
                                                            event.target
                                                                .files?.[0];

                                                        if (!file) {
                                                            setEditPreview(
                                                                equipoToEdit.imagen
                                                                    ? imageSrc(
                                                                          equipoToEdit.imagen,
                                                                      )
                                                                    : null,
                                                            );

                                                            return;
                                                        }

                                                        setEditPreview(
                                                            URL.createObjectURL(
                                                                file,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            </label>
                                            {editPreview && (
                                                <button
                                                    type="button"
                                                    title="Clic para editar recorrido 360"
                                                    onClick={() => {
                                                        setEquipo360Id(
                                                            equipoToEdit.id,
                                                        );
                                                    }}
                                                    className="group relative h-28 w-36 shrink-0 overflow-hidden rounded-lg border-2 border-[#0a7c4a] bg-muted/20"
                                                >
                                                    <img
                                                        src={editPreview}
                                                        alt={
                                                            equipoToEdit.modelo
                                                        }
                                                        className="size-full object-cover"
                                                    />
                                                    <span className="absolute inset-x-0 bottom-0 bg-[#0a7c4a] px-2 py-1.5 text-left text-[10px] font-semibold text-white">
                                                        Editar 360°
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                        <InputError message={errors.imagen} />
                                    </div>

                                    <DialogFooter className="sticky bottom-0 gap-2 bg-background pt-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={closeEditModal}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                        >
                                            {processing
                                                ? 'Guardando...'
                                                : 'Guardar cambios'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <Imagen360Editor
                open={equipo360 !== null}
                equipo={
                    equipo360
                        ? {
                              id: equipo360.id,
                              modelo: equipo360.modelo,
                              imagen: equipo360.imagen,
                              imagenes_360: equipo360.imagenes_360 ?? [],
                          }
                        : null
                }
                onOpenChange={(open) => {
                    if (!open) {
                        closeEquipo360Editor();
                    }
                }}
            />

            <Dialog open={saveFirstOpen} onOpenChange={setSaveFirstOpen}>
                <DialogContent>
                    <DialogTitle>Guarde el modelo primero</DialogTitle>
                    <DialogDescription>
                        Para colocar los puntos verdes del recorrido 360,
                        primero guarde el modelo con su imagen. Después haga
                        clic en la vista previa con borde verde.
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setSaveFirstOpen(false)}
                            className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                        >
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RegistroEquiposModelos.layout = {
    breadcrumbs: [
        {
            title: 'Modelos de equipos',
            href: modelosEquipos(),
        },
    ],
};
