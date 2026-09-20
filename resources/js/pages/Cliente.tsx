import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    Copy,
    FileText,
    Headphones,
    Home,
    Mail,
    MapPin,
    MessageCircle,
    Monitor,
    Pencil,
    Send,
    ShieldCheck,
    type LucideIcon,
} from 'lucide-react';
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
import { useClipboard } from '@/hooks/use-clipboard';
import { home } from '@/routes';
import { store as clienteCotisacionStore } from '@/routes/cliente-cotisacion';
import { index as equiposIndex } from '@/routes/equipos';
import { show as moduloShow } from '@/routes/modulos';

type PageProps = {
    equipo: {
        id: number;
        slug: string;
        nombre: string;
        categoria: string | null;
        categoria_slug: string | null;
        imagen: string | null;
    } | null;
    flash?: {
        success?: string | null;
        cotizacion_enviada?: boolean;
        cotizacion_cliente?: string | null;
    };
};

const CONTACT_HERO_IMAGE = `/Imagen/empresa/${encodeURIComponent('ChatGPT Image 20 sept 2026, 01_19_34 p.m..png')}`;
const CONTACT_EMAIL = 'contacto@medicalimaging.com.mx';

const heroHighlights: {
    title: string;
    icon: LucideIcon;
}[] = [
    { title: 'Atención especializada', icon: Headphones },
    { title: 'Respuesta oportuna', icon: Clock3 },
    { title: 'Acompañamiento en todo el proceso', icon: ShieldCheck },
];

