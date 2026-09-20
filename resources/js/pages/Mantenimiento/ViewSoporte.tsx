import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Check,
    Copy,
    FileUp,
    Home,
    Info,
    Lock,
    Mail,
    MessageCircle,
    Monitor,
    Send,
    Wrench,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { useClipboard } from '@/hooks/use-clipboard';
import { home, mantenimiento } from '@/routes';
import { index as equiposIndex } from '@/routes/equipos';
import { soporte } from '@/routes/mantenimiento';

type ServicioItem = {
    slug: string;
    title: string;
};

type ModalidadItem = {
    slug: string;
    nombre: string;
    imagen: string;
};

type EquipoItem = {
    slug: string;
    nombre: string;
    marca: string;
    imagen: string;
};

type ViewSoporteProps = {
    servicio: ServicioItem;
    servicios: ServicioItem[];
    modalidad: ModalidadItem;
    equipos: EquipoItem[];
    equipo: EquipoItem | null;
};

const FALLBACK_HERO_IMAGE = '/Imagen/Body/Body.png';
const CONTACT_EMAIL = 'contacto@medicalimaging.com.mx';

const mexicanStates = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Coahuila',
    'Colima',
    'Durango',
    'Estado de México',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas',
] as const;

function visitSoporte(params: {
    servicio: string;
    modalidad: string;
    equipo?: string | null;
}): void {
    router.get(
        soporte.url({
            query: {
                servicio: params.servicio,
                modalidad: params.modalidad,
                ...(params.equipo ? { equipo: params.equipo } : {}),
            },
        }),
        {},
        { preserveScroll: true },
    );
}

