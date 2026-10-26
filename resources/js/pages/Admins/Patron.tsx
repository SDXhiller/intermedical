import { Form, Head, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes/admin';
import { store } from '@/routes/admin/patron';

type Direccion = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

const MIN_PATRON = 5;
const MAX_PATRON = 10;
const ESPERA_ENVIO = 400;

const direcciones: {
    value: Direccion;
    label: string;
    icon: typeof ArrowUp;
}[] = [
    { value: 'ArrowUp', label: 'Arriba', icon: ArrowUp },
    { value: 'ArrowLeft', label: 'Izquierda', icon: ArrowLeft },
    { value: 'ArrowDown', label: 'Abajo', icon: ArrowDown },
    { value: 'ArrowRight', label: 'Derecha', icon: ArrowRight },
];

export default function Patron() {
    const { flash } = usePage<{
        flash?: { error?: string | null };
    }>().props;
    const [enviando, setEnviando] = useState(false);
    const patronRef = useRef<Direccion[]>([]);
    const enviandoRef = useRef(false);
    const enviadoRef = useRef('');
    const temporizadorRef = useRef<number | null>(null);

    const enviar = useCallback(() => {
        if (enviandoRef.current) {
            return;
        }

        const siguiente = patronRef.current;

        if (siguiente.length < MIN_PATRON) {
            return;
        }

        const firma = siguiente.join('|');

        if (enviadoRef.current === firma) {
            return;
        }

        if (temporizadorRef.current !== null) {
            window.clearTimeout(temporizadorRef.current);
            temporizadorRef.current = null;
        }

        enviandoRef.current = true;
        setEnviando(true);

        router.post(
            store.url(),
            { patron: siguiente },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    enviandoRef.current = false;
                    setEnviando(false);
                    enviadoRef.current = firma;

                    if (patronRef.current.join('|') !== firma) {
                        enviar();
                    }
                },
            },
        );
    }, []);

    const programarEnvio = useCallback(() => {
        if (temporizadorRef.current !== null) {
            window.clearTimeout(temporizadorRef.current);
        }

        const espera =
            patronRef.current.length >= MAX_PATRON ? 0 : ESPERA_ENVIO;

        temporizadorRef.current = window.setTimeout(() => {
            temporizadorRef.current = null;
            enviar();
        }, espera);
    }, [enviar]);

    const agregarDireccion = useCallback(
        (direccion: Direccion) => {
            if (patronRef.current.length >= MAX_PATRON) {
                return;
            }

            patronRef.current = [...patronRef.current, direccion];

            if (patronRef.current.length >= MIN_PATRON) {
                programarEnvio();
            }
        },
        [programarEnvio],
    );

    useEffect(() => {
        return () => {
            if (temporizadorRef.current !== null) {
                window.clearTimeout(temporizadorRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const manejarTeclado = (event: KeyboardEvent) => {
            if (
                !direcciones.some((item) => item.value === event.key) ||
                event.repeat
            ) {
                return;
            }

            event.preventDefault();
            agregarDireccion(event.key as Direccion);
        };

        window.addEventListener('keydown', manejarTeclado);

        return () => window.removeEventListener('keydown', manejarTeclado);
    }, [agregarDireccion]);

    return (
        <>
            <Head title="Patrón de seguridad" />

            <div className="flex flex-col gap-5">
                {flash?.error && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400"
                    >
                        {flash.error}
                    </p>
                )}

                <p className="text-center text-sm text-muted-foreground">
                    Ingrese la secuencia completa. Al terminarla, la cuenta se
                    desbloquea sola.
                </p>

                <div className="grid grid-cols-4 gap-2">
                    {direcciones.map(({ value, label, icon: Icono }) => (
                        <Button
                            key={value}
                            type="button"
                            variant="outline"
                            aria-label={label}
                            onClick={() => agregarDireccion(value)}
                            className="h-11"
                        >
                            <Icono className="size-4" />
                        </Button>
                    ))}
                </div>

                {enviando && (
                    <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Spinner />
                        Verificando patrón
                    </p>
                )}

                <Form action={logout.url()} method="post">
                    {({ processing }) => (
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                            disabled={processing}
                            data-test="cancelar-patron"
                        >
                            {processing && <Spinner />}
                            Cancelar
                        </Button>
                    )}
                </Form>
            </div>
        </>
    );
}

Patron.layout = {
    title: 'Desbloquear cuenta',
    description: 'La sesión ya inició. Confirme el patrón para continuar.',
};
