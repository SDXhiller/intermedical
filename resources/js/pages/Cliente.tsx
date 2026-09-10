import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FileText, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import ClienteCoordenadasModal, {
    formatCoordenadas,
    type Coordenadas,
} from '@/components/cliente-coordenadas-modal';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home } from '@/routes';
import { store as clienteCotisacionStore } from '@/routes/cliente-cotisacion';
import { show as moduloShow } from '@/routes/modulos';

type PageProps = {
    equipo: {
        id: number;
        slug: string;
        nombre: string;
    } | null;
    flash?: {
        success?: string | null;
        cotizacion_enviada?: boolean;
        cotizacion_cliente?: string | null;
    };
};

const HERO_IMAGE = `/Imagen/Body/${encodeURIComponent('ChatGPT Image 28 ago 2026, 02_20_15 p.m..png')}`;

export default function Cliente() {
    const { equipo, flash } = usePage<PageProps>().props;
    const regresarHref = equipo ? moduloShow.url(equipo.slug) : home();
    const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
    const [mapOpen, setMapOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [confirmedCliente, setConfirmedCliente] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (flash?.cotizacion_enviada && flash.cotizacion_cliente) {
            setConfirmedCliente(flash.cotizacion_cliente);
            setSuccessModalOpen(true);
        }
    }, [flash?.cotizacion_enviada, flash?.cotizacion_cliente]);

    const handleAcceptSuccess = () => {
        router.visit(regresarHref);
    };

    const handleSuccessModalChange = (open: boolean) => {
        if (open) {
            setSuccessModalOpen(true);

            return;
        }

        handleAcceptSuccess();
    };

    return (
        <>
            <Head title="Solicitar cotización" />

            <section className="relative h-[250px] overflow-hidden">
                <img
                    src={HERO_IMAGE}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-white/45" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/45 to-white/20" />

                <div
                    className={`relative mx-auto flex h-full ${CONTENT_WIDTH} max-w-6xl items-center py-6`}
                >
                    <div className="max-w-2xl">
                        <p
                            className="text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                            style={{ color: BRAND_COLOR }}
                        >
                            Formulario público
                        </p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Solicitar cotización
                        </h1>
                        <div
                            className="mt-3 h-1 w-14 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-700">
                            Complete sus datos para que nuestro equipo comercial
                            prepare una propuesta personalizada.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-white py-6 dark:bg-neutral-950 lg:py-8">
                <div className={`mx-auto ${CONTENT_WIDTH} max-w-3xl`}>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
                        <div className="flex items-start gap-3">
                            <span
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                                style={{ color: BRAND_COLOR }}
                            >
                                <FileText className="size-5" strokeWidth={1.75} />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Datos del cliente
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Todos los campos son obligatorios.
                                </p>
                            </div>
                        </div>

                        <Form
                            action={clienteCotisacionStore.url()}
                            method="post"
                            resetOnSuccess={[
                                'cliente',
                                'calle',
                                'numero',
                                'colonia',
                                'cp',
                                'ciudad',
                                'contacto',
                                'area',
                                'telefono',
                                'correo',
                            ]}
                            onSuccess={() => setCoordenadas(null)}
                            className="mt-8 space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {equipo && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="equipo_solicitado">
                                                Equipo solicitado
                                            </Label>
                                            <Input
                                                id="equipo_solicitado"
                                                value={equipo.nombre}
                                                readOnly
                                                tabIndex={-1}
                                                className="cursor-default bg-gray-50 text-gray-900 dark:bg-neutral-800 dark:text-white"
                                            />
                                            <input
                                                type="hidden"
                                                name="equipo_modulo_id"
                                                value={equipo.id}
                                            />
                                            <InputError
                                                message={errors.equipo_modulo_id}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="cliente">Cliente</Label>
                                        <Input
                                            id="cliente"
                                            name="cliente"
                                            required
                                            placeholder="Nombre del hospital, clínica o empresa"
                                        />
                                        <InputError message={errors.cliente} />
                                    </div>

                                    <fieldset className="space-y-5 rounded-xl border border-gray-200 p-4 dark:border-neutral-800 sm:p-5">
                                        <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">
                                            Dirección
                                        </legend>

                                        <div className="grid gap-2 sm:grid-cols-[1fr_7rem] sm:gap-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="calle">Calle</Label>
                                                <Input
                                                    id="calle"
                                                    name="calle"
                                                    required
                                                    placeholder="Av. Insurgentes Sur"
                                                />
                                                <InputError message={errors.calle} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="numero">Número</Label>
                                                <Input
                                                    id="numero"
                                                    name="numero"
                                                    required
                                                    placeholder="1234"
                                                />
                                                <InputError message={errors.numero} />
                                            </div>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="colonia">Colonia</Label>
                                                <Input
                                                    id="colonia"
                                                    name="colonia"
                                                    required
                                                    placeholder="Del Valle"
                                                />
                                                <InputError message={errors.colonia} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="cp">CP</Label>
                                                <Input
                                                    id="cp"
                                                    name="cp"
                                                    required
                                                    placeholder="03100"
                                                />
                                                <InputError message={errors.cp} />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="ciudad">Ciudad</Label>
                                            <Input
                                                id="ciudad"
                                                name="ciudad"
                                                required
                                                placeholder="Ciudad de México"
                                            />
                                            <InputError message={errors.ciudad} />
                                        </div>

                                        <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-neutral-800">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Ubicación exacta
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Marque el punto exacto
                                                        en el mapa para
                                                        facilitar la entrega.
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMapOpen(true)
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition hover:bg-[#0a7c4a]/5"
                                                    style={{
                                                        borderColor:
                                                            BRAND_COLOR,
                                                        color: BRAND_COLOR,
                                                    }}
                                                >
                                                    <MapPin className="size-4" />
                                                    Ingresar coordenadas
                                                </button>
                                            </div>

                                            {coordenadas && (
                                                <p className="rounded-lg bg-[#0a7c4a]/10 px-3 py-2 text-sm text-[#0a7c4a]">
                                                    Coordenadas registradas:{' '}
                                                    {formatCoordenadas(
                                                        coordenadas,
                                                    )}
                                                </p>
                                            )}

                                            <input
                                                type="hidden"
                                                name="latitud"
                                                value={
                                                    coordenadas?.latitud ?? ''
                                                }
                                            />
                                            <input
                                                type="hidden"
                                                name="longitud"
                                                value={
                                                    coordenadas?.longitud ?? ''
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.latitud ??
                                                    errors.longitud
                                                }
                                            />
                                        </div>
                                    </fieldset>

                                    <ClienteCoordenadasModal
                                        open={mapOpen}
                                        onOpenChange={setMapOpen}
                                        value={coordenadas}
                                        onConfirm={setCoordenadas}
                                    />

                                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="contacto">
                                                Contacto
                                            </Label>
                                            <Input
                                                id="contacto"
                                                name="contacto"
                                                required
                                                placeholder="Nombre de la persona de contacto"
                                            />
                                            <InputError
                                                message={errors.contacto}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="area">Área</Label>
                                            <Input
                                                id="area"
                                                name="area"
                                                required
                                                placeholder="Ej. Ingeniería clínica, Compras"
                                            />
                                            <InputError message={errors.area} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="telefono">
                                                Teléfono
                                            </Label>
                                            <Input
                                                id="telefono"
                                                name="telefono"
                                                type="tel"
                                                required
                                                placeholder="55 1234 5678"
                                            />
                                            <InputError
                                                message={errors.telefono}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="correo">Correo</Label>
                                            <Input
                                                id="correo"
                                                name="correo"
                                                type="email"
                                                required
                                                placeholder="correo@empresa.com"
                                            />
                                            <InputError message={errors.correo} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <Link
                                            href={regresarHref}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#0a7c4a]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white sm:w-auto"
                                        >
                                            <ArrowLeft className="size-4" />
                                            Regresar
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                            style={{
                                                backgroundColor: BRAND_COLOR,
                                            }}
                                        >
                                            {processing
                                                ? 'Enviando...'
                                                : 'Enviar solicitud'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </section>

            <Dialog open={successModalOpen} onOpenChange={handleSuccessModalChange}>
                <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg">
                    <div className="bg-[#0a7c4a]/10 px-6 py-8 text-center">
                        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#0a7c4a]/15 text-[#0a7c4a]">
                            <CheckCircle2 className="size-8" strokeWidth={1.75} />
                        </span>
                        <DialogTitle className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                            Solicitud enviada con éxito
                        </DialogTitle>
                    </div>

                    <div className="space-y-4 px-6 py-6">
                        <DialogDescription asChild>
                            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                                <p>
                                    Estimado{' '}
                                    <span className="font-semibold text-foreground">
                                        {confirmedCliente}
                                    </span>
                                    , hemos recibido su solicitud de cotización
                                    correctamente.
                                </p>
                                <p>
                                    Nuestro equipo comercial de{' '}
                                    <span className="font-semibold text-foreground">
                                        Medical Imaging Group
                                    </span>{' '}
                                    se pondrá en contacto con usted en un plazo
                                    de{' '}
                                    <span className="font-semibold text-foreground">
                                        24 a 48 horas hábiles
                                    </span>
                                    .
                                </p>
                                <p>
                                    Gracias por confiar en nosotros para sus
                                    soluciones de imagenología médica.
                                </p>
                            </div>
                        </DialogDescription>

                        <DialogFooter className="pt-2 sm:justify-center">
                            <Button
                                type="button"
                                onClick={handleAcceptSuccess}
                                className="w-full bg-[#0a7c4a] text-white hover:bg-[#0a7c4a]/90 sm:w-auto"
                            >
                                Aceptar
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
