import { Form, Head, router, usePage } from '@inertiajs/react';
import {
    Headphones,
    Mail,
    MessageCircle,
    Phone,
    Power,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import ServicioController from '@/actions/App/Http/Controllers/Admin/ServicioController';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { index as serviciosIndex } from '@/routes/admin/servicios';

type ServicioIcono = 'telefono' | 'soporte' | 'correo' | 'whatsapp';

type OptionTelefono = {
    id: number;
    nombre: string;
    numero: string;
    tipo: string;
};

type OptionCorreo = {
    id: number;
    nombre: string;
    correo: string;
};

type OptionHorario = {
    id: number;
    dias: string;
    hora_inicio: string;
    hora_fin: string;
};

type OptionTipoServicio = {
    id: number;
    nombre: string;
    slug: string;
};

type ServicioItem = {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string | null;
    icono: ServicioIcono;
    activo: boolean;
    tipo_servicio_mantenimiento_id: number | null;
    tipoServicioMantenimiento: OptionTipoServicio | null;
    telefono: OptionTelefono | null;
    correo: OptionCorreo | null;
    horario: OptionHorario | null;
};

type PageProps = {
    flash?: {
        success?: string | null;
    };
};

const iconOptions: {
    value: ServicioIcono;
    label: string;
    description: string;
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
    {
        value: 'telefono',
        label: 'Teléfono',
        description: 'Atención telefónica',
        Icon: Phone,
    },
    {
        value: 'soporte',
        label: 'Atención a cliente',
        description: 'Diadema / soporte',
        Icon: Headphones,
    },
    {
        value: 'correo',
        label: 'Email',
        description: 'Correo electrónico',
        Icon: Mail,
    },
    {
        value: 'whatsapp',
        label: 'WhatsApp',
        description: 'Mensaje directo',
        Icon: MessageCircle,
    },
];

const selectClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]';

const textareaClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px]';

function formatTime(value: string): string {
    return value.slice(0, 5);
}

function iconComponent(icono: ServicioIcono) {
    return iconOptions.find((option) => option.value === icono)?.Icon ?? Phone;
}

