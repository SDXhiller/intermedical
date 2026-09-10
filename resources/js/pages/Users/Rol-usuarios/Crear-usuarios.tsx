import { Form, Head, usePage } from '@inertiajs/react';
import UsuarioController from '@/actions/App/Http/Controllers/Admin/UsuarioController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create as usuariosCreate } from '@/routes/admin/usuarios';

type RolItem = {
    id: number;
    nombre: string;
};

type CargoItem = {
    id: number;
    nombre: string;
};

type PageProps = {
    passwordRules: string;
    roles: RolItem[];
    cargos: CargoItem[];
    flash?: {
        success?: string | null;
    };
};

const selectClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]';

export default function CrearUsuarios({
    passwordRules,
    roles,
    cargos,
}: {
    passwordRules: string;
    roles: RolItem[];
    cargos: CargoItem[];
}) {
    const { flash } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Crear usuario" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Crear usuario"
                    description="Registre un usuario administrador con su cargo, rol y credenciales de acceso."
                />

                {flash?.success && (
                    <div className="rounded-lg border border-[#0a7c4a]/30 bg-[#0a7c4a]/10 px-4 py-3 text-sm font-medium text-[#0a7c4a]">
                        {flash.success}
                    </div>
                )}

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <h2 className="text-base font-semibold text-foreground">
                        Registrar usuario administrador
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete los datos personales, el cargo, el rol y
                        confirme la contraseña antes de crear el usuario.
                    </p>

                    <Form
                        {...UsuarioController.store.form()}
                        resetOnSuccess
                        className="mt-6 space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre">Nombre</Label>
                                        <Input
                                            id="nombre"
                                            name="nombre"
                                            required
                                            autoComplete="given-name"
                                            placeholder="Ej. María"
                                        />
                                        <InputError message={errors.nombre} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="apellidos">
                                            Apellidos
                                        </Label>
                                        <Input
                                            id="apellidos"
                                            name="apellidos"
                                            required
                                            autoComplete="family-name"
                                            placeholder="Ej. Reyes López"
                                        />
                                        <InputError
                                            message={errors.apellidos}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre_usuario">
                                            Nombre usuario
                                        </Label>
                                        <Input
                                            id="nombre_usuario"
                                            name="nombre_usuario"
                                            required
                                            autoComplete="username"
                                            placeholder="Ej. maria.reyes"
                                        />
                                        <InputError
                                            message={errors.nombre_usuario}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="correo">Correo</Label>
                                        <Input
                                            id="correo"
                                            name="correo"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="Ej. maria@medicalimaging.com.mx"
                                        />
                                        <InputError message={errors.correo} />
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cargo_id">Cargo</Label>
                                        <select
                                            id="cargo_id"
                                            name="cargo_id"
                                            required
                                            defaultValue=""
                                            className={selectClassName}
                                        >
                                            <option value="" disabled>
                                                Seleccione un cargo
                                            </option>
                                            {cargos.map((cargo) => (
                                                <option
                                                    key={cargo.id}
                                                    value={cargo.id}
                                                >
                                                    {cargo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.cargo_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="rol_usuario_id">
                                            Rol de usuario
                                        </Label>
                                        <select
                                            id="rol_usuario_id"
                                            name="rol_usuario_id"
                                            required
                                            defaultValue=""
                                            className={selectClassName}
                                        >
                                            <option value="" disabled>
                                                Seleccione un rol
                                            </option>
                                            {roles.map((rol) => (
                                                <option
                                                    key={rol.id}
                                                    value={rol.id}
                                                >
                                                    {rol.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.rol_usuario_id}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Contraseña
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Contraseña"
                                            passwordrules={passwordRules}
                                        />
                                        <InputError
                                            message={errors.password}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirmar contraseña
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
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

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                                    >
                                        {processing
                                            ? 'Creando...'
                                            : 'Crear usuario'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>
            </div>
        </>
    );
}

CrearUsuarios.layout = {
    breadcrumbs: [
        {
            title: 'Crear usuario',
            href: usuariosCreate(),
        },
    ],
};