export default function Cliente() {
    const { equipo, flash } = usePage<PageProps>().props;
    const [copiedEmail, copyEmail] = useClipboard();
    const cambiarSeleccionHref = equipo?.categoria_slug
        ? equiposIndex.url(equipo.categoria_slug)
        : home();
    const regresarHref = equipo ? moduloShow.url(equipo.slug) : home();
    const whatsappPreview = equipo
        ? `Hola, me interesa solicitar una cotización del siguiente equipo:\nEquipo: ${equipo.categoria ?? 'Equipo médico'}\nModelo: ${equipo.nombre}\nMotivo: Cotización de equipo\n¿Podrían brindarme más información?`
        : 'Hola, me interesa solicitar una cotización.\nMotivo: Cotización de equipo\n¿Podrían brindarme más información?';
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

            <section className="relative overflow-hidden bg-neutral-950">
                <div
                    className={`relative mx-auto grid items-center gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-14 ${CONTENT_WIDTH}`}
                >
                    <div className="relative z-10">
                        <nav
                            aria-label="Breadcrumb"
                            className="flex flex-wrap items-center gap-1.5 text-xs text-white/70 sm:text-sm"
                        >
                            <Link
                                href={home()}
                                className="inline-flex items-center gap-1.5 transition hover:text-white"
                            >
                                <Home className="size-3.5 shrink-0" />
                                Inicio
                            </Link>
                            {equipo?.categoria_slug && equipo.categoria ? (
                                <>
                                    <span aria-hidden="true">›</span>
                                    <Link
                                        href={equiposIndex.url(
                                            equipo.categoria_slug,
                                        )}
                                        className="max-w-[9rem] truncate transition hover:text-white"
                                    >
                                        {equipo.categoria}
                                    </Link>
                                </>
                            ) : null}
                            {equipo ? (
                                <>
                                    <span aria-hidden="true">›</span>
                                    <Link
                                        href={moduloShow.url(equipo.slug)}
                                        className="max-w-[11rem] truncate transition hover:text-white"
                                    >
                                        {equipo.nombre}
                                    </Link>
                                </>
                            ) : null}
                            <span aria-hidden="true">›</span>
                            <span
                                className="font-semibold text-white"
                                aria-current="page"
                            >
                                Contacto
                            </span>
                        </nav>

                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
                            Contacto
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                            Estamos listos para atender tus necesidades en
                            imagenología médica. Elige la forma de contacto que
                            prefieras y cuéntanos cómo podemos ayudarte.
                        </p>

                        <ul className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
                            {heroHighlights.map(({ title, icon: Icon }) => (
                                <li
                                    key={title}
                                    className="flex items-start gap-2.5"
                                >
                                    <span
                                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-white"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        <Icon
                                            className="size-4"
                                            strokeWidth={1.75}
                                        />
                                    </span>
                                    <span className="text-xs font-medium leading-snug text-white sm:text-[13px]">
                                        {title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative min-h-[220px] overflow-hidden sm:min-h-[260px] lg:min-h-[320px]">
                        <div
                            className="pointer-events-none absolute inset-0"
                            aria-hidden="true"
                        >
                            <img
                                src={CONTACT_HERO_IMAGE}
                                alt=""
                                className="absolute inset-0 size-full scale-110 object-cover object-right opacity-50 blur-2xl [mask-image:linear-gradient(to_right,transparent_8%,black_42%)] [-webkit-mask-image:linear-gradient(to_right,transparent_8%,black_42%)]"
                            />
                            <img
                                src={CONTACT_HERO_IMAGE}
                                alt="Resonancia magnética cerebral"
                                className="absolute inset-0 size-full object-cover object-right [mask-image:linear-gradient(to_right,transparent_12%,black_48%)] [-webkit-mask-image:linear-gradient(to_right,transparent_12%,black_48%)]"
                            />
                            <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-neutral-950 from-20% via-neutral-950/75 via-70% to-transparent" />
                        </div>

                        <p className="relative z-10 max-w-[15.5rem] pt-10 text-xl font-semibold leading-snug text-white sm:pt-14 sm:text-2xl lg:pt-16">
                            “Tecnología y servicio al servicio de la vida”
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-white py-6 dark:bg-neutral-950 lg:py-8">
                <div className={`mx-auto ${CONTENT_WIDTH} max-w-6xl`}>
                    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <span
                                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    <FileText
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold tracking-wide text-gray-900 uppercase dark:text-white">
                                        Tu solicitud
                                    </p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        Estás solicitando información sobre:
                                    </p>
                                    <div className="mt-3 flex items-center gap-3">
                                        {equipo?.imagen ? (
                                            <img
                                                src={equipo.imagen}
                                                alt=""
                                                className="size-14 shrink-0 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-muted-foreground dark:bg-neutral-800">
                                                <Monitor className="size-6" />
                                            </span>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {equipo?.categoria ??
                                                    'Equipo médico'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Modelo:{' '}
                                                {equipo?.nombre ??
                                                    'Sin equipo seleccionado'}
                                            </p>
                                            <p
                                                className="text-sm font-medium"
                                                style={{ color: BRAND_COLOR }}
                                            >
                                                Cotización de equipo
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                                <Link
                                    href={cambiarSeleccionHref}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition hover:bg-[#0a7c4a]/5"
                                    style={{
                                        borderColor: BRAND_COLOR,
                                        color: BRAND_COLOR,
                                    }}
                                >
                                    <Pencil className="size-4" />
                                    Cambiar selección
                                </Link>
                                <p className="max-w-xs text-xs leading-relaxed text-muted-foreground lg:text-right">
                                    Si esta información no es correcta, puedes
                                    modificarla o seleccionar otro equipo desde
                                    el menú.
                                </p>
                            </div>
                        </div>
                    </article>

                    <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            ¿Cómo deseas contactarnos?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Puedes elegir una o ambas opciones. Nuestro equipo
                            te atenderá lo antes posible.
                        </p>
                    </div>

                    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
                        <div className="flex items-start gap-3">
                            <span
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                                style={{ color: BRAND_COLOR }}
                            >
                                <FileText className="size-5" strokeWidth={1.75} />
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Envíanos un mensaje
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Completa el formulario y nuestro equipo te
                                    contactará.
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
                                        <>
                                            <input
                                                type="hidden"
                                                name="equipo_modulo_id"
                                                value={equipo.id}
                                            />
                                            <InputError
                                                message={errors.equipo_modulo_id}
                                            />
                                        </>
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

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        <Send className="size-4" />
                                        {processing
                                            ? 'Enviando...'
                                            : 'Enviar solicitud'}
                                    </button>
                                </>
                            )}
                        </Form>
                    </div>

                    <div className="flex flex-col gap-6">
                        <article className="rounded-2xl border border-[#0a7c4a]/25 bg-[#0a7c4a]/5 p-6 dark:border-[#0a7c4a]/30 dark:bg-[#0a7c4a]/10 sm:p-7">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                                    <MessageCircle
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Contáctanos por WhatsApp
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Habla directamente con nuestro equipo.
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-muted-foreground">
                                Se abrirá el número oficial de MIG con un
                                mensaje prellenado con la información de tu
                                solicitud.
                            </p>

                            <div className="mt-4 rounded-xl border border-white/10 bg-white p-4 text-sm leading-relaxed text-gray-700 dark:bg-neutral-950 dark:text-white/80">
                                {whatsappPreview.split('\n').map((line, index) => (
                                    <p key={`${index}-${line}`}>{line}</p>
                                ))}
                            </div>

                            <button
                                type="button"
                                disabled
                                aria-disabled="true"
                                title="WhatsApp no está disponible por el momento"
                                className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white opacity-50"
                            >
                                <MessageCircle className="size-4" />
                                Abrir WhatsApp
                            </button>
                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                WhatsApp no está habilitado por el momento.
                            </p>
                        </article>

                        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-7">
                            <div className="flex items-start gap-3">
                                <span
                                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    <Mail
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        También puedes escribirnos
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Si prefieres, envíanos un correo
                                        directamente.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-neutral-700">
                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="truncate text-sm font-semibold"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    {CONTACT_EMAIL}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void copyEmail(CONTACT_EMAIL);
                                    }}
                                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                                    aria-label="Copiar correo"
                                >
                                    <Copy className="size-4" />
                                    {copiedEmail === CONTACT_EMAIL
                                        ? 'Copiado'
                                        : null}
                                </button>
                            </div>
                        </article>
                    </div>
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