export default function CargarContacto({
    servicios,
    tiposServicio,
    telefonos,
    correos,
    horarios,
}: {
    servicios: ServicioItem[];
    tiposServicio: OptionTipoServicio[];
    telefonos: OptionTelefono[];
    correos: OptionCorreo[];
    horarios: OptionHorario[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [selectedIcono, setSelectedIcono] =
        useState<ServicioIcono>('telefono');
    const [servicioToDelete, setServicioToDelete] =
        useState<ServicioItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const confirmDelete = () => {
        if (!servicioToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(ServicioController.destroy.url(servicioToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setServicioToDelete(null);
            },
        });
    };

    const toggleStatus = (item: ServicioItem) => {
        setTogglingId(item.id);

        router.patch(
            ServicioController.toggleStatus.url(item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    return (
        <>
            <Head title="Servicios" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Servicios de contacto"
                    description="Registre servicios y asocie teléfono, correo y horario."
                />

                {flash?.success && (
                    <div className="rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <h2 className="text-base font-semibold text-foreground">
                            Registrar servicio
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Complete los datos del servicio. Elija el icono que
                            se mostrará en la tarjeta pública.
                        </p>

                        <Form
                            {...ServicioController.store.form()}
                            resetOnSuccess
                            className="mt-6 space-y-5"
                            onSuccess={() => setSelectedIcono('telefono')}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tipo_servicio_mantenimiento_id">
                                            Tipo de servicio
                                        </Label>
                                        <select
                                            id="tipo_servicio_mantenimiento_id"
                                            name="tipo_servicio_mantenimiento_id"
                                            required
                                            defaultValue=""
                                            className={selectClassName}
                                        >
                                            <option value="" disabled>
                                                Seleccione un tipo de servicio
                                            </option>
                                            {tiposServicio.map((tipo) => (
                                                <option
                                                    key={tipo.id}
                                                    value={tipo.id}
                                                >
                                                    {tipo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={
                                                errors.tipo_servicio_mantenimiento_id
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre">
                                            Nombre de servicio
                                        </Label>
                                        <Input
                                            id="nombre"
                                            name="nombre"
                                            required
                                            maxLength={255}
                                            placeholder="Ej. Atención telefónica"
                                        />
                                        <InputError message={errors.nombre} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="descripcion">
                                            Descripción
                                        </Label>
                                        <textarea
                                            id="descripcion"
                                            name="descripcion"
                                            rows={4}
                                            placeholder="Descripción del servicio"
                                            className={textareaClassName}
                                        />
                                        <InputError
                                            message={errors.descripcion}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Icono de la tarjeta</Label>
                                        <input
                                            type="hidden"
                                            name="icono"
                                            value={selectedIcono}
                                        />
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {iconOptions.map((option) => {
                                                const Icon = option.Icon;
                                                const isSelected =
                                                    selectedIcono ===
                                                    option.value;

                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedIcono(
                                                                option.value,
                                                            )
                                                        }
                                                        className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition ${
                                                            isSelected
                                                                ? 'border-[#0a7c4a] bg-[#0a7c4a]/10 ring-2 ring-[#0a7c4a]/25'
                                                                : 'border-border bg-background hover:border-[#0a7c4a]/40'
                                                        }`}
                                                    >
                                                        <span className="flex size-11 items-center justify-center rounded-full bg-[#0a7c4a]/10 text-[#0a7c4a]">
                                                            <Icon
                                                                className="size-5"
                                                                strokeWidth={
                                                                    1.75
                                                                }
                                                            />
                                                        </span>
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {option.label}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                option.description
                                                            }
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.icono} />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="telefono_id">
                                                Teléfono
                                            </Label>
                                            <select
                                                id="telefono_id"
                                                name="telefono_id"
                                                defaultValue=""
                                                className={selectClassName}
                                            >
                                                <option value="">
                                                    Sin teléfono
                                                </option>
                                                {telefonos.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.nombre} —{' '}
                                                        {item.numero}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.telefono_id}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="correo_id">
                                                Correo
                                            </Label>
                                            <select
                                                id="correo_id"
                                                name="correo_id"
                                                defaultValue=""
                                                className={selectClassName}
                                            >
                                                <option value="">
                                                    Sin correo
                                                </option>
                                                {correos.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.nombre} —{' '}
                                                        {item.correo}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.correo_id}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="horario_id">
                                                Horario
                                            </Label>
                                            <select
                                                id="horario_id"
                                                name="horario_id"
                                                defaultValue=""
                                                className={selectClassName}
                                            >
                                                <option value="">
                                                    Sin horario
                                                </option>
                                                {horarios.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.dias} (
                                                        {formatTime(
                                                            item.hora_inicio,
                                                        )}
                                                        -
                                                        {formatTime(
                                                            item.hora_fin,
                                                        )}
                                                        )
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.horario_id}
                                            />
                                        </div>
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

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                        >
                                            {processing
                                                ? 'Guardando...'
                                                : 'Guardar servicio'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <div className="flex items-center gap-2">
                            <Wrench className="size-5 text-[#0a7c4a]" />
                            <h2 className="text-base font-semibold">
                                Servicios registrados
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Listado actual en la base de datos.
                        </p>

                        <div className="mt-5 space-y-3">
                            {servicios.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                    Aún no hay servicios registrados.
                                </div>
                            ) : (
                                servicios.map((item) => {
                                    const Icon = iconComponent(item.icono);

                                    return (
                                        <article
                                            key={item.id}
                                            className="flex gap-3 rounded-lg border border-border p-3"
                                        >
                                            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10 text-[#0a7c4a]">
                                                <Icon
                                                    className="size-5"
                                                    strokeWidth={1.75}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-sm font-semibold">
                                                            {item.nombre}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item
                                                                .tipoServicioMantenimiento
                                                                ?.nombre ??
                                                                'Sin tipo'}{' '}
                                                            ·{' '}
                                                            {
                                                                iconOptions.find(
                                                                    (option) =>
                                                                        option.value ===
                                                                        item.icono,
                                                                )?.label
                                                            }
                                                        </p>
                                                    </div>
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
                                                            disabled={
                                                                togglingId ===
                                                                item.id
                                                            }
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    item,
                                                                )
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
                                                                setServicioToDelete(
                                                                    item,
                                                                )
                                                            }
                                                            className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                                                    {item.telefono && (
                                                        <p>
                                                            Tel:{' '}
                                                            {
                                                                item.telefono
                                                                    .numero
                                                            }
                                                        </p>
                                                    )}
                                                    {item.correo && (
                                                        <p>
                                                            Mail:{' '}
                                                            {
                                                                item.correo
                                                                    .correo
                                                            }
                                                        </p>
                                                    )}
                                                    {item.horario && (
                                                        <p>
                                                            Horario:{' '}
                                                            {item.horario.dias}{' '}
                                                            {formatTime(
                                                                item.horario
                                                                    .hora_inicio,
                                                            )}
                                                            -
                                                            {formatTime(
                                                                item.horario
                                                                    .hora_fin,
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <Dialog
                open={servicioToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setServicioToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar servicio</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar el servicio
                        {servicioToDelete
                            ? ` "${servicioToDelete.nombre}"`
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

CargarContacto.layout = {
    breadcrumbs: [
        {
            title: 'Servicios',
            href: serviciosIndex(),
        },
    ],
};
