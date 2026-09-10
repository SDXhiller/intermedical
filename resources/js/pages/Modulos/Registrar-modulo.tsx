import { Form, Head, router, usePage } from '@inertiajs/react';
import { ImagePlus, Power, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import ModuloController from '@/actions/App/Http/Controllers/Admin/ModuloController';
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
import { create } from '@/routes/admin/equipos';

type StatusOption = {
    id: number;
    nombre: string;
};

type ModuloItem = {
    id: number;
    modulo: string;
    slug: string;
    imagen: string | null;
    descripcion: string | null;
    estatus_id: number;
    estatus?: {
        id: number;
        nombre: string;
    };
};

type PageProps = {
    statuses: StatusOption[];
    modulos: ModuloItem[];
    flash?: {
        success?: string | null;
    };
};

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function RegistrarModulo({
    statuses,
    modulos,
}: {
    statuses: StatusOption[];
    modulos: ModuloItem[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [moduloName, setModuloName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugManual, setSlugManual] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [moduloToDelete, setModuloToDelete] = useState<ModuloItem | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const defaultStatusId = useMemo(
        () =>
            statuses.find((status) => status.nombre === 'Activo')?.id ??
            statuses[0]?.id,
        [statuses],
    );

    const confirmDelete = () => {
        if (!moduloToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(ModuloController.destroy.url(moduloToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setModuloToDelete(null);
            },
        });
    };

    const toggleStatus = (item: ModuloItem) => {
        setTogglingId(item.id);

        router.patch(
            ModuloController.toggleStatus.url(item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    return (
        <>
            <Head title="Equipos" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Equipos"
                    description="Registre módulos de equipos médicos que se mostrarán en el sitio."
                />

                {flash?.success && (
                    <div className="rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <h2 className="text-base font-semibold text-foreground">
                            Registrar módulo
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Complete los datos del equipo. El slug se genera
                            automáticamente a partir del nombre.
                        </p>

                        <Form
                            {...ModuloController.store.form()}
                            encType="multipart/form-data"
                            resetOnSuccess
                            className="mt-6 space-y-5"
                            onSuccess={() => {
                                setModuloName('');
                                setSlug('');
                                setSlugManual(false);
                                setPreview(null);
                            }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="modulo">Módulo</Label>
                                        <Input
                                            id="modulo"
                                            name="modulo"
                                            required
                                            value={moduloName}
                                            onChange={(event) => {
                                                const value =
                                                    event.target.value;
                                                setModuloName(value);
                                                if (!slugManual) {
                                                    setSlug(slugify(value));
                                                }
                                            }}
                                            placeholder="Ej. Ultrasonido"
                                        />
                                        <InputError message={errors.modulo} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            required
                                            value={slug}
                                            onChange={(event) => {
                                                setSlugManual(true);
                                                setSlug(
                                                    slugify(event.target.value),
                                                );
                                            }}
                                            placeholder="ultrasonido"
                                        />
                                        <InputError message={errors.slug} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="descripcion">
                                            Descripción
                                        </Label>
                                        <textarea
                                            id="descripcion"
                                            name="descripcion"
                                            rows={4}
                                            placeholder="Descripción breve del módulo..."
                                            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                        />
                                        <InputError
                                            message={errors.descripcion}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="estatus_id">
                                            Estatus
                                        </Label>
                                        <select
                                            id="estatus_id"
                                            name="estatus_id"
                                            required
                                            defaultValue={defaultStatusId}
                                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]"
                                        >
                                            {statuses.map((status) => (
                                                <option
                                                    key={status.id}
                                                    value={status.id}
                                                >
                                                    {status.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.estatus_id}
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
                                                <div className="h-32 w-40 overflow-hidden rounded-lg border border-border">
                                                    <img
                                                        src={preview}
                                                        alt="Vista previa"
                                                        className="size-full object-cover"
                                                    />
                                                </div>
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
                                                : 'Guardar módulo'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <h2 className="text-base font-semibold text-foreground">
                            Módulos registrados
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Listado actual de equipos en la base de datos.
                        </p>

                        <div className="mt-5 space-y-3">
                            {modulos.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                    Aún no hay módulos registrados.
                                </div>
                            )}

                            {modulos.map((item) => {
                                const isActive =
                                    item.estatus?.nombre === 'Activo';

                                return (
                                    <article
                                        key={item.id}
                                        className="flex gap-3 rounded-lg border border-border p-3"
                                    >
                                        <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                                            {item.imagen ? (
                                                <img
                                                    src={`/${item.imagen}`}
                                                    alt={item.modulo}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="truncate text-sm font-semibold text-foreground">
                                                    {item.modulo}
                                                </h3>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                            isActive
                                                                ? 'bg-[#0a7c4a]/15 text-[#0a7c4a]'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {item.estatus
                                                            ?.nombre ??
                                                            'Sin estatus'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        title={
                                                            isActive
                                                                ? 'Desactivar módulo'
                                                                : 'Activar módulo'
                                                        }
                                                        aria-label={
                                                            isActive
                                                                ? 'Desactivar módulo'
                                                                : 'Activar módulo'
                                                        }
                                                        disabled={
                                                            togglingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            toggleStatus(item)
                                                        }
                                                        className={`inline-flex size-8 items-center justify-center rounded-full border transition disabled:opacity-50 ${
                                                            isActive
                                                                ? 'border-[#0a7c4a]/30 text-[#0a7c4a] hover:bg-[#0a7c4a]/10'
                                                                : 'border-border text-muted-foreground hover:bg-muted'
                                                        }`}
                                                    >
                                                        <Power className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Eliminar módulo"
                                                        aria-label="Eliminar módulo"
                                                        onClick={() =>
                                                            setModuloToDelete(
                                                                item,
                                                            )
                                                        }
                                                        className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive transition hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                /{item.slug}
                                            </p>
                                            {item.descripcion && (
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {item.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>

            <Dialog
                open={moduloToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setModuloToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar módulo</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar el módulo completo
                        {moduloToDelete
                            ? ` "${moduloToDelete.modulo}"`
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
                            {isDeleting
                                ? 'Eliminando...'
                                : 'Eliminar módulo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RegistrarModulo.layout = {
    breadcrumbs: [
        {
            title: 'Equipos',
            href: create(),
        },
    ],
};
