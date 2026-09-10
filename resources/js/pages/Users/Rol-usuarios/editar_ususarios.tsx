import { Form, Head, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import UsuarioController from '@/actions/App/Http/Controllers/Admin/UsuarioController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { edit as usuariosEdit } from '@/routes/admin/usuarios';

type RolItem = {
    id: number;
    nombre: string;
};

type CargoItem = {
    id: number;
    nombre: string;
};

type AdminItem = {
    id: number;
    name: string;
    apellidos: string | null;
    username: string;
    email: string;
    cargo: {
        id: number;
        nombre: string;
        slug: string;
    } | null;
    activo: boolean;
    rol_usuario: {
        id: number;
        nombre: string;
        slug: string;
    } | null;
    es_super_usuario: boolean;
};

type PageProps = {
    passwordRules: string;
    roles: RolItem[];
    cargos: CargoItem[];
    admins: AdminItem[];
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

const selectClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]';

export default function EditarUsuarios({
    passwordRules,
    roles,
    cargos,
    admins,
}: {
    passwordRules: string;
    roles: RolItem[];
    cargos: CargoItem[];
    admins: AdminItem[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [userToEdit, setUserToEdit] = useState<AdminItem | null>(null);
    const [userToDelete, setUserToDelete] = useState<AdminItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = () => {
        if (!userToDelete || userToDelete.es_super_usuario) {
            return;
        }

        setIsDeleting(true);

        router.delete(UsuarioController.destroy.url(userToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setUserToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Editar usuario" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Editar usuario"
                    description="Actualice los datos, el cargo, el rol y el estatus de los usuarios registrados."
                />

                {flash?.success && (
                    <div className="rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                        {flash.error}
                    </div>
                )}

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <h2 className="text-base font-semibold text-foreground">
                        Usuarios administradores
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        El super usuario se puede editar, pero no eliminar.
                    </p>

                    <div className="mt-5 overflow-x-auto rounded-lg border border-border">
                        {admins.length === 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                Aún no hay usuarios administradores
                                registrados.
                            </div>
                        ) : (
                            <table className="w-full min-w-[820px] text-left text-sm">
                                <thead className="bg-muted/80">
                                    <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                                        <th className="px-3 py-2 font-semibold">
                                            Nombre
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Usuario
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Correo
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Cargo
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Rol
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Activo o desactivado
                                        </th>
                                        <th className="px-3 py-2 text-right font-semibold">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-border last:border-0"
                                        >
                                            <td className="px-3 py-3 font-medium text-foreground">
                                                {item.name}
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {item.username}
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {item.email}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="w-fit rounded-full bg-[#0a7c4a]/15 px-2 py-0.5 text-[10px] font-semibold text-[#0a7c4a]">
                                                    {item.cargo?.nombre ||
                                                        'Sin cargo'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="w-fit rounded-full bg-[#0a7c4a]/15 px-2 py-0.5 text-[10px] font-semibold text-[#0a7c4a]">
                                                    {item.rol_usuario?.nombre ||
                                                        'Sin rol'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        item.activo
                                                            ? 'bg-[#0a7c4a]/15 text-[#0a7c4a]'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {item.activo
                                                        ? 'Activo'
                                                        : 'Desactivado'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="Editar usuario"
                                                        aria-label="Editar usuario"
                                                        onClick={() =>
                                                            setUserToEdit(item)
                                                        }
                                                        className="inline-flex size-8 items-center justify-center rounded-full border border-[#0a7c4a]/30 text-[#0a7c4a] transition hover:bg-[#0a7c4a]/10"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </button>
                                                    {item.es_super_usuario ? null : (
                                                        <button
                                                            type="button"
                                                            title="Eliminar usuario"
                                                            aria-label="Eliminar usuario"
                                                            onClick={() =>
                                                                setUserToDelete(
                                                                    item,
                                                                )
                                                            }
                                                            className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive transition hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>

            <Dialog
                open={userToEdit !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUserToEdit(null);
                    }
                }}
            >
                <DialogContent className="flex max-h-[85vh] w-full flex-col gap-4 sm:max-w-2xl">
                    <DialogTitle>Editar usuario</DialogTitle>
                    <DialogDescription>
                        {userToEdit?.es_super_usuario
                            ? 'El super usuario se puede editar, pero su rol y cargo no pueden cambiarse.'
                            : 'Actualice los datos del usuario seleccionado.'}
                    </DialogDescription>

                    {userToEdit && (
                        <Form
                            key={userToEdit.id}
                            {...UsuarioController.update.form(userToEdit.id)}
                            className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
                            onSuccess={() => setUserToEdit(null)}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-nombre">
                                                Nombre
                                            </Label>
                                            <Input
                                                id="edit-nombre"
                                                name="nombre"
                                                required
                                                defaultValue={userToEdit.name}
                                            />
                                            <InputError
                                                message={errors.nombre}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-apellidos">
                                                Apellidos
                                            </Label>
                                            <Input
                                                id="edit-apellidos"
                                                name="apellidos"
                                                defaultValue={
                                                    userToEdit.apellidos ?? ''
                                                }
                                                placeholder="null"
                                            />
                                            <InputError
                                                message={errors.apellidos}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-nombre_usuario">
                                                Nombre usuario
                                            </Label>
                                            <Input
                                                id="edit-nombre_usuario"
                                                name="nombre_usuario"
                                                required
                                                defaultValue={
                                                    userToEdit.username
                                                }
                                            />
                                            <InputError
                                                message={errors.nombre_usuario}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-correo">
                                                Correo
                                            </Label>
                                            <Input
                                                id="edit-correo"
                                                name="correo"
                                                type="email"
                                                required
                                                defaultValue={userToEdit.email}
                                            />
                                            <InputError
                                                message={errors.correo}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-cargo_id">
                                                Cargo
                                            </Label>
                                            {userToEdit.es_super_usuario ? (
                                                <>
                                                    <input
                                                        type="hidden"
                                                        name="cargo_id"
                                                        value={
                                                            userToEdit.cargo
                                                                ?.id ?? ''
                                                        }
                                                    />
                                                    <Input
                                                        id="edit-cargo_id"
                                                        value={
                                                            userToEdit.cargo
                                                                ?.nombre ??
                                                            'Super usuario'
                                                        }
                                                        disabled
                                                        readOnly
                                                    />
                                                </>
                                            ) : (
                                                <select
                                                    id="edit-cargo_id"
                                                    name="cargo_id"
                                                    required
                                                    defaultValue={
                                                        userToEdit.cargo?.id ??
                                                        ''
                                                    }
                                                    className={selectClassName}
                                                >
                                                    {cargos.map((cargo) => (
                                                        <option
                                                            key={cargo.id}
                                                            value={cargo.id}
                                                        >
                                                            {cargo.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <InputError
                                                message={errors.cargo_id}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-rol_usuario_id">
                                                Rol de usuario
                                            </Label>
                                            {userToEdit.es_super_usuario ? (
                                                <>
                                                    <input
                                                        type="hidden"
                                                        name="rol_usuario_id"
                                                        value={
                                                            userToEdit
                                                                .rol_usuario
                                                                ?.id ?? ''
                                                        }
                                                    />
                                                    <Input
                                                        id="edit-rol_usuario_id"
                                                        value="Super usuario"
                                                        disabled
                                                        readOnly
                                                    />
                                                </>
                                            ) : (
                                                <select
                                                    id="edit-rol_usuario_id"
                                                    name="rol_usuario_id"
                                                    required
                                                    defaultValue={
                                                        userToEdit.rol_usuario
                                                            ?.id ?? ''
                                                    }
                                                    className={selectClassName}
                                                >
                                                    {roles.map((rol) => (
                                                        <option
                                                            key={rol.id}
                                                            value={rol.id}
                                                        >
                                                            {rol.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <InputError
                                                message={errors.rol_usuario_id}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-activo">
                                                Activo o desactivado
                                            </Label>
                                            <select
                                                id="edit-activo"
                                                name="activo"
                                                required
                                                defaultValue={
                                                    userToEdit.activo
                                                        ? '1'
                                                        : '0'
                                                }
                                                className={selectClassName}
                                            >
                                                <option value="1">
                                                    Activo
                                                </option>
                                                <option value="0">
                                                    Desactivado
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.activo}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-password">
                                                Contraseña
                                            </Label>
                                            <PasswordInput
                                                id="edit-password"
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="Dejar vacío para no cambiar"
                                                passwordrules={passwordRules}
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-password_confirmation">
                                                Confirmar contraseña
                                            </Label>
                                            <PasswordInput
                                                id="edit-password_confirmation"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                placeholder="Confirme la contraseña"
                                                passwordrules={passwordRules}
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={processing}
                                            >
                                                Cancelar
                                            </Button>
                                        </DialogClose>
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

            <Dialog
                open={userToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setUserToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Eliminar usuario</DialogTitle>
                    <DialogDescription>
                        ¿Desea eliminar al usuario
                        {userToDelete ? ` "${userToDelete.username}"` : ''}?
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isDeleting}
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
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EditarUsuarios.layout = {
    breadcrumbs: [
        {
            title: 'Editar usuario',
            href: usuariosEdit(),
        },
    ],
};
