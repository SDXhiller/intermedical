import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Check,
    Copy,
    FileUp,
    Home,
    Info,
    ChevronLeft,
    ChevronRight,
    Mail,
    MapPin,
    MessageCircle,
    Monitor,
    Send,
    Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import ClienteCoordenadasModal, {
    formatCoordenadas,
    type Coordenadas,
    type MapaEnfoque,
} from '@/components/cliente-coordenadas-modal';
import { SiteBreadcrumb } from '@/components/site-breadcrumb';
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
import { store as storeSoporte } from '@/actions/App/Http/Controllers/SoporteController';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { whatsappChatUrl } from '@/lib/whatsapp';
import {
    phoneCountries,
    phoneCountryFlagUrl,
} from '@/data/phone-countries';
import { useClipboard } from '@/hooks/use-clipboard';
import { home, mantenimiento } from '@/routes';
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
    servicio: ServicioItem | null;
    servicios: ServicioItem[];
    modalidad: ModalidadItem | null;
    modalidades: ModalidadItem[];
    equipos: EquipoItem[];
    equipo: EquipoItem | null;
    equipoNombre: string | null;
};

const FALLBACK_HERO_IMAGE = '/Imagen/Body/Body.png';
const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';
const CONTACT_EMAIL = 'contacto@medicalimaging.com.mx';

const MAX_SUPPORT_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_SUPPORT_IMAGES = 5;
const NOMBRE_MAX_LENGTH = 80;
const EMPRESA_MAX_LENGTH = 120;
const TELEFONO_MAX_DIGITS = 15;
const CORREO_MAX_LENGTH = 120;
const DESCRIPCION_MAX_LENGTH = 500;
const EQUIPO_NOMBRE_MAX_LENGTH = 120;
const MARCA_MAX_LENGTH = 80;

function FieldError({ message }: { message: string | null }) {
    if (!message) {
        return null;
    }

    return (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {message}
        </p>
    );
}

function overLimitMessage(
    value: string,
    limit: number,
    label: string,
): string | null {
    if (value.length <= limit) {
        return null;
    }

    return `${label} no puede superar los ${limit} caracteres.`;
}

function phoneFieldError(value: string): string | null {
    if (value === '') {
        return null;
    }

    if (/[^\d\s()-]/.test(value)) {
        return 'El teléfono solo puede incluir números.';
    }

    const digits = value.replace(/\D/g, '').length;

    if (digits > TELEFONO_MAX_DIGITS) {
        return `El teléfono no puede superar los ${TELEFONO_MAX_DIGITS} dígitos.`;
    }

    return null;
}

function emailFieldError(value: string, touched: boolean): string | null {
    const lengthError = overLimitMessage(
        value,
        CORREO_MAX_LENGTH,
        'El correo',
    );

    if (lengthError) {
        return lengthError;
    }

    if (!touched || value.trim() === '') {
        return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return 'Ingresa un correo electrónico válido.';
    }

    return null;
}

function emptySupportImages(): Array<File | null> {
    return Array.from({ length: MAX_SUPPORT_IMAGES }, () => null);
}

function formatSupportImageSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        const kilobytes = bytes / 1024;
        const rounded =
            kilobytes >= 10
                ? Math.round(kilobytes)
                : Math.round(kilobytes * 10) / 10;

        return `${rounded} KB`;
    }

    const megabytes = Math.round((bytes / (1024 * 1024)) * 10) / 10;

    return `${megabytes} MB`;
}

function supportImageMessage(file: File): string | null {
    const isImage =
        file.type.startsWith('image/') ||
        /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i.test(file.name);

    if (!isImage) {
        return `${file.name} no es una imagen.`;
    }

    if (file.size > MAX_SUPPORT_IMAGE_BYTES) {
        return `${file.name} supera los 5 MB.`;
    }

    return null;
}

function ImagenCampo({
    numero,
    file,
    onSelect,
    onClear,
}: {
    numero: number;
    file: File | null;
    onSelect: (file: File) => void;
    onClear: () => void;
}) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div className="grid gap-1.5">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                Imagen {numero}
            </p>
            <div className="relative">
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-transparent text-center dark:border-neutral-700">
                    {preview ? (
                        <img
                            src={preview}
                            alt={`Imagen ${numero}`}
                            className="size-full object-cover"
                        />
                    ) : (
                        <>
                            <FileUp className="size-5 text-muted-foreground" />
                            <span className="mt-1 text-[11px] font-medium text-muted-foreground">
                                Agregar
                            </span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        aria-label={`Imagen ${numero}`}
                        onChange={(event) => {
                            const selected = event.target.files?.[0];

                            if (selected) {
                                onSelect(selected);
                            }

                            event.target.value = '';
                        }}
                    />
                </label>
                {file ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white"
                    >
                        Quitar
                    </button>
                ) : null}
            </div>
            <p
                className={`min-h-4 text-center text-[11px] font-semibold ${file ? '' : 'text-muted-foreground'}`}
                style={
                    file
                        ? {
                              color:
                                  file.size <= MAX_SUPPORT_IMAGE_BYTES
                                      ? BRAND_COLOR
                                      : '#dc2626',
                          }
                        : undefined
                }
            >
                {file ? formatSupportImageSize(file.size) : 'Máx. 5 MB'}
            </p>
        </div>
    );
}

