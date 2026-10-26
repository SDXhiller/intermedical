
import { Form, Head, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Check,
    ChevronLeft,
    Delete,
    Keyboard,
    LockKeyhole,
    RotateCcw,
    ShieldCheck,
    X,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import UsuarioController from '@/actions/App/Http/Controllers/Admin/UsuarioController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create as usuariosCreate } from '@/routes/admin/usuarios';

/* =====================================================
   TIPOS
===================================================== */

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

type Direccion =
    | 'ArrowUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight';

const MIN_PATRON = 5;
const MAX_PATRON = 10;

const selectClassName =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] dark:[color-scheme:dark]';

const direcciones = [
    {
        value: 'ArrowUp',
        label: 'Arriba',
        icon: ArrowUp,
    },
    {
        value: 'ArrowLeft',
        label: 'Izquierda',
        icon: ArrowLeft,
    },
    {
        value: 'ArrowDown',
        label: 'Abajo',
        icon: ArrowDown,
    },
    {
        value: 'ArrowRight',
        label: 'Derecha',
        icon: ArrowRight,
    },
] as const;

function obtenerIcono(direccion: Direccion) {
    return (
        direcciones.find(
            (item) => item.value === direccion,
        )?.icon ?? ArrowUp
    );
}

/* =====================================================
   COMPONENTE PRINCIPAL
===================================================== */

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

    /* =====================================
       ESTADOS DEL PATRÓN
    ===================================== */

    const [modalPatronAbierto, setModalPatronAbierto] =
        useState(false);

    const [patronTemporal, setPatronTemporal] =
        useState<Direccion[]>([]);

    const [patronConfirmado, setPatronConfirmado] =
        useState<Direccion[]>([]);

    const [errorPatron, setErrorPatron] =
        useState('');

    const patronCompleto =
        patronTemporal.length >= MIN_PATRON &&
        patronTemporal.length <= MAX_PATRON;

    /* =====================================
       ABRIR MODAL
    ===================================== */

    const abrirModalPatron = () => {
        setPatronTemporal([...patronConfirmado]);
        setErrorPatron('');
        setModalPatronAbierto(true);
    };

    /* =====================================
       AGREGAR MOVIMIENTO
    ===================================== */

    const agregarDireccion = useCallback(
        (direccion: Direccion) => {
            setPatronTemporal((actual) => {
                if (actual.length >= MAX_PATRON) {
                    return actual;
                }

                return [...actual, direccion];
            });

            setErrorPatron('');
        },
        [],
    );

    /* =====================================
       DETECTAR FLECHAS DEL TECLADO
    ===================================== */

    useEffect(() => {
        if (!modalPatronAbierto) {
            return;
        }

        const manejarTeclado = (
            event: KeyboardEvent,
        ) => {
            const teclasValidas: Direccion[] = [
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
            ];

            if (
                teclasValidas.includes(
                    event.key as Direccion,
                )
            ) {
                event.preventDefault();

                if (event.repeat) {
                    return;
                }

                agregarDireccion(
                    event.key as Direccion,
                );
            }
        };

        window.addEventListener(
            'keydown',
            manejarTeclado,
        );

        return () => {
            window.removeEventListener(
                'keydown',
                manejarTeclado,
            );
        };
    }, [
        modalPatronAbierto,
        agregarDireccion,
    ]);

    /* =====================================
       ELIMINAR ÚLTIMO MOVIMIENTO
    ===================================== */

    const eliminarUltimoMovimiento = () => {
        setPatronTemporal((actual) =>
            actual.slice(0, -1),
        );

        setErrorPatron('');
    };

    /* =====================================
       LIMPIAR PATRÓN
    ===================================== */

    const limpiarPatron = () => {
        setPatronTemporal([]);
        setErrorPatron('');
    };

    /* =====================================
       CONFIRMAR PATRÓN
    ===================================== */

    const confirmarPatron = () => {
        if (!patronCompleto) {
            setErrorPatron(
                'El patrón debe contener entre 5 y 10 movimientos.',
            );
            return;
        }

        setPatronConfirmado([...patronTemporal]);
        setErrorPatron('');
        setModalPatronAbierto(false);
    };

    return (
        <>
            <Head title="Crear usuario" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
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
                        Complete los datos personales, el
                        cargo, el rol y confirme la contraseña
                        antes de crear el usuario.
                    </p>

                    <Form
                        {...UsuarioController.store.form()}
                        resetOnSuccess
                        onSuccess={() => {
                            setPatronConfirmado([]);
                            setPatronTemporal([]);
                        }}
                        className="mt-6 space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* =====================================
                                    DATOS PERSONALES
                                ===================================== */}

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre">
                                            Nombre
                                        </Label>

                                        <Input
                                            id="nombre"
                                            name="nombre"
                                            required
                                            autoComplete="given-name"
                                            placeholder="Ej. María"
                                        />

                                        <InputError
                                            message={errors.nombre}
                                        />
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
                                            message={
                                                errors.nombre_usuario
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="correo">
                                            Correo
                                        </Label>

                                        <Input
                                            id="correo"
                                            name="correo"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="Ej. maria@medicalimaging.com.mx"
                                        />

                                        <InputError
                                            message={errors.correo}
                                        />
                                    </div>
                                </div>

                                {/* =====================================
                                    CARGO Y ROL
                                ===================================== */}

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cargo_id">
                                            Cargo
                                        </Label>

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

                                        <InputError
                                            message={errors.cargo_id}
                                        />
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
                                            message={
                                                errors.rol_usuario_id
                                            }
                                        />
                                    </div>
                                </div>

                                {/* =====================================
                                    CONTRASEÑAS
                                ===================================== */}

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
                                            passwordrules={
                                                passwordRules
                                            }
                                            generate
                                            confirmationId="password_confirmation"
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
                                            passwordrules={
                                                passwordRules
                                            }
                                        />

                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                </div>

                                {/* =====================================
                                    PATRÓN DE SEGURIDAD
                                ===================================== */}

                                <div className="rounded-xl border border-border bg-muted/20 p-5 sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#006635]/10 text-[#0a7c4a] dark:text-[#4cc185]">
                                                <ShieldCheck className="size-5" />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    Patrón de seguridad
                                                </h3>

                                                <p className="mt-1 max-w-lg text-xs leading-relaxed text-muted-foreground">
                                                    Configura una secuencia
                                                    personalizada utilizando
                                                    las flechas del teclado.
                                                    Debe contener entre 5 y
                                                    10 movimientos.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={abrirModalPatron}
                                            className="shrink-0 gap-2"
                                        >
                                            <Keyboard className="size-4" />

                                            {patronConfirmado.length > 0
                                                ? 'Modificar patrón'
                                                : 'Configurar patrón'}
                                        </Button>
                                    </div>

                                    {patronConfirmado.map((direccion, index) => (
                                        <input
                                            key={`${direccion}-${index}`}
                                            type="hidden"
                                            name={`patron[${index}]`}
                                            value={direccion}
                                        />
                                    ))}

                                    {patronConfirmado.length > 0 ? (
                                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#006635]/20 bg-[#006635]/10 px-3 py-1.5 text-xs font-semibold text-[#0a7c4a] dark:text-[#4cc185]">
                                                <Check className="size-3.5" />
                                                Patrón configurado
                                            </span>

                                            {patronConfirmado.map(
                                                (direccion, index) => {
                                                    const Icono =
                                                        direcciones.find(
                                                            (item) =>
                                                                item.value ===
                                                                direccion,
                                                        )?.icon ?? ArrowUp;

                                                    return (
                                                        <span
                                                            key={`${direccion}-${index}`}
                                                            className="inline-flex size-8 items-center justify-center rounded-full bg-[#006635]/15 text-[#0a7c4a]"
                                                        >
                                                            <Icono className="size-4" />
                                                        </span>
                                                    );
                                                },
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                                            <LockKeyhole className="size-4" />
                                            Aún no se ha configurado un patrón.
                                        </div>
                                    )}

                                    <InputError
                                        className="mt-3"
                                        message={errors.patron}
                                    />
                                </div>

                                {/* =====================================
                                    BOTÓN CREAR USUARIO
                                ===================================== */}

                                <div className="flex justify-end border-t border-border pt-5">
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            patronConfirmado.length < MIN_PATRON
                                        }
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

            {/* =====================================
                MODAL DE PATRÓN DE SEGURIDAD
            ===================================== */}

            <Dialog
                open={modalPatronAbierto}
                onOpenChange={setModalPatronAbierto}
            >
                <DialogContent className="w-[calc(100%-2rem)] max-w-lg overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-[#006635]/10 text-[#0a7c4a] dark:text-[#4cc185]">
                            <Keyboard className="size-6" />
                        </div>

                        <DialogTitle className="text-xl">
                            Configurar patrón de seguridad
                        </DialogTitle>

                        <DialogDescription className="leading-relaxed">
                            Utiliza las flechas del teclado o
                            presiona los botones para crear una
                            secuencia de entre 5 y 10 movimientos.
                        </DialogDescription>
                    </DialogHeader>

                    {/* =====================================
                        CONTADOR DE MOVIMIENTOS
                    ===================================== */}

                    <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">
                                Secuencia registrada
                            </span>

                            <span
                                className={`text-sm font-bold ${
                                    patronCompleto
                                        ? 'text-[#0a7c4a] dark:text-[#4cc185]'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {patronTemporal.length} / {MAX_PATRON}
                            </span>
                        </div>

                        {/* Barra de progreso */}

                        <div className="mt-3 grid grid-cols-10 gap-1.5">
                            {Array.from(
                                { length: MAX_PATRON },
                                (_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 rounded-full transition-colors ${
                                            index <
                                            patronTemporal.length
                                                ? 'bg-[#0a7c4a]'
                                                : 'bg-border'
                                        }`}
                                    />
                                ),
                            )}
                        </div>

                        {/* Vista previa de flechas */}

                        <div className="mt-5 flex min-h-14 flex-wrap items-center justify-center gap-2">
                            {patronTemporal.length === 0 ? (
                                <span className="text-center text-xs text-muted-foreground">
                                    Presiona una flecha para comenzar
                                </span>
                            ) : (
                                patronTemporal.map(
                                    (direccion, index) => {
                                        const Icon =
                                            obtenerIcono(
                                                direccion,
                                            );

                                        return (
                                            <div
                                                key={index}
                                                className="flex size-10 items-center justify-center rounded-lg border border-[#006635]/25 bg-[#006635]/10 text-[#0a7c4a] dark:text-[#4cc185]"
                                                title={`Movimiento ${
                                                    index + 1
                                                }`}
                                            >
                                                <Icon className="size-5" />
                                            </div>
                                        );
                                    },
                                )
                            )}
                        </div>

                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            {patronTemporal.length < MIN_PATRON
                                ? `Faltan ${
                                      MIN_PATRON -
                                      patronTemporal.length
                                  } movimientos para alcanzar el mínimo.`
                                : patronTemporal.length === MAX_PATRON
                                  ? 'Has alcanzado el máximo de movimientos.'
                                  : 'Secuencia válida. Puedes agregar más movimientos.'}
                        </p>
                    </div>

                    {/* =====================================
                        TECLADO DIRECCIONAL
                    ===================================== */}

                    <div className="py-2">
                        <p className="mb-4 text-center text-sm font-medium text-foreground">
                            Control direccional
                        </p>

                        <div className="mx-auto grid w-fit grid-cols-3 gap-2">
                            <div />

                            <button
                                type="button"
                                onClick={() =>
                                    agregarDireccion('ArrowUp')
                                }
                                disabled={
                                    patronTemporal.length >=
                                    MAX_PATRON
                                }
                                aria-label="Arriba"
                                className="flex size-16 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground transition hover:border-[#006635] hover:bg-[#006635]/10 hover:text-[#0a7c4a] disabled:opacity-40 dark:hover:text-[#4cc185]"
                            >
                                <ArrowUp className="size-7" />
                            </button>

                            <div />

                            <button
                                type="button"
                                onClick={() =>
                                    agregarDireccion('ArrowLeft')
                                }
                                disabled={
                                    patronTemporal.length >=
                                    MAX_PATRON
                                }
                                aria-label="Izquierda"
                                className="flex size-16 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground transition hover:border-[#006635] hover:bg-[#006635]/10 hover:text-[#0a7c4a] disabled:opacity-40 dark:hover:text-[#4cc185]"
                            >
                                <ArrowLeft className="size-7" />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    agregarDireccion('ArrowDown')
                                }
                                disabled={
                                    patronTemporal.length >=
                                    MAX_PATRON
                                }
                                aria-label="Abajo"
                                className="flex size-16 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground transition hover:border-[#006635] hover:bg-[#006635]/10 hover:text-[#0a7c4a] disabled:opacity-40 dark:hover:text-[#4cc185]"
                            >
                                <ArrowDown className="size-7" />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    agregarDireccion('ArrowRight')
                                }
                                disabled={
                                    patronTemporal.length >=
                                    MAX_PATRON
                                }
                                aria-label="Derecha"
                                className="flex size-16 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground transition hover:border-[#006635] hover:bg-[#006635]/10 hover:text-[#0a7c4a] disabled:opacity-40 dark:hover:text-[#4cc185]"
                            >
                                <ArrowRight className="size-7" />
                            </button>
                        </div>

                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            También puedes utilizar las flechas físicas
                            de tu teclado.
                        </p>
                    </div>

                    {/* =====================================
                        HERRAMIENTAS DE EDICIÓN
                    ===================================== */}

                    <div className="flex flex-wrap justify-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                patronTemporal.length === 0
                            }
                            onClick={eliminarUltimoMovimiento}
                            className="gap-2"
                        >
                            <Delete className="size-4" />
                            Borrar último
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                patronTemporal.length === 0
                            }
                            onClick={limpiarPatron}
                            className="gap-2"
                        >
                            <RotateCcw className="size-4" />
                            Reiniciar
                        </Button>
                    </div>

                    {/* =====================================
                        VALIDACIÓN
                    ===================================== */}

                    {errorPatron && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-600 dark:text-red-400"
                        >
                            {errorPatron}
                        </p>
                    )}

                    {/* =====================================
                        BOTONES DEL MODAL
                    ===================================== */}

                    <div className="mt-3 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setModalPatronAbierto(false)
                            }
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            disabled={!patronCompleto}
                            onClick={confirmarPatron}
                            className="gap-2 bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90"
                        >
                            <Check className="size-4" />
                            Confirmar patrón
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
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
