import { Form, Head, router, usePage } from '@inertiajs/react';
import { Factory, ImagePlus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import FabricanteController from '@/actions/App/Http/Controllers/Admin/FabricanteController';
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
import { index as fabricantesIndex } from '@/routes/admin/fabricantes';

type FabricanteItem = {
    id: number;
    nombre: string;
    logo: string | null;
    activo: boolean;
    created_at?: string | null;
};

type PageProps = {
    fabricantes: FabricanteItem[];
    flash?: {
        success?: string | null;
    };
};

export default function CrearFabricante({
    fabricantes,
}: {
    fabricantes: FabricanteItem[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [preview, setPreview] = useState<string | null>(null);
    const [fabricanteToDelete, setFabricanteToDelete] =
        useState<FabricanteItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const confirmDelete = () => {
        if (!fabricanteToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(FabricanteController.destroy.url(fabricanteToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setFabricanteToDelete(null);
            },
        });
    };

    const toggleStatus = (item: FabricanteItem) => {
        setTogglingId(item.id);

        router.patch(
            FabricanteController.toggleStatus.url(item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    return (
        <>
            <Head title="Fabricantes" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Fabricantes"
                    description="Registre fabricantes que se asociarán a los modelos de equipos."
                />

                {flash?.success && (
                    <div className="rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <h2 className="text-base font-semibold text-foreground">
                            Registrar fabricante
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Complete el nombre, el logo opcional y el estatus.
                        </p>

                        <Form
                            {...FabricanteController.store.form()}
                            encType="multipart/form-data"
                            resetOnSuccess
                            className="mt-6 space-y-5"
                            onSuccess={() => setPreview(null)}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre">Nombre</Label>
                                        <Input
                                            id="nombre"
                                            name="nombre"
                                            required
                                            placeholder="Ej. Siemens Healthineers"
                                        />
                                        <InputError message={errors.nombre} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="activo">Estatus</Label>
                                        <select
                                            id="activo"
                                            name="activo"
                                            required
                                            defaultValue="1"
                                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]"
                                        >
                                            <option value="1">Activo</option>
                                            <option value="0">Inactivo</option>
                                        </select>
                                        <InputError message={errors.activo} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="logo">Logo</Label>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                            <label className="flex min-h-32 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition hover:border-[#0a7c4a]/40 hover:bg-[#0a7c4a]/5">
                                                <ImagePlus className="size-6 text-[#0a7c4a]" />
                                                <span className="text-sm font-medium text-foreground">
                                                    Seleccionar logo
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    PNG, JPG o WEBP. Máx. 5 MB.
                                                </span>
                                                <input
                                                    id="logo"
                                                    name="logo"
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
                                                <div className="flex h-32 w-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20 p-2">
                                                    <img
                                                        src={preview}
                                                        alt="Vista previa del logo"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <InputError message={errors.logo} />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                        >
                                            {processing
                                                ? 'Guardando...'
                                                : 'Guardar fabricante'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <div className="flex items-center gap-2">
                            <Factory className="size-5 text-[#0a7c4a]" />
                            <h2 className="text-base font-semibold text-foreground">
                                Fabricantes registrados
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Listado actual en la base de datos.
                        </p>

                        <div className="mt-5 space-y-3">
                            {fabricantes.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                    Aún no hay fabricantes registrados.
                                </div>
                            )}

                            {fabricantes.map((item) => (
                                <article
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                                >
                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                        {item.logo ? (
                                            <img
                                                src={`/${item.logo.replace(/^\//, '')}`}
                                                alt={item.nombre}
                                                className="size-full object-contain p-1"
                                            />
                                        ) : (
                                            <Factory className="size-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="truncate text-sm font-semibold text-foreground">
                                                {item.nombre}
                                            </h3>
                                            <div className="flex shrink-0 items-center gap-1.5">
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
                                                <button
                                                    type="button"
                                                    title={
                                                        item.activo
                                                            ? 'Desactivar fabricante'
                                                            : 'Activar fabricante'
                                                    }
                                                    aria-label={
                                                        item.activo
                                                            ? 'Desactivar fabricante'
                                                            : 'Activar fabricante'
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
                                                    title="Eliminar fabricante"
                                                    aria-label="Eliminar fabricante"
                                                    onClick={() =>
                                                        setFabricanteToDelete(
                                                            item,
                                                        )
                                                    }
                                                    className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive transition hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <Dialog
                open={fabricanteToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setFabricanteToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar fabricante</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar el fabricante
                        {fabricanteToDelete
                            ? ` "${fabricanteToDelete.nombre}"`
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
        </>
    );
}

CrearFabricante.layout = {
    breadcrumbs: [
        {
            title: 'Fabricantes',
            href: fabricantesIndex(),
        },
    ],
};
