import { Form, Head, router, usePage } from '@inertiajs/react';
import { Clock3, Mail, Phone, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DatosContactoController from '@/actions/App/Http/Controllers/Admin/DatosContactoController';
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
import { index as datosContactoIndex } from '@/routes/admin/datos-contacto';

type TelefonoItem = {
    id: number;
    nombre: string;
    numero: string;
    tipo: string;
    activo: boolean;
};

type CorreoItem = {
    id: number;
    nombre: string;
    correo: string;
    activo: boolean;
};

type HorarioItem = {
    id: number;
    dias: string;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean;
};

type PageProps = {
    flash?: {
        success?: string | null;
    };
};

type DeleteTarget =
    | { type: 'telefono'; item: TelefonoItem }
    | { type: 'correo'; item: CorreoItem }
    | { type: 'horario'; item: HorarioItem };

const selectClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]';

function formatTime(value: string): string {
    return value.slice(0, 5);
}

export default function CargarDatosContactos({
    telefonos,
    correos,
    horarios,
}: {
    telefonos: TelefonoItem[];
    correos: CorreoItem[];
    horarios: HorarioItem[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingKey, setTogglingKey] = useState<string | null>(null);

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);

        const url =
            deleteTarget.type === 'telefono'
                ? DatosContactoController.destroyTelefono.url(
                      deleteTarget.item.id,
                  )
                : deleteTarget.type === 'correo'
                  ? DatosContactoController.destroyCorreo.url(
                        deleteTarget.item.id,
                    )
                  : DatosContactoController.destroyHorario.url(
                        deleteTarget.item.id,
                    );

        router.delete(url, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    const toggleTelefono = (item: TelefonoItem) => {
        setTogglingKey(`telefono-${item.id}`);
        router.patch(
            DatosContactoController.toggleTelefono.url(item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingKey(null),
            },
        );
    };

    const toggleCorreo = (item: CorreoItem) => {
        setTogglingKey(`correo-${item.id}`);
        router.patch(
            DatosContactoController.toggleCorreo.url(item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingKey(null),
            },
        );
    };

    const toggleHorario = (item: HorarioItem) => {
        setTogglingKey(`horario-${item.id}`);
        router.patch(
            DatosContactoController.toggleHorario.url(item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingKey(null),
            },
        );
    };

    return (
        <>
            <Head title="Datos de contacto" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Datos de contacto"
                    description="Registre teléfonos, correos y horarios para asociarlos a los servicios."
                />

                {flash?.success && (
                    <div className="rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-3">
                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <div className="flex items-center gap-2">
                            <Phone className="size-5 text-[#0a7c4a]" />
                            <h2 className="text-base font-semibold">
                                Teléfonos
                            </h2>
                        </div>

                        <Form
                            {...DatosContactoController.storeTelefono.form()}
                            resetOnSuccess
                            className="mt-5 space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tel-nombre">
                                            Nombre
                                        </Label>
                                        <Input
                                            id="tel-nombre"
                                            name="nombre"
                                            required
                                            placeholder="Ej. Atención telefónica"
                                        />
                                        <InputError message={errors.nombre} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tel-numero">
                                            Número
                                        </Label>
                                        <Input
                                            id="tel-numero"
                                            name="numero"
                                            required
                                            placeholder="Ej. +52 (55) 1234 5678"
                                        />
                                        <InputError message={errors.numero} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tel-tipo">Tipo</Label>
                                        <Input
                                            id="tel-tipo"
                                            name="tipo"
                                            required
                                            placeholder="Ej. ventas, soporte"
                                        />
                                        <InputError message={errors.tipo} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tel-activo">
                                            Estatus
                                        </Label>
                                        <select
                                            id="tel-activo"
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
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                    >
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar teléfono'}
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="mt-5 space-y-2 border-t border-border pt-4">
                            {telefonos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Sin teléfonos registrados.
                                </p>
                            ) : (
                                telefonos.map((item) => (
                                    <article
                                        key={item.id}
                                        className="flex items-start justify-between gap-2 rounded-lg border border-border p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {item.nombre}
                                            </p>
                                            <p className="text-sm text-[#0a7c4a]">
                                                {item.numero}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.tipo}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={
                                                    togglingKey ===
                                                    `telefono-${item.id}`
                                                }
                                                onClick={() =>
                                                    toggleTelefono(item)
                                                }
                                                className={`inline-flex size-8 items-center justify-center rounded-full border ${
                                                    item.activo
                                                        ? 'border-[#0a7c4a]/30 text-[#0a7c4a]'
                                                        : 'border-border text-muted-foreground'
                                                }`}
                                            >
                                                <Power className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        type: 'telefono',
                                                        item,
                                                    })
                                                }
                                                className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <div className="flex items-center gap-2">
                            <Mail className="size-5 text-[#0a7c4a]" />
                            <h2 className="text-base font-semibold">
                                Correos
                            </h2>
                        </div>

                        <Form
                            {...DatosContactoController.storeCorreo.form()}
                            resetOnSuccess
                            className="mt-5 space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mail-nombre">
                                            Nombre
                                        </Label>
                                        <Input
                                            id="mail-nombre"
                                            name="nombre"
                                            required
                                            placeholder="Ej. Ventas"
                                        />
                                        <InputError message={errors.nombre} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mail-correo">
                                            Correo
                                        </Label>
                                        <Input
                                            id="mail-correo"
                                            name="correo"
                                            type="email"
                                            required
                                            placeholder="Ej. ventas@empresa.com"
                                        />
                                        <InputError message={errors.correo} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mail-activo">
                                            Estatus
                                        </Label>
                                        <select
                                            id="mail-activo"
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
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                    >
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar correo'}
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="mt-5 space-y-2 border-t border-border pt-4">
                            {correos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Sin correos registrados.
                                </p>
                            ) : (
                                correos.map((item) => (
                                    <article
                                        key={item.id}
                                        className="flex items-start justify-between gap-2 rounded-lg border border-border p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {item.nombre}
                                            </p>
                                            <p className="break-all text-sm text-[#0a7c4a]">
                                                {item.correo}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={
                                                    togglingKey ===
                                                    `correo-${item.id}`
                                                }
                                                onClick={() =>
                                                    toggleCorreo(item)
                                                }
                                                className={`inline-flex size-8 items-center justify-center rounded-full border ${
                                                    item.activo
                                                        ? 'border-[#0a7c4a]/30 text-[#0a7c4a]'
                                                        : 'border-border text-muted-foreground'
                                                }`}
                                            >
                                                <Power className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        type: 'correo',
                                                        item,
                                                    })
                                                }
                                                className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <div className="flex items-center gap-2">
                            <Clock3 className="size-5 text-[#0a7c4a]" />
                            <h2 className="text-base font-semibold">
                                Horarios
                            </h2>
                        </div>

                        <Form
                            {...DatosContactoController.storeHorario.form()}
                            resetOnSuccess
                            className="mt-5 space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="hor-dias">Días</Label>
                                        <Input
                                            id="hor-dias"
                                            name="dias"
                                            required
                                            placeholder="Ej. Lunes a viernes"
                                        />
                                        <InputError message={errors.dias} />
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="hora_inicio">
                                                Hora inicio
                                            </Label>
                                            <Input
                                                id="hora_inicio"
                                                name="hora_inicio"
                                                type="time"
                                                required
                                            />
                                            <InputError
                                                message={errors.hora_inicio}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="hora_fin">
                                                Hora fin
                                            </Label>
                                            <Input
                                                id="hora_fin"
                                                name="hora_fin"
                                                type="time"
                                                required
                                            />
                                            <InputError
                                                message={errors.hora_fin}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="hor-activo">
                                            Estatus
                                        </Label>
                                        <select
                                            id="hor-activo"
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
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                    >
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar horario'}
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="mt-5 space-y-2 border-t border-border pt-4">
                            {horarios.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Sin horarios registrados.
                                </p>
                            ) : (
                                horarios.map((item) => (
                                    <article
                                        key={item.id}
                                        className="flex items-start justify-between gap-2 rounded-lg border border-border p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {item.dias}
                                            </p>
                                            <p className="text-sm text-[#0a7c4a]">
                                                {formatTime(item.hora_inicio)} -{' '}
                                                {formatTime(item.hora_fin)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={
                                                    togglingKey ===
                                                    `horario-${item.id}`
                                                }
                                                onClick={() =>
                                                    toggleHorario(item)
                                                }
                                                className={`inline-flex size-8 items-center justify-center rounded-full border ${
                                                    item.activo
                                                        ? 'border-[#0a7c4a]/30 text-[#0a7c4a]'
                                                        : 'border-border text-muted-foreground'
                                                }`}
                                            >
                                                <Power className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        type: 'horario',
                                                        item,
                                                    })
                                                }
                                                className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar registro</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar este registro? Esta acción no se puede
                        deshacer.
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

CargarDatosContactos.layout = {
    breadcrumbs: [
        {
            title: 'Datos de contacto',
            href: datosContactoIndex(),
        },
    ],
};