export default function ViewSoporte({
    servicio,
    servicios,
    modalidad,
    equipos,
    equipo,
}: ViewSoporteProps) {
    const [copiedEmail, copyEmail] = useClipboard();
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
    const [equipoDialogOpen, setEquipoDialogOpen] = useState(false);
    const [descripcion, setDescripcion] = useState('');
    const heroImage =
        equipo?.imagen || modalidad.imagen || FALLBACK_HERO_IMAGE;

    const whatsappPreview = useMemo(() => {
        return [
            'Hola, me gustaría solicitar soporte técnico.',
            '',
            `Servicio: ${servicio.title}`,
            `Modalidad: ${modalidad.nombre}`,
            `Equipo: ${equipo ? `${equipo.nombre} (${equipo.marca})` : 'Por seleccionar'}`,
            `Descripción: ${descripcion.trim() !== '' ? descripcion.trim() : '[Puedes agregar más detalles]'}`,
            '',
            '¿Podrían brindarme más información?',
        ].join('\n');
    }, [descripcion, equipo, modalidad.nombre, servicio.title]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (
        <>
            <Head title="Solicitar soporte técnico" />

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
                            <span aria-hidden="true">›</span>
                            <Link
                                href={mantenimiento()}
                                className="transition hover:text-white"
                            >
                                Servicios
                            </Link>
                            <span aria-hidden="true">›</span>
                            <span className="max-w-[12rem] truncate">
                                {servicio.title}
                            </span>
                            <span aria-hidden="true">›</span>
                            <span
                                className="font-semibold text-white"
                                aria-current="page"
                            >
                                Contacto
                            </span>
                        </nav>

                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
                            Solicitar soporte técnico
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                            Completa la información de tu equipo y cuéntanos el
                            problema. Nuestro equipo te contactará a la
                            brevedad.
                        </p>
                    </div>

                    <div className="relative min-h-[220px] overflow-hidden sm:min-h-[260px] lg:min-h-[320px]">
                        <div
                            className="pointer-events-none absolute inset-0"
                            aria-hidden="true"
                        >
                            <img
                                src={heroImage}
                                alt=""
                                className="absolute inset-0 size-full scale-110 object-contain object-right opacity-50 blur-2xl [mask-image:linear-gradient(to_right,transparent_8%,black_42%)] [-webkit-mask-image:linear-gradient(to_right,transparent_8%,black_42%)]"
                            />
                            <img
                                src={heroImage}
                                alt={equipo?.nombre ?? modalidad.nombre}
                                className="absolute inset-0 size-full object-contain object-right [mask-image:linear-gradient(to_right,transparent_12%,black_48%)] [-webkit-mask-image:linear-gradient(to_right,transparent_12%,black_48%)]"
                            />
                            <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-neutral-950 from-20% via-neutral-950/75 via-70% to-transparent" />
                        </div>

                        <div className="relative z-10 max-w-[16rem] pt-10 sm:pt-14 lg:pt-16">
                            <p className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                                “Tu equipo en las mejores manos”
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-white/75">
                                Soporte especializado en todo el país
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-6 dark:bg-neutral-950 lg:py-8">
                <div className={`mx-auto ${CONTENT_WIDTH} max-w-6xl`}>
                    <div className="grid gap-3 lg:grid-cols-3">
                        <article className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    <Wrench
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        Servicio seleccionado
                                    </p>
                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                        {servicio.title}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0 rounded-full"
                                onClick={() => setServiceDialogOpen(true)}
                            >
                                Cambiar servicio
                            </Button>
                        </article>

                        <article className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    <Activity
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        Modalidad
                                    </p>
                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                        {modalidad.nombre}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-muted-foreground dark:border-neutral-700">
                                <Lock className="size-3" />
                                Fija
                            </span>
                        </article>

                        <article className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    {equipo?.imagen ? (
                                        <img
                                            src={equipo.imagen}
                                            alt=""
                                            className="size-full object-contain p-1"
                                        />
                                    ) : (
                                        <Monitor className="size-5 text-muted-foreground" />
                                    )}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        Equipo / Sub equipo
                                    </p>
                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                        {equipo?.nombre ?? 'Sin seleccionar'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0 rounded-full"
                                disabled={equipos.length === 0}
                                onClick={() => setEquipoDialogOpen(true)}
                            >
                                Cambiar equipo
                            </Button>
                        </article>
                    </div>

                    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
                        >
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <span
                                    className="flex size-6 items-center justify-center rounded-full text-xs text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    1
                                </span>
                                Información del equipo
                            </h2>

                            <div className="mt-5 grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="modalidad">
                                        Tipo de equipo (Modalidad) *
                                    </Label>
                                    <Input
                                        id="modalidad"
                                        value={modalidad.nombre}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label htmlFor="sub-equipo">
                                            Equipo / Sub equipo *
                                        </Label>
                                        <Link
                                            href={equiposIndex.url(
                                                modalidad.slug,
                                            )}
                                            className="text-xs font-semibold"
                                            style={{ color: BRAND_COLOR }}
                                        >
                                            Ver sub equipos
                                        </Link>
                                    </div>
                                    <Select
                                        value={equipo?.slug}
                                        onValueChange={(slug) =>
                                            visitSoporte({
                                                servicio: servicio.slug,
                                                modalidad: modalidad.slug,
                                                equipo: slug,
                                            })
                                        }
                                        disabled={equipos.length === 0}
                                    >
                                        <SelectTrigger
                                            id="sub-equipo"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Selecciona un sub equipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipos.map((item) => (
                                                <SelectItem
                                                    key={item.slug}
                                                    value={item.slug}
                                                >
                                                    {item.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="marca">Marca *</Label>
                                        <Input
                                            id="marca"
                                            value={equipo?.marca ?? ''}
                                            placeholder="Se completa al elegir el sub equipo"
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="modelo">Modelo *</Label>
                                        <Input
                                            id="modelo"
                                            value={equipo?.nombre ?? ''}
                                            placeholder="Se completa al elegir el sub equipo"
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <span
                                    className="flex size-6 items-center justify-center rounded-full text-xs text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    2
                                </span>
                                Información del cliente
                            </h2>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="nombre">
                                        Nombre completo *
                                    </Label>
                                    <Input
                                        id="nombre"
                                        name="nombre"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="empresa">
                                        Empresa (opcional)
                                    </Label>
                                    <Input
                                        id="empresa"
                                        name="empresa"
                                        placeholder="Nombre de la empresa"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input
                                        id="telefono"
                                        name="telefono"
                                        type="tel"
                                        placeholder="771 123 4567"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="correo">
                                        Correo electrónico *
                                    </Label>
                                    <Input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                        placeholder="tucorreo@ejemplo.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="estado">
                                        Estado / Ciudad
                                    </Label>
                                    <Select>
                                        <SelectTrigger
                                            id="estado"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Selecciona una opción" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mexicanStates.map((state) => (
                                                <SelectItem
                                                    key={state}
                                                    value={state}
                                                >
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ubicacion">
                                        Ubicación (opcional)
                                    </Label>
                                    <Input
                                        id="ubicacion"
                                        name="ubicacion"
                                        placeholder="Colonia, calle, número..."
                                    />
                                </div>
                            </div>

                            <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <span
                                    className="flex size-6 items-center justify-center rounded-full text-xs text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    3
                                </span>
                                Detalles del problema
                            </h2>

                            <div className="mt-5 grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="descripcion">
                                        Descripción de la falla *
                                    </Label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        rows={4}
                                        value={descripcion}
                                        onChange={(event) =>
                                            setDescripcion(event.target.value)
                                        }
                                        placeholder="Describe el problema que presenta el equipo..."
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="archivos">
                                        Fotografías o documentos (opcional)
                                    </Label>
                                    <label
                                        htmlFor="archivos"
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-neutral-700"
                                    >
                                        <FileUp className="size-6 text-muted-foreground" />
                                        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Arrastra archivos aquí o selecciona
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Puedes subir imágenes, videos o
                                            documentos (PDF, JPG, PNG, MP4)
                                        </p>
                                        <span
                                            className="mt-3 inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold"
                                            style={{
                                                borderColor: BRAND_COLOR,
                                                color: BRAND_COLOR,
                                            }}
                                        >
                                            Seleccionar archivos
                                        </span>
                                    </label>
                                    <input
                                        id="archivos"
                                        type="file"
                                        multiple
                                        className="sr-only"
                                        disabled
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled
                                aria-disabled="true"
                                title="El envío del formulario no está habilitado por el momento"
                                className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white opacity-60"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                <Send className="size-4" />
                                Enviar solicitud
                            </button>
                            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                                <Lock className="size-3.5" />
                                El formulario aún no está conectado. Tus datos
                                no se enviarán por ahora.
                            </p>
                        </form>

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
                                            2. Contactar por WhatsApp
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Habla directamente con nuestro
                                            equipo de soporte técnico. El
                                            mensaje ya incluye la información de
                                            tu solicitud.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-white/10 bg-white p-4 text-sm leading-relaxed text-gray-700 dark:bg-neutral-950 dark:text-white/80">
                                    {whatsappPreview
                                        .split('\n')
                                        .map((line, index) => (
                                            <p key={`${index}-${line}`}>
                                                {line || '\u00A0'}
                                            </p>
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
                                            3. Contactar por correo electrónico
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            También puedes enviarnos un correo
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

                            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-7">
                                <div className="flex items-start gap-3">
                                    <span
                                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                                        style={{ color: BRAND_COLOR }}
                                    >
                                        <Info
                                            className="size-5"
                                            strokeWidth={1.75}
                                        />
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Información adicional
                                    </h3>
                                </div>
                                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <Check
                                            className="mt-0.5 size-4 shrink-0"
                                            style={{ color: BRAND_COLOR }}
                                        />
                                        Nuestro equipo revisará tu solicitud y
                                        te contactará a la brevedad.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check
                                            className="mt-0.5 size-4 shrink-0"
                                            style={{ color: BRAND_COLOR }}
                                        />
                                        El servicio y el sub equipo se pueden
                                        cambiar en esta página.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check
                                            className="mt-0.5 size-4 shrink-0"
                                            style={{ color: BRAND_COLOR }}
                                        />
                                        La modalidad queda fija según el
                                        registro de equipos.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check
                                            className="mt-0.5 size-4 shrink-0"
                                            style={{ color: BRAND_COLOR }}
                                        />
                                        Soporte en todo el país.
                                    </li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <Dialog
                open={serviceDialogOpen}
                onOpenChange={setServiceDialogOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cambiar servicio</DialogTitle>
                        <DialogDescription>
                            Elige el tipo de soporte que necesitas. La
                            modalidad no se modifica.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        {servicios.map((item) => (
                            <button
                                key={item.slug}
                                type="button"
                                onClick={() => {
                                    setServiceDialogOpen(false);
                                    visitSoporte({
                                        servicio: item.slug,
                                        modalidad: modalidad.slug,
                                        equipo: equipo?.slug,
                                    });
                                }}
                                className="rounded-xl border px-4 py-3 text-left text-sm font-semibold transition hover:bg-[#0a7c4a]/5"
                                style={{
                                    borderColor:
                                        item.slug === servicio.slug
                                            ? BRAND_COLOR
                                            : undefined,
                                    color:
                                        item.slug === servicio.slug
                                            ? BRAND_COLOR
                                            : undefined,
                                }}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={equipoDialogOpen} onOpenChange={setEquipoDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cambiar sub equipo</DialogTitle>
                        <DialogDescription>
                            Equipos registrados en {modalidad.nombre}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid max-h-80 gap-2 overflow-y-auto">
                        {equipos.map((item) => (
                            <button
                                key={item.slug}
                                type="button"
                                onClick={() => {
                                    setEquipoDialogOpen(false);
                                    visitSoporte({
                                        servicio: servicio.slug,
                                        modalidad: modalidad.slug,
                                        equipo: item.slug,
                                    });
                                }}
                                className="flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition hover:bg-[#0a7c4a]/5"
                                style={{
                                    borderColor:
                                        item.slug === equipo?.slug
                                            ? BRAND_COLOR
                                            : undefined,
                                }}
                            >
                                {item.imagen ? (
                                    <img
                                        src={item.imagen}
                                        alt=""
                                        className="size-12 shrink-0 rounded-lg object-contain"
                                    />
                                ) : (
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                        <Monitor className="size-5 text-muted-foreground" />
                                    </span>
                                )}
                                <span>
                                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                        {item.nombre}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {item.marca}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