const mexicanStates: {
    nombre: string;
    latitud: number;
    longitud: number;
    zoom: number;
}[] = [
    { nombre: 'Aguascalientes', latitud: 21.8853, longitud: -102.2916, zoom: 10 },
    { nombre: 'Baja California', latitud: 30.8406, longitud: -115.2838, zoom: 7 },
    { nombre: 'Baja California Sur', latitud: 26.0444, longitud: -111.6661, zoom: 7 },
    { nombre: 'Campeche', latitud: 19.8301, longitud: -90.5349, zoom: 8 },
    { nombre: 'Chiapas', latitud: 16.7569, longitud: -93.1292, zoom: 8 },
    { nombre: 'Chihuahua', latitud: 28.633, longitud: -106.0691, zoom: 7 },
    { nombre: 'Ciudad de México', latitud: 19.4326, longitud: -99.1332, zoom: 11 },
    { nombre: 'Coahuila', latitud: 27.0587, longitud: -101.7068, zoom: 7 },
    { nombre: 'Colima', latitud: 19.2452, longitud: -103.7241, zoom: 10 },
    { nombre: 'Durango', latitud: 24.0277, longitud: -104.6532, zoom: 7 },
    { nombre: 'Estado de México', latitud: 19.4969, longitud: -99.7233, zoom: 8 },
    { nombre: 'Guanajuato', latitud: 21.019, longitud: -101.2574, zoom: 9 },
    { nombre: 'Guerrero', latitud: 17.4392, longitud: -99.5451, zoom: 8 },
    { nombre: 'Hidalgo', latitud: 20.0911, longitud: -98.7624, zoom: 9 },
    { nombre: 'Jalisco', latitud: 20.6595, longitud: -103.3494, zoom: 8 },
    { nombre: 'Michoacán', latitud: 19.5665, longitud: -101.7068, zoom: 8 },
    { nombre: 'Morelos', latitud: 18.6813, longitud: -99.1013, zoom: 10 },
    { nombre: 'Nayarit', latitud: 21.7514, longitud: -104.8455, zoom: 8 },
    { nombre: 'Nuevo León', latitud: 25.5922, longitud: -99.9962, zoom: 8 },
    { nombre: 'Oaxaca', latitud: 17.0732, longitud: -96.7266, zoom: 8 },
    { nombre: 'Puebla', latitud: 19.0414, longitud: -98.2063, zoom: 9 },
    { nombre: 'Querétaro', latitud: 20.5888, longitud: -100.3899, zoom: 9 },
    { nombre: 'Quintana Roo', latitud: 19.1817, longitud: -88.4791, zoom: 8 },
    { nombre: 'San Luis Potosí', latitud: 22.1565, longitud: -100.9855, zoom: 8 },
    { nombre: 'Sinaloa', latitud: 25.1721, longitud: -107.4795, zoom: 7 },
    { nombre: 'Sonora', latitud: 29.2972, longitud: -110.3309, zoom: 7 },
    { nombre: 'Tabasco', latitud: 17.8409, longitud: -92.6189, zoom: 9 },
    { nombre: 'Tamaulipas', latitud: 24.2669, longitud: -98.8363, zoom: 7 },
    { nombre: 'Tlaxcala', latitud: 19.3182, longitud: -98.2375, zoom: 10 },
    { nombre: 'Veracruz', latitud: 19.1738, longitud: -96.1342, zoom: 7 },
    { nombre: 'Yucatán', latitud: 20.7099, longitud: -89.0943, zoom: 8 },
    { nombre: 'Zacatecas', latitud: 22.7709, longitud: -102.5832, zoom: 8 },
];

function visitSoporte(params: {
    servicio?: string | null;
    modalidad?: string | null;
    equipo?: string | null;
    equipoNombre?: string | null;
}): void {
    router.get(
        soporte.url({
            query: {
                ...(params.servicio ? { servicio: params.servicio } : {}),
                ...(params.modalidad ? { modalidad: params.modalidad } : {}),
                ...(params.equipo ? { equipo: params.equipo } : {}),
                ...(!params.equipo && params.equipoNombre
                    ? { equipo_nombre: params.equipoNombre }
                    : {}),
            },
        }),
        {},
        { preserveScroll: true },
    );
}

