import { Form, Head, router, useForm } from '@inertiajs/react';
import { Pencil, Power, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import TipoServicioMantenimientoController from '@/actions/App/Http/Controllers/Admin/TipoServicioMantenimientoController';
import Heading from '@/components/heading';
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
import { configuracion as adminConfiguracion } from '@/routes/admin';

type TipoServicioItem = {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string;
    activo: boolean;
    servicios_count?: number;
    created_at?: string | null;
};

const selectClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]';

const textareaClassName =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

function EditTipoServicioForm({
    tipo,
    onCancel,
}: {
    tipo: TipoServicioItem;
    onCancel: () => void;
}) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion ?? '',
        activo: tipo.activo ? '1' : '0',
    });

    return (
        <form
            className="space-y-4 rounded-lg border border-border p-4"
            onSubmit={(event) => {
                event.preventDefault();
                put(TipoServicioMantenimientoController.update.url(tipo.id), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: onCancel,
                });
            }}
        >
            <p className="text-sm font-medium text-foreground">
                Editar tipo de servicio
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="edit-nombre">Nombre</Label>
                    <Input
                        id="edit-nombre"
                        name="nombre"
                        required
                        value={data.nombre}
                        onChange={(event) =>
                            setData('nombre', event.target.value)
                        }
                    />
                    <InputError message={errors.nombre} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-activo">Estatus</Label>
                    <select
                        id="edit-activo"
                        name="activo"
                        required
                        value={data.activo}
                        onChange={(event) =>
                            setData('activo', event.target.value)
                        }
                        className={selectClassName}
                    >
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
                    </select>
                    <InputError message={errors.activo} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="edit-descripcion">Descripción de la tarjeta</Label>
                <textarea
                    id="edit-descripcion"
                    name="descripcion"
                    required
                    rows={4}
                    value={data.descripcion}
                    onChange={(event) =>
                        setData('descripcion', event.target.value)
                    }
                    placeholder="Texto que se muestra en la tarjeta de servicios"
                    className={textareaClassName}
                />
                <InputError message={errors.descripcion} />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                >
                    {processing ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>
        </form>
    );
}

export default function EquiposAjustes({
    tiposServicio,
}: {
    tiposServicio: TipoServicioItem[];
}) {
    const [tableOpen, setTableOpen] = useState(false);
    const [editingTipo, setEditingTipo] = useState<TipoServicioItem | null>(
        null,
    );
    const [tipoToDelete, setTipoToDelete] = useState<TipoServicioItem | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const toggleStatus = (item: TipoServicioItem) => {
        setTogglingId(item.id);

        router.patch(
            TipoServicioMantenimientoController.toggleStatus.url(item.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    const confirmDelete = () => {
        if (!tipoToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(
            TipoServicioMantenimientoController.destroy.url(tipoToDelete.id),
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsDeleting(false);
                    setTipoToDelete(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="Configuración" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Configuración"
                    description="Registre los tipos de servicio que se usarán al cargar servicios de mantenimiento."
                />

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <div className="flex items-center gap-2">
                        <Settings className="size-5 text-[#0a7c4a]" />
                        <h2 className="text-base font-semibold text-foreground">
                            Agregar tipo de servicio
                        </h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Capture el nombre, la descripción de la tarjeta y el
                        estatus del tipo. El identificador se genera
                        automáticamente.
                    </p>

                    <Form
                        {...TipoServicioMantenimientoController.store.form()}
                        resetOnSuccess
                        className="mt-6 space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        name="nombre"
                                        required
                                        placeholder="Ej. Mantenimiento preventivo"
                                    />
                                    <InputError message={errors.nombre} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="descripcion">
                                        Descripción de la tarjeta
                                    </Label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        required
                                        rows={4}
                                        placeholder="Texto que se muestra en la tarjeta de servicios"
                                        className={textareaClassName}
                                    />
                                    <InputError message={errors.descripcion} />
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

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                    >
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar tipo de servicio'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>

                    <div className="mt-6 border-t border-border pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setEditingTipo(null);
                                setTipoToDelete(null);
                                setTableOpen(true);
                            }}
                        >
                            Ver tabla
                        </Button>
                    </div>
                </section>
            </div>

            <Dialog
                open={tableOpen}
                onOpenChange={(open) => {
                    setTableOpen(open);

                    if (!open) {
                        setEditingTipo(null);
                        setTipoToDelete(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-4xl">
                    <DialogTitle>Tipos de servicio</DialogTitle>
                    <DialogDescription>
                        Listado actual en la base de datos. Puede editar,
                        activar, desactivar o eliminar cada registro.
                    </DialogDescription>

                    {editingTipo ? (
                        <EditTipoServicioForm
                            key={editingTipo.id}
                            tipo={editingTipo}
                            onCancel={() => setEditingTipo(null)}
                        />
                    ) : null}

                    <div className="max-h-[50vh] overflow-auto rounded-lg border border-border">
                        <table className="w-full min-w-[32rem] text-left text-sm">
                            <thead className="sticky top-0 border-b border-border bg-card text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 font-medium">
                                        Nombre
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        Identificador
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        Estatus
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tiposServicio.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-3 py-8 text-center text-muted-foreground"
                                        >
                                            Aún no hay tipos de servicio
                                            registrados.
                                        </td>
                                    </tr>
                                )}
                                {tiposServicio.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-border last:border-0"
                                    >
                                        <td className="px-3 py-2.5 font-medium text-foreground">
                                            {item.nombre}
                                        </td>
                                        <td className="px-3 py-2.5 text-muted-foreground">
                                            {item.slug}
                                        </td>
                                        <td className="px-3 py-2.5">
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
                                        <td className="px-3 py-2.5">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    title="Editar tipo de servicio"
                                                    aria-label="Editar tipo de servicio"
                                                    onClick={() =>
                                                        setEditingTipo(item)
                                                    }
                                                    className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted"
                                                >
                                                    <Pencil className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title={
                                                        item.activo
                                                            ? 'Desactivar tipo de servicio'
                                                            : 'Activar tipo de servicio'
                                                    }
                                                    aria-label={
                                                        item.activo
                                                            ? 'Desactivar tipo de servicio'
                                                            : 'Activar tipo de servicio'
                                                    }
                                                    disabled={
                                                        togglingId === item.id
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
                                                    title={
                                                        (item.servicios_count ??
                                                            0) > 0
                                                            ? 'Tiene servicios asociados'
                                                            : 'Eliminar tipo de servicio'
                                                    }
                                                    aria-label="Eliminar tipo de servicio"
                                                    disabled={
                                                        (item.servicios_count ??
                                                            0) > 0
                                                    }
                                                    onClick={() =>
                                                        setTipoToDelete(item)
                                                    }
                                                    className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={tipoToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setTipoToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar tipo de servicio</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar el tipo
                        {tipoToDelete ? ` "${tipoToDelete.nombre}"` : ''}? Esta
                        acción no se puede deshacer.
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
        </>
    );
}

EquiposAjustes.layout = {
    breadcrumbs: [
        {
            title: 'Configuración',
            href: adminConfiguracion(),
        },
    ],
};