function StatusIcon({
    filled,
    children,
}: {
    filled: boolean;
    children: ReactNode;
}) {
    return (
        <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white ${filled ? '' : 'bg-neutral-300 dark:bg-neutral-700'}`}
            style={filled ? { backgroundColor: BRAND_COLOR } : undefined}
        >
            {children}
        </span>
    );
}

function SelectionCard({
    icon,
    label,
    value,
    empty = false,
    action,
    onAction,
    disabled = false,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    empty?: boolean;
    action: string;
    onAction: () => void;
    disabled?: boolean;
}) {
    return (
        <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-3">
            <div className="flex min-w-0 items-center gap-3">
                {icon}
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p
                        className={`truncate text-sm font-semibold ${
                            empty
                                ? 'text-muted-foreground'
                                : 'text-gray-900 dark:text-white'
                        }`}
                    >
                        {value}
                    </p>
                </div>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full shrink-0 rounded-full sm:w-auto"
                disabled={disabled}
                onClick={onAction}
            >
                {action}
            </Button>
        </article>
    );
}

export default function ViewSoporte({
    servicio,
    servicios,
    modalidad,
    modalidades,
    equipos,
    equipo,
    equipoNombre,
}: ViewSoporteProps) {
    const [copiedEmail, copyEmail] = useClipboard();
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
    const [modalidadDialogOpen, setModalidadDialogOpen] = useState(false);
    const [equipoDialogOpen, setEquipoDialogOpen] = useState(false);
    const [equipoOrigen, setEquipoOrigen] = useState<'disponibles' | 'escrito'>(
        'disponibles',
    );
    const [equipoNombreBorrador, setEquipoNombreBorrador] = useState('');
    const [marcaManual, setMarcaManual] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [nombre, setNombre] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [correoTocado, setCorreoTocado] = useState(false);
    const [imagenes, setImagenes] = useState<Array<File | null>>(
        emptySupportImages,
    );
    const [archivoError, setArchivoError] = useState<string | null>(null);
    const nombreError = overLimitMessage(
        nombre,
        NOMBRE_MAX_LENGTH,
        'El nombre',
    );
    const empresaError = overLimitMessage(
        empresa,
        EMPRESA_MAX_LENGTH,
        'La empresa',
    );
    const telefonoError = phoneFieldError(telefono);
    const correoError = emailFieldError(correo, correoTocado);
    const descripcionError = overLimitMessage(
        descripcion,
        DESCRIPCION_MAX_LENGTH,
        'La descripción',
    );
    const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
    const [mapOpen, setMapOpen] = useState(false);
    const [paisIso, setPaisIso] = useState('MX');
    const [estado, setEstado] = useState('');
    const [paso, setPaso] = useState<1 | 2 | 3>(1);
    const [pasoError, setPasoError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const { flash, whatsappNumber } = usePage<{
        flash?: { soporte_enviado?: boolean | null };
        whatsappNumber?: string | null;
    }>().props;
    const [confirmacionAbierta, setConfirmacionAbierta] = useState(
        Boolean(flash?.soporte_enviado),
    );

    useEffect(() => {
        if (flash?.soporte_enviado) {
            setConfirmacionAbierta(true);
        }
    }, [flash?.soporte_enviado]);
    const paisSeleccionado =
        phoneCountries.find((country) => country.iso === paisIso) ??
        phoneCountries[0];
    const estadoSeleccionado =
        mexicanStates.find((state) => state.nombre === estado) ?? null;
    const mapaEnfoque: MapaEnfoque | null = estadoSeleccionado
        ? {
              latitud: estadoSeleccionado.latitud,
              longitud: estadoSeleccionado.longitud,
              zoom: estadoSeleccionado.zoom,
          }
        : null;
    const heroImage =
        equipo?.imagen || modalidad?.imagen || FALLBACK_HERO_IMAGE;

    const whatsappPreview = useMemo(() => {
        return [
            'Hola, me gustaría solicitar soporte técnico.',
            '',
            `Servicio: ${servicio?.title ?? 'Por seleccionar'}`,
            `Modalidad: ${modalidad?.nombre ?? 'Por seleccionar'}`,
            `Equipo: ${
                equipo
                    ? `${equipo.nombre} (${equipo.marca})`
                    : equipoNombre
                      ? `${equipoNombre}${marcaManual.trim() !== '' ? ` (${marcaManual.trim()})` : ''}`
                      : 'Por seleccionar'
            }`,
            `Descripción: ${descripcion.trim() !== '' ? descripcion.trim() : '[Puedes agregar más detalles]'}`,
            '',
            '¿Podrían brindarme más información?',
        ].join('\n');
    }, [
        descripcion,
        equipo,
        equipoNombre,
        marcaManual,
        modalidad?.nombre,
        servicio?.title,
    ]);
    const equipoEscrito = equipo === null ? equipoNombre : null;
    const equipoLleno = equipo !== null || equipoEscrito !== null;
    const equipoNombreBorradorError = overLimitMessage(
        equipoNombreBorrador,
        EQUIPO_NOMBRE_MAX_LENGTH,
        'El nombre del equipo',
    );
    const marcaManualError =
        equipoEscrito === null
            ? null
            : overLimitMessage(marcaManual, MARCA_MAX_LENGTH, 'La marca');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (descripcion.trim() === '' || descripcionError !== null || archivoError !== null) {
            setPasoError(
                descripcionError ??
                    archivoError ??
                    'Describe la falla para enviar la solicitud.',
            );

            return;
        }

        setPasoError(null);
        setEnviando(true);

        router.post(
            storeSoporte.url(),
            {
                servicio: servicio?.slug ?? '',
                modalidad: modalidad?.slug ?? '',
                equipo: equipo?.slug ?? '',
                equipo_nombre: equipo ? '' : (equipoNombre ?? ''),
                marca: equipo ? '' : marcaManual.trim(),
                nombre: nombre.trim(),
                empresa: empresa.trim(),
                codigo_pais: paisSeleccionado.dial,
                telefono,
                correo: correo.trim(),
                estado,
                latitud: coordenadas?.latitud ?? '',
                longitud: coordenadas?.longitud ?? '',
                descripcion: descripcion.trim(),
                ...(imagenes.some((file) => file !== null)
                    ? {
                          imagenes: imagenes.filter(
                              (file): file is File => file !== null,
                          ),
                      }
                    : {}),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setPaso(1);
                    setNombre('');
                    setEmpresa('');
                    setTelefono('');
                    setCorreo('');
                    setCorreoTocado(false);
                    setEstado('');
                    setCoordenadas(null);
                    setDescripcion('');
                    setImagenes(emptySupportImages());
                    setArchivoError(null);
                    setMarcaManual('');
                    setPasoError(null);
                    setConfirmacionAbierta(true);
                },
                onError: (errors) => {
                    const first = Object.values(errors).find(
                        (message) => typeof message === 'string' && message !== '',
                    );

                    setPasoError(
                        typeof first === 'string'
                            ? first
                            : 'Revisa los datos e inténtalo de nuevo.',
                    );
                },
                onFinish: () => setEnviando(false),
            },
        );
    };

    const avanzarPaso = () => {
        if (
            paso === 1 &&
            (servicio === null || modalidad === null || !equipoLleno)
        ) {
            setPasoError(
                'Elige el servicio, la modalidad y el equipo para continuar.',
            );

            return;
        }

        if (paso === 1 && equipoEscrito !== null) {
            if (marcaManual.trim() === '' || marcaManualError !== null) {
                setPasoError(
                    marcaManualError ??
                        'Escribe la marca del equipo para continuar.',
                );

                return;
            }
        }

        if (paso === 2) {
            setCorreoTocado(true);
            const correoInvalido = emailFieldError(correo, true);
            const telefonoVacio = telefono.replace(/\D/g, '').length === 0;

            if (
                nombre.trim() === '' ||
                nombreError !== null ||
                empresaError !== null ||
                telefonoVacio ||
                telefonoError !== null ||
                correo.trim() === '' ||
                correoInvalido !== null
            ) {
                setPasoError(
                    'Completa el nombre, el teléfono y un correo válido para continuar.',
                );

                return;
            }
        }

        setPasoError(null);
        setPaso((current) => (current === 1 ? 2 : 3));
    };

    const retrocederPaso = () => {
        setPasoError(null);
        setPaso((current) => (current === 3 ? 2 : 1));
    };

    const asignarImagen = (index: number, file: File) => {
        const message = supportImageMessage(file);

        if (message !== null) {
            setArchivoError(message);

            return;
        }

        setArchivoError(null);
        setImagenes((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index ? file : item,
            ),
        );
    };

    const quitarImagen = (index: number) => {
        setArchivoError(null);
        setImagenes((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index ? null : item,
            ),
        );
    };

    return (
        <>
            <Head title="Solicitar soporte técnico" />

            <section className="relative overflow-hidden bg-neutral-950">
                <div
                    className={`relative mx-auto grid items-center gap-6 py-8 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-14 ${CONTENT_WIDTH}`}
                >
                    <div className="relative z-10">
                        <SiteBreadcrumb
                            items={[
                                { label: 'Inicio', href: home.url(), icon: Home },
                                {
                                    label: 'Servicios',
                                    href: mantenimiento.url(),
                                    icon: Wrench,
                                },
                                ...(servicio
                                    ? [
                                          {
                                              label: servicio.title,
                                              icon: Wrench,
                                          },
                                      ]
                                    : []),
                                { label: 'Contacto', icon: Mail },
                            ]}
                        />

                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
                            Solicitar soporte técnico
                        </h1>
                        {modalidad ? (
                            <p
                                className="mt-3 text-sm font-semibold break-words sm:text-lg"
                                style={{ color: BRAND_COLOR }}
                            >
                                {modalidad.nombre}
                                {equipo ? ` / ${equipo.nombre}` : ''}
                            </p>
                        ) : null}
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                            Completa la información de tu equipo y cuéntanos el
                            problema. Nuestro equipo te contactará a la
                            brevedad.
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-white lg:hidden">
                        <img
                            src={heroImage}
                            alt={equipo?.nombre ?? modalidad?.nombre ?? ''}
                            className="mx-auto h-48 w-full object-contain object-center sm:h-56"
                        />
                    </div>

                    <div className="relative hidden min-h-[320px] overflow-hidden lg:block">
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
                                alt={equipo?.nombre ?? modalidad?.nombre ?? ''}
                                className="absolute inset-0 size-full object-contain object-right [mask-image:linear-gradient(to_right,transparent_12%,black_48%)] [-webkit-mask-image:linear-gradient(to_right,transparent_12%,black_48%)]"
                            />
                            <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-neutral-950 from-20% via-neutral-950/75 via-70% to-transparent" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-4 dark:bg-neutral-950 sm:py-6 lg:py-8">
                <div className={`mx-auto ${CONTENT_WIDTH} max-w-6xl`}>
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
                        >
                            <ol className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        [1, 'Equipo'],
                                        [2, 'Cliente'],
                                        [3, 'Problema'],
                                    ] as const
                                ).map(([numero, etiqueta]) => (
                                    <li
                                        key={numero}
                                        className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
                                    >
                                        <span
                                            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs text-white ${paso === numero ? '' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                                            style={
                                                paso === numero
                                                    ? {
                                                          backgroundColor:
                                                              BRAND_COLOR,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {numero}
                                        </span>
                                        <span
                                            className={
                                                paso === numero
                                                    ? 'text-gray-900 dark:text-white'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {etiqueta}
                                        </span>
                                    </li>
                                ))}
                            </ol>

                            {paso === 1 ? (
                                <>
                            <h2 className="mt-6 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                                <span
                                    className="flex size-6 items-center justify-center rounded-full text-xs text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    1
                                </span>
                                Información del equipo
                            </h2>

                            <div className="mt-5 grid gap-3">
                        <SelectionCard
                            icon={
                                <StatusIcon filled={servicio !== null}>
                                    <Wrench
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </StatusIcon>
                            }
                            label="Servicio seleccionado"
                            value={servicio?.title ?? 'Sin seleccionar'}
                            empty={servicio === null}
                            action={
                                servicio
                                    ? 'Cambiar servicio'
                                    : 'Elegir servicio'
                            }
                            onAction={() => setServiceDialogOpen(true)}
                        />

                        <SelectionCard
                            icon={
                                <StatusIcon filled={modalidad !== null}>
                                    <Activity
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </StatusIcon>
                            }
                            label="Modalidad"
                            value={modalidad?.nombre ?? 'Sin seleccionar'}
                            empty={modalidad === null}
                            action={
                                modalidad
                                    ? 'Cambiar modalidad'
                                    : 'Elegir modalidad'
                            }
                            onAction={() => setModalidadDialogOpen(true)}
                        />

                        <SelectionCard
                            icon={
                                equipo?.imagen ? (
                                    <span
                                        className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full"
                                        style={{
                                            boxShadow: `0 0 0 2px ${BRAND_COLOR}`,
                                        }}
                                    >
                                        <img
                                            src={equipo.imagen}
                                            alt=""
                                            className="size-full object-contain p-1"
                                        />
                                    </span>
                                ) : (
                                    <StatusIcon filled={equipoLleno}>
                                        <Monitor
                                            className="size-5"
                                            strokeWidth={1.75}
                                        />
                                    </StatusIcon>
                                )
                            }
                            label="Equipo / Sub equipo"
                            value={
                                equipo?.nombre ??
                                equipoEscrito ??
                                'Sin seleccionar'
                            }
                            empty={!equipoLleno}
                            action={
                                equipoLleno ? 'Cambiar equipo' : 'Elegir equipo'
                            }
                            disabled={modalidad === null}
                            onAction={() => {
                                setEquipoOrigen(
                                    equipoEscrito ? 'escrito' : 'disponibles',
                                );
                                setEquipoNombreBorrador(equipoEscrito ?? '');
                                setEquipoDialogOpen(true);
                            }}
                        />
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="marca">Marca *</Label>
                                        <Input
                                            id="marca"
                                            name="marca"
                                            value={
                                                equipo?.marca ?? marcaManual
                                            }
                                            onChange={(event) =>
                                                setMarcaManual(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={
                                                equipoEscrito
                                                    ? 'Marca del equipo'
                                                    : 'Se completa al elegir el sub equipo'
                                            }
                                            readOnly={equipoEscrito === null}
                                            disabled={equipoEscrito === null}
                                            aria-invalid={Boolean(
                                                marcaManualError,
                                            )}
                                        />
                                        <FieldError
                                            message={marcaManualError}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="modelo">Modelo *</Label>
                                        <Input
                                            id="modelo"
                                            name="modelo"
                                            value={
                                                equipo?.nombre ??
                                                equipoEscrito ??
                                                ''
                                            }
                                            placeholder={
                                                equipoEscrito
                                                    ? 'Nombre escrito del equipo'
                                                    : 'Se completa al elegir el sub equipo'
                                            }
                                            readOnly
                                            disabled
                                        />
                                    </div>
                            </div>

                            {pasoError ? (
                                <div className="mt-4">
                                    <FieldError message={pasoError} />
                                </div>
                            ) : null}

                            <button
                                type="button"
                                onClick={avanzarPaso}
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                Siguiente
                                <ChevronRight className="size-4" />
                            </button>
                                </>
                            ) : null}

                            {paso === 2 ? (
                                <>
                            <h2 className="mt-6 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                                <span
                                    className="flex size-6 items-center justify-center rounded-full text-xs text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    2
                                </span>
                                Información del cliente
                            </h2>

                            <div className="mt-5 grid items-start gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="nombre">
                                        Nombre completo *
                                    </Label>
                                    <Input
                                        id="nombre"
                                        name="nombre"
                                        value={nombre}
                                        onChange={(event) =>
                                            setNombre(event.target.value)
                                        }
                                        placeholder="Tu nombre"
                                        aria-invalid={Boolean(nombreError)}
                                    />
                                    <FieldError message={nombreError} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="empresa">
                                        Empresa (opcional)
                                    </Label>
                                    <Input
                                        id="empresa"
                                        name="empresa"
                                        value={empresa}
                                        onChange={(event) =>
                                            setEmpresa(event.target.value)
                                        }
                                        placeholder="Nombre de la empresa"
                                        aria-invalid={Boolean(empresaError)}
                                    />
                                    <FieldError message={empresaError} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={paisIso}
                                            onValueChange={setPaisIso}
                                        >
                                            <SelectTrigger
                                                id="codigo-pais"
                                                className="w-[7.5rem] shrink-0"
                                                aria-label="Código de país"
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <img
                                                        src={phoneCountryFlagUrl(
                                                            paisSeleccionado.iso,
                                                        )}
                                                        alt=""
                                                        className="h-3.5 w-5 rounded-[2px] object-cover"
                                                    />
                                                    <span>
                                                        {paisSeleccionado.dial}
                                                    </span>
                                                </span>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {phoneCountries.map(
                                                    (country) => (
                                                        <SelectItem
                                                            key={country.iso}
                                                            value={country.iso}
                                                        >
                                                            <img
                                                                src={phoneCountryFlagUrl(
                                                                    country.iso,
                                                                )}
                                                                alt=""
                                                                className="h-3.5 w-5 rounded-[2px] object-cover"
                                                            />
                                                            <span>
                                                                {country.dial}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {country.name}
                                                            </span>
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            id="telefono"
                                            name="telefono"
                                            type="tel"
                                            value={telefono}
                                            onChange={(event) =>
                                                setTelefono(event.target.value)
                                            }
                                            placeholder="771 123 4567"
                                            className="min-w-0 flex-1"
                                            aria-invalid={Boolean(telefonoError)}
                                        />
                                    </div>
                                    <FieldError message={telefonoError} />
                                    <input
                                        type="hidden"
                                        name="codigo_pais"
                                        value={paisSeleccionado.dial}
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
                                        value={correo}
                                        onChange={(event) =>
                                            setCorreo(event.target.value)
                                        }
                                        onBlur={() => setCorreoTocado(true)}
                                        placeholder="tucorreo@ejemplo.com"
                                        aria-invalid={Boolean(correoError)}
                                    />
                                    <FieldError message={correoError} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="estado">
                                        Estado / Ciudad
                                    </Label>
                                    <Select
                                        value={estado}
                                        onValueChange={(next) => {
                                            setEstado(next);
                                            setCoordenadas(null);
                                        }}
                                    >
                                        <SelectTrigger
                                            id="estado"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Selecciona una opción" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mexicanStates.map((state) => (
                                                <SelectItem
                                                    key={state.nombre}
                                                    value={state.nombre}
                                                >
                                                    {state.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <input
                                        type="hidden"
                                        name="estado"
                                        value={estado}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-800">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Ubicación exacta
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Marque el punto exacto en el
                                                mapa para facilitar la entrega.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMapOpen(true)}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition hover:bg-[#0a7c4a]/5"
                                            style={{
                                                borderColor: BRAND_COLOR,
                                                color: BRAND_COLOR,
                                            }}
                                        >
                                            <MapPin className="size-4" />
                                            Ingresar coordenadas
                                        </button>
                                        {coordenadas ? (
                                            <p className="rounded-lg bg-[#0a7c4a]/10 px-3 py-2 text-sm text-[#0a7c4a]">
                                                Coordenadas registradas:{' '}
                                                {formatCoordenadas(coordenadas)}
                                            </p>
                                        ) : null}
                                    </div>
                                    <input
                                        type="hidden"
                                        name="latitud"
                                        value={coordenadas?.latitud ?? ''}
                                    />
                                    <input
                                        type="hidden"
                                        name="longitud"
                                        value={coordenadas?.longitud ?? ''}
                                    />
                                </div>
                            </div>

                            {pasoError ? (
                                <div className="mt-4">
                                    <FieldError message={pasoError} />
                                </div>
                            ) : null}

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={retrocederPaso}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                                >
                                    <ChevronLeft className="size-4" />
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={avanzarPaso}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    Siguiente
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                                </>
                            ) : null}

                            {paso === 3 ? (
                                <>
                            <h2 className="mt-6 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
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
                                        aria-invalid={Boolean(descripcionError)}
                                        className={`min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] ${descripcionError ? 'border-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/20 dark:border-red-400' : 'border-input focus-visible:border-ring focus-visible:ring-ring/50'}`}
                                    />
                                    <div className="flex items-start justify-between gap-3">
                                        <FieldError message={descripcionError} />
                                        <p
                                            className={`ml-auto text-xs ${descripcionError ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
                                        >
                                            {descripcion.length}/
                                            {DESCRIPCION_MAX_LENGTH}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Fotografías (opcional)</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Hasta 5 imágenes. Solo imágenes de hasta 5 MB.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                        {imagenes.map((file, index) => (
                                            <ImagenCampo
                                                key={index}
                                                numero={index + 1}
                                                file={file}
                                                onSelect={(selected) =>
                                                    asignarImagen(
                                                        index,
                                                        selected,
                                                    )
                                                }
                                                onClear={() =>
                                                    quitarImagen(index)
                                                }
                                            />
                                        ))}
                                    </div>
                                    {archivoError ? (
                                        <FieldError message={archivoError} />
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={retrocederPaso}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                                >
                                    <ChevronLeft className="size-4" />
                                    Anterior
                                </button>
                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                >
                                    <Send className="size-4" />
                                    {enviando ? 'Enviando...' : 'Enviar solicitud'}
                                </button>
                            </div>
                                </>
                            ) : null}
                        </form>

                        <ClienteCoordenadasModal
                            open={mapOpen}
                            onOpenChange={setMapOpen}
                            value={coordenadas}
                            focus={mapaEnfoque}
                            onConfirm={setCoordenadas}
                        />

                        <div className="flex flex-col gap-6">
                            <article className="rounded-2xl border border-[#0a7c4a]/25 bg-[#0a7c4a]/5 p-4 dark:border-[#0a7c4a]/30 dark:bg-[#0a7c4a]/10 sm:p-7">
                                <div className="flex items-start gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                                        <MessageCircle
                                            className="size-5"
                                            strokeWidth={1.75}
                                        />
                                    </span>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
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

                                <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-white p-4 text-xs leading-relaxed break-words text-gray-700 dark:bg-neutral-950 dark:text-white/80 sm:text-sm">
                                    {whatsappPreview
                                        .split('\n')
                                        .map((line, index) => (
                                            <p key={`${index}-${line}`}>
                                                {line || '\u00A0'}
                                            </p>
                                        ))}
                                </div>

                                {whatsappNumber ? (
                                    <a
                                        href={whatsappChatUrl(
                                            whatsappNumber,
                                            whatsappPreview,
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                    >
                                        <MessageCircle className="size-4" />
                                        Abrir WhatsApp
                                    </a>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </article>

                            <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-7">
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
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                                            3. Contactar por correo electrónico
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            También puedes enviarnos un correo
                                            directamente.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-700">
                                    <a
                                        href={`mailto:${CONTACT_EMAIL}`}
                                        className="min-w-0 break-all text-sm font-semibold"
                                        style={{ color: BRAND_COLOR }}
                                    >
                                        {CONTACT_EMAIL}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void copyEmail(CONTACT_EMAIL);
                                        }}
                                        className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:w-auto sm:border-0 sm:p-0 dark:border-neutral-700"
                                        aria-label="Copiar correo"
                                    >
                                        <Copy className="size-4" />
                                        {copiedEmail === CONTACT_EMAIL
                                            ? 'Copiado'
                                            : null}
                                    </button>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-7">
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
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
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
                                        El servicio, la modalidad y el sub
                                        equipo se pueden cambiar en esta página.
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
                open={confirmacionAbierta}
                onOpenChange={setConfirmacionAbierta}
            >
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center gap-4 px-2 pt-2 text-center">
                        <span
                            className="flex size-14 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            <Check className="size-7" strokeWidth={2.25} />
                        </span>
                        <img
                            src={MIG_HORIZONTAL_WHITE}
                            alt="Medical Imaging Group"
                            className="h-14 w-auto max-w-[220px] object-contain"
                        />
                        <DialogHeader className="items-center gap-2 sm:text-center">
                            <DialogTitle className="text-xl">
                                Solicitud recibida
                            </DialogTitle>
                            <DialogDescription className="text-balance text-base text-muted-foreground">
                                Gracias por contactarnos. Un especialista de
                                soporte se comunicará con usted a la brevedad
                                para atender su solicitud.
                            </DialogDescription>
                        </DialogHeader>
                        <button
                            type="button"
                            onClick={() => router.get(mantenimiento.url())}
                            className="mt-1 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND_COLOR }}
                        >
                            Entendido
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={serviceDialogOpen}
                onOpenChange={setServiceDialogOpen}
            >
                <DialogContent className="max-h-[min(85dvh,36rem)] overflow-y-auto p-4 sm:max-w-md sm:p-6">
                    <DialogHeader>
                        <DialogTitle>
                            {servicio
                                ? 'Cambiar servicio'
                                : 'Elegir servicio'}
                        </DialogTitle>
                        <DialogDescription>
                            Elige el tipo de soporte que necesitas.
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
                                        modalidad: modalidad?.slug,
                                        equipo: equipo?.slug,
                                        equipoNombre: equipoEscrito,
                                    });
                                }}
                                className="rounded-xl border px-4 py-3 text-left text-sm font-semibold transition hover:bg-[#0a7c4a]/5"
                                style={{
                                    borderColor:
                                        item.slug === servicio?.slug
                                            ? BRAND_COLOR
                                            : undefined,
                                    color:
                                        item.slug === servicio?.slug
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

            <Dialog
                open={modalidadDialogOpen}
                onOpenChange={setModalidadDialogOpen}
            >
                <DialogContent className="max-h-[min(85dvh,36rem)] overflow-y-auto p-4 sm:max-w-md sm:p-6">
                    <DialogHeader>
                        <DialogTitle>
                            {modalidad
                                ? 'Cambiar modalidad'
                                : 'Elegir modalidad'}
                        </DialogTitle>
                        <DialogDescription>
                            Elige cualquier modalidad registrada. Los sub
                            equipos se actualizarán según esa selección.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid max-h-80 gap-2 overflow-y-auto">
                        {modalidades.map((item) => (
                            <button
                                key={item.slug}
                                type="button"
                                onClick={() => {
                                    setModalidadDialogOpen(false);
                                    visitSoporte({
                                        servicio: servicio?.slug,
                                        modalidad: item.slug,
                                    });
                                }}
                                className="flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition hover:bg-[#0a7c4a]/5"
                                style={{
                                    borderColor:
                                        item.slug === modalidad?.slug
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
                                        <Activity className="size-5 text-muted-foreground" />
                                    </span>
                                )}
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {item.nombre}
                                </span>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={equipoDialogOpen} onOpenChange={setEquipoDialogOpen}>
                <DialogContent className="max-h-[min(85dvh,36rem)] overflow-y-auto p-4 sm:max-w-md sm:p-6">
                    <DialogHeader>
                        <DialogTitle>
                            {equipoLleno ? 'Cambiar equipo' : 'Elegir equipo'}
                        </DialogTitle>
                        <DialogDescription>
                            {modalidad
                                ? `Elige un equipo de ${modalidad.nombre} o escribe el nombre.`
                                : 'Elige primero una modalidad para ver sus equipos.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            aria-pressed={equipoOrigen === 'disponibles'}
                            onClick={() => setEquipoOrigen('disponibles')}
                            className="rounded-full px-3 py-2 text-sm font-semibold text-white"
                            style={{
                                backgroundColor:
                                    equipoOrigen === 'disponibles'
                                        ? BRAND_COLOR
                                        : '#a3a3a3',
                            }}
                        >
                            Equipos disponibles
                        </button>
                        <button
                            type="button"
                            aria-pressed={equipoOrigen === 'escrito'}
                            onClick={() => setEquipoOrigen('escrito')}
                            className="rounded-full px-3 py-2 text-sm font-semibold text-white"
                            style={{
                                backgroundColor:
                                    equipoOrigen === 'escrito'
                                        ? BRAND_COLOR
                                        : '#a3a3a3',
                            }}
                        >
                            Escribir nombre
                        </button>
                    </div>
                    {equipoOrigen === 'disponibles' ? (
                    <div className="grid max-h-80 gap-2 overflow-y-auto">
                        {equipos.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay equipos registrados en esta modalidad.
                                Puedes escribir el nombre.
                            </p>
                        ) : null}
                        {equipos.map((item) => (
                            <button
                                key={item.slug}
                                type="button"
                                onClick={() => {
                                    setEquipoDialogOpen(false);
                                    visitSoporte({
                                        servicio: servicio?.slug,
                                        modalidad: modalidad?.slug,
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
                    ) : (
                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="equipo-nombre">
                                    Nombre del equipo
                                </Label>
                                <Input
                                    id="equipo-nombre"
                                    value={equipoNombreBorrador}
                                    onChange={(event) =>
                                        setEquipoNombreBorrador(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Escribe el modelo o el nombre"
                                    aria-invalid={Boolean(
                                        equipoNombreBorradorError,
                                    )}
                                />
                                <FieldError
                                    message={equipoNombreBorradorError}
                                />
                            </div>
                            <button
                                type="button"
                                disabled={
                                    equipoNombreBorrador.trim() === '' ||
                                    equipoNombreBorradorError !== null
                                }
                                onClick={() => {
                                    setEquipoDialogOpen(false);
                                    visitSoporte({
                                        servicio: servicio?.slug,
                                        modalidad: modalidad?.slug,
                                        equipoNombre:
                                            equipoNombreBorrador.trim(),
                                    });
                                }}
                                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ backgroundColor: BRAND_COLOR }}
                            >
                                Usar este nombre
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
