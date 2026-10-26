
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    CloudUpload,
    FileText,
    FolderOpen,
    Home,
    ImagePlus,
    Mail,
    MapPin,
    Package,
    Phone,
    Send,
    Settings,
    UserRound,
    Wrench,
    X,
    MessageCircle,
} from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import type {
    ChangeEvent,
    DragEvent,
    FormEvent,
} from 'react';

import { SiteBreadcrumb } from '@/components/site-breadcrumb';
import { CONTENT_WIDTH } from '@/data/equipment';
import { whatsappChatUrl } from '@/lib/whatsapp';
import {
    home,
    mantenimiento,
    refacciones as refaccionesRoute,
} from '@/routes';
import { show } from '@/routes/refacciones';
import { store as guardarCotizacionModalidad } from '@/routes/refacciones/cotizar';
import { store as guardarCotizacionPieza } from '@/routes/refacciones/cotizacion';

/* =====================================================
   TIPOS
===================================================== */

type ModalidadRef = {
    id: number;
    slug: string;
    nombre: string;
};

type MarcaOption = {
    id: number;
    nombre: string;
};

type RefaccionCotizacion = {
    id: number;
    nombre: string;
    modalidad: ModalidadRef;
    parte?: string | null;
    numero_parte?: string | null;
    marca?: string | null;
    fabricante_id?: number | null;
    descripcion?: string | null;
};

type Props = {
    refaccion?: RefaccionCotizacion | null;
    modalidad?: ModalidadRef | null;
    marcas: MarcaOption[];
};

type PhotoItem = {
    id: string;
    file: File;
    preview: string;
};

type FormValues = {
    cliente: string;
    direccion: string;
    contacto: string;
    area: string;
    telefono: string;
    correo: string;
    equipo: string;
    fabricante_id: string;
    refaccion: string;
    numero_parte: string;
    descripcion: string;
};

/* =====================================================
   ESTILOS
===================================================== */

const inputClass =
    'h-11 w-full min-w-0 rounded-lg border border-white/15 ' +
    'bg-[#111615] px-3.5 text-sm text-white ' +
    'placeholder:text-white/30 outline-none transition-all ' +
    'focus:border-[#168b52] focus:ring-2 focus:ring-[#006635]/20';

const selectClass =
    inputClass + ' cursor-pointer [color-scheme:dark]';

const labelClass =
    'mb-2 block text-sm font-medium text-white/80';

const sectionTitleClass =
    'text-lg font-semibold tracking-tight text-white';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PHOTOS = 6;
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

/* =====================================================
   COMPONENTE
===================================================== */

export default function CotizacionesViewPiesasReffaciones({
    refaccion = null,
    modalidad = null,
    marcas,
}: Props) {
    const modalidadSeleccionada =
        refaccion?.modalidad ?? modalidad;
        const { whatsappNumber } = usePage<{
            whatsappNumber?: string | null;
        }>().props;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const photosRef = useRef<PhotoItem[]>([]);

    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
    useEffect(() => {
        if (!modalExitoAbierto) {
            return;
        }
    
        const overflowAnterior = document.body.style.overflow;
    
        document.body.style.overflow = 'hidden';
    
        return () => {
            document.body.style.overflow = overflowAnterior;
        };
    }, [modalExitoAbierto]);

    const form = useForm<FormValues & { imagenes?: File[] }>({
        cliente: '',
        direccion: '',
        contacto: '',
        area: '',
        telefono: '',
        correo: '',
        equipo: '',
        fabricante_id: refaccion?.fabricante_id
            ? String(refaccion.fabricante_id)
            : '',
        refaccion: refaccion?.nombre ?? '',
        numero_parte:
            refaccion?.parte ?? refaccion?.numero_parte ?? '',
        descripcion: '',
    });

    useEffect(() => {
        form.setData((previous) => ({
            ...previous,
            fabricante_id: refaccion?.fabricante_id
                ? String(refaccion.fabricante_id)
                : '',
            refaccion: refaccion?.nombre ?? '',
            numero_parte:
                refaccion?.parte ?? refaccion?.numero_parte ?? '',
        }));
        // Solo cuando cambia la pieza precargada.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refaccion?.id]);

    /* Mantener las vistas previas sincronizadas */
    useEffect(() => {
        photosRef.current = photos;
    }, [photos]);

    /* Liberar las vistas previas al salir */
    useEffect(() => {
        return () => {
            photosRef.current.forEach((photo) => {
                URL.revokeObjectURL(photo.preview);
            });
        };
    }, []);

    const updateField = (field: keyof FormValues, value: string) => {
        form.setData(field, value);
    };

    const addPhotos = (files: File[]) => {
        setPhotoError('');

        const validFiles: File[] = [];
        let invalidFile = false;

        files.forEach((file) => {
            if (
                !ALLOWED_TYPES.includes(file.type) ||
                file.size > MAX_FILE_SIZE
            ) {
                invalidFile = true;
                return;
            }

            validFiles.push(file);
        });

        if (invalidFile) {
            setPhotoError(
                'Solo se permiten imágenes JPG, PNG o WEBP de máximo 5 MB.',
            );
        }

        setPhotos((previous) => {
            const availableSlots =
                MAX_PHOTOS - previous.length;

            if (validFiles.length > availableSlots) {
                setPhotoError(
                    `Puedes adjuntar un máximo de ${MAX_PHOTOS} fotografías.`,
                );
            }

            const existingKeys = new Set(
                previous.map(
                    (photo) =>
                        `${photo.file.name}-${photo.file.size}-${photo.file.lastModified}`,
                ),
            );

            const newPhotos = validFiles
                .filter((file) => {
                    const key =
                        `${file.name}-${file.size}-${file.lastModified}`;

                    if (existingKeys.has(key)) {
                        return false;
                    }

                    existingKeys.add(key);
                    return true;
                })
                .slice(0, Math.max(0, availableSlots))
                .map((file) => ({
                    id: crypto.randomUUID(),
                    file,
                    preview: URL.createObjectURL(file),
                }));

            return [...previous, ...newPhotos];
        });
    };

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        addPhotos(Array.from(event.target.files ?? []));

        // Permite volver a seleccionar el mismo archivo.
        event.target.value = '';
    };

    const handleDrop = (
        event: DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();
        setIsDragging(false);

        addPhotos(Array.from(event.dataTransfer.files));
    };

    const removePhoto = (id: string) => {
        setPhotos((previous) =>
            previous.filter((photo) => photo.id !== id),
        );
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!modalidadSeleccionada) {
            return;
        }

        const action = refaccion
            ? guardarCotizacionPieza.url({
                  modalidad: modalidadSeleccionada.slug,
                  refaccion: refaccion.id,
              })
            : guardarCotizacionModalidad.url(modalidadSeleccionada.slug);

        form.transform((data) => ({
            ...data,
            imagenes: photos.map((photo) => photo.file),
        }));

        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
        
            onSuccess: () => {
                setPhotos((current) => {
                    current.forEach((photo) => {
                        URL.revokeObjectURL(photo.preview);
                    });
        
                    return [];
                });
        
                setPhotoError('');
        
                form.reset(
                    'cliente',
                    'direccion',
                    'contacto',
                    'area',
                    'telefono',
                    'correo',
                    'equipo',
                    'descripcion',
                );
        
                // Mostrar modal de confirmación.
                setModalExitoAbierto(true);
            },
        });
    };

    if (!modalidadSeleccionada) {
        return null;
    }

    const titulo =
        refaccion?.nombre ?? modalidadSeleccionada.nombre;

    const marcaSeleccionada =
        marcas.find(
            (marca) =>
                String(marca.id) === form.data.fabricante_id,
        )?.nombre ?? 'Por seleccionar';

    const mensajeWhatsApp = [
        'Hola, me gustaría solicitar una cotización de refacciones.',
        '',
        '*DATOS DEL SOLICITANTE*',
        `Cliente o institución: ${form.data.cliente.trim() || 'Por indicar'}`,
        `Nombre de contacto: ${form.data.contacto.trim() || 'Por indicar'}`,
        `Teléfono: ${form.data.telefono.trim() || 'Por indicar'}`,
        `Correo: ${form.data.correo.trim() || 'Por indicar'}`,
        `Dirección: ${form.data.direccion.trim() || 'Por indicar'}`,
        `Área: ${form.data.area.trim() || 'Por indicar'}`,
        '',
        '*DATOS DEL EQUIPO Y REFACCIÓN*',
        `Módulo: ${modalidadSeleccionada.nombre}`,
        `Equipo: ${form.data.equipo.trim() || 'Por indicar'}`,
        `Marca: ${marcaSeleccionada}`,
        `Refacción: ${form.data.refaccion.trim() || 'Por indicar'}`,
        `Número de parte: ${form.data.numero_parte.trim() || 'No especificado'}`,
        '',
        '*DESCRIPCIÓN*',
        form.data.descripcion.trim() || 'Sin comentarios adicionales',
        '',
        '¿Podrían brindarme información sobre disponibilidad y cotización?',
        '',
        'Gracias.',
    ].join('\n');

    const renderInput = (
        label: string,
        field: keyof FormValues,
        placeholder: string,
        options?: {
            type?: string;
            required?: boolean;
            icon?: typeof UserRound;
            readOnly?: boolean;
        },
    ) => {
        const Icon = options?.icon;

        return (
            <div className="min-w-0">
                <label
                    htmlFor={field}
                    className={labelClass}
                >
                    {label}

                    {options?.required && (
                        <span className="ml-1 text-[#4cc185]">
                            *
                        </span>
                    )}
                </label>

                <div className="relative">
                    {Icon && (
                        <Icon
                            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
                            aria-hidden="true"
                        />
                    )}

                    <input
                        id={field}
                        name={field}
                        type={options?.type ?? 'text'}
                        value={form.data[field]}
                        onChange={(event) =>
                            updateField(
                                field,
                                event.target.value,
                            )
                        }
                        placeholder={placeholder}
                        required={options?.required}
                        readOnly={options?.readOnly}
                        className={`${inputClass} ${
                            Icon ? 'pl-10' : ''
                        } ${
                            options?.readOnly
                                ? 'cursor-default bg-[#17211b] text-white/75'
                                : ''
                        }`}
                    />
                </div>

                {form.errors[field] && (
                    <p className="mt-1 text-sm text-red-400">
                        {form.errors[field]}
                    </p>
                )}
            </div>
        );
    };

    return (
        <>
            <Head title={`Cotizar ${titulo}`} />

            <main className="min-h-screen bg-black text-white">
                <div
                    className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
                >
                    {/* Breadcrumb */}
                    <SiteBreadcrumb
                        items={[
                            {
                                label: 'Inicio',
                                href: home.url(),
                                icon: Home,
                            },
                            {
                                label: 'Servicios',
                                href: mantenimiento.url(),
                                icon: Settings,
                            },
                            {
                                label: 'Refacciones',
                                href: refaccionesRoute.url(),
                                icon: Package,
                            },
                            ...(refaccion
                                ? [
                                      {
                                          label: refaccion.nombre,
                                          href: show.url({
                                              modalidad:
                                                  modalidadSeleccionada.slug,
                                              refaccion:
                                                  refaccion.id,
                                          }),
                                          icon: Package,
                                      },
                                  ]
                                : []),
                            {
                                label: 'Cotización',
                                icon: FileText,
                            },
                        ]}
                    />

                    {/* Encabezado */}
                    <header className="mt-9">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#35b879]">
                            <FileText className="size-4" />
                            MIG Medical Imaging Group
                        </div>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                            Solicitar cotización
                        </h1>

                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/55 sm:text-base">
                            Completa el siguiente formulario
                            con tus datos y la información del
                            equipo médico o refacción que
                            necesitas. Nuestro equipo podrá
                            revisar tu solicitud.
                        </p>

                        <div className="mt-5 h-1 w-16 rounded-full bg-[#006635]" />
                    </header>

                    {/* Aviso de refacción seleccionada */}
                    {refaccion && (
                        <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#006635]/35 bg-[#006635]/10 px-4 py-4 sm:px-5">
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#4cc185]" />

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white">
                                    Refacción seleccionada
                                </p>

                                <p className="mt-1 break-words text-sm text-white/70">
                                    {refaccion.nombre}
                                </p>

                                <p className="mt-1 text-xs text-white/45">
                                    Los datos disponibles de la
                                    refacción se han agregado
                                    automáticamente.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Distribución principal: formulario + WhatsApp */}
                    <div className="mt-10 grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">

                        {/* Columna izquierda: formulario */}
                        <form
                            onSubmit={handleSubmit}
                            className="min-w-0 space-y-12"
                        >
                        {/* =====================================
                            DATOS DEL SOLICITANTE
                        ===================================== */}
                        <section>
                            <div className="mb-7 flex items-start gap-3 border-b border-white/10 pb-5">
                                <div className="rounded-lg bg-[#006635]/15 p-2.5">
                                    <UserRound className="size-5 text-[#4cc185]" />
                                </div>

                                <div>
                                    <h2 className={sectionTitleClass}>
                                        Datos para la cotización
                                    </h2>

                                    <p className="mt-1 text-sm text-white/45">
                                        Información de contacto
                                        de la persona o institución
                                        solicitante.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                                {renderInput(
                                    'Cliente o institución',
                                    'cliente',
                                    'Nombre de la institución o empresa',
                                    {
                                        required: true,
                                        icon: Building2,
                                    },
                                )}

                                {renderInput(
                                    'Nombre de contacto',
                                    'contacto',
                                    'Nombre completo',
                                    {
                                        required: true,
                                        icon: UserRound,
                                    },
                                )}

                                {renderInput(
                                    'Dirección',
                                    'direccion',
                                    'Calle, número, colonia y ciudad',
                                    {
                                        icon: MapPin,
                                    },
                                )}

                                {renderInput(
                                    'Área',
                                    'area',
                                    'Ej. Ingeniería biomédica',
                                )}

                                {renderInput(
                                    'Teléfono',
                                    'telefono',
                                    'Ej. 771 123 4567',
                                    {
                                        type: 'tel',
                                        required: true,
                                        icon: Phone,
                                    },
                                )}

                                {renderInput(
                                    'Correo electrónico',
                                    'correo',
                                    'correo@institucion.com',
                                    {
                                        type: 'email',
                                        required: true,
                                        icon: Mail,
                                    },
                                )}
                            </div>
                        </section>

                        {/* =====================================
                            DATOS DEL EQUIPO Y REFACCIÓN
                        ===================================== */}
                        <section>
                            <div className="mb-7 flex items-start gap-3 border-b border-white/10 pb-5">
                                <div className="rounded-lg bg-[#006635]/15 p-2.5">
                                    <Wrench className="size-5 text-[#4cc185]" />
                                </div>

                                <div>
                                    <h2 className={sectionTitleClass}>
                                        Datos del equipo y la refacción
                                    </h2>

                                    <p className="mt-1 text-sm text-white/45">
                                        Indica el equipo y la
                                        pieza que necesitas cotizar.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                                <div className="min-w-0">
                                    <p className={labelClass}>Módulo</p>
                                    <p className="flex h-11 items-center rounded-lg border border-white/15 bg-[#17211b] px-3.5 text-sm text-white/75">
                                        {modalidadSeleccionada.nombre}
                                    </p>
                                </div>

                                {renderInput(
                                    'Equipo',
                                    'equipo',
                                    'Ej. Equipo de rayos X',
                                    { required: true },
                                )}

                                <div className="min-w-0">
                                    <label
                                        htmlFor="fabricante_id"
                                        className={labelClass}
                                    >
                                        Marca
                                        <span className="ml-1 text-[#4cc185]">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        id="fabricante_id"
                                        name="fabricante_id"
                                        value={form.data.fabricante_id}
                                        onChange={(event) =>
                                            updateField(
                                                'fabricante_id',
                                                event.target.value,
                                            )
                                        }
                                        required
                                        className={selectClass}
                                    >
                                        <option value="">
                                            Selecciona la marca
                                        </option>
                                        {marcas.map((marca) => (
                                            <option
                                                key={marca.id}
                                                value={marca.id}
                                            >
                                                {marca.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.fabricante_id && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {form.errors.fabricante_id}
                                        </p>
                                    )}
                                </div>

                                {renderInput(
                                    'Refacción requerida',
                                    'refaccion',
                                    'Nombre de la pieza solicitada',
                                    { required: true },
                                )}

                                {renderInput(
                                    'Número de parte / P.N.',
                                    'numero_parte',
                                    'Número de parte de la refacción',
                                )}
                            </div>

                            {/* Descripción */}
                            <div className="mt-6">
                                <label
                                    htmlFor="descripcion"
                                    className={labelClass}
                                >
                                    Descripción o comentarios
                                </label>

                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    rows={5}
                                    value={form.data.descripcion}
                                    onChange={(event) =>
                                        updateField(
                                            'descripcion',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Describe la refacción, sus características, el problema que presenta el equipo o cualquier información adicional..."
                                    className={`${inputClass} h-auto min-h-36 resize-y py-3 leading-relaxed`}
                                />
                                {form.errors.descripcion && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {form.errors.descripcion}
                                    </p>
                                )}

                                <p className="mt-2 text-xs text-white/35">
                                    Puedes incluir información
                                    adicional que ayude a
                                    identificar la refacción.
                                </p>
                            </div>
                        </section>

                        {/* =====================================
                            FOTOGRAFÍAS
                        ===================================== */}
                        <section>
                            <div className="mb-7 flex items-start gap-3 border-b border-white/10 pb-5">
                                <div className="rounded-lg bg-[#006635]/15 p-2.5">
                                    <ImagePlus className="size-5 text-[#4cc185]" />
                                </div>

                                <div>
                                    <h2 className={sectionTitleClass}>
                                        Fotografías de referencia
                                    </h2>

                                    <p className="mt-1 text-sm text-white/45">
                                        Adjunta imágenes de la
                                        refacción o de la etiqueta
                                        del equipo. Este campo
                                        es opcional.
                                    </p>
                                </div>
                            </div>

                            <div
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={(event) => {
                                    event.preventDefault();
                                    setIsDragging(false);
                                }}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-10 text-center transition-all duration-200 ${
                                    isDragging
                                        ? 'border-[#4cc185] bg-[#123322]'
                                        : 'border-white/15 bg-[#111615] hover:border-[#006635]/70'
                                }`}
                            >
                                <div className="mb-4 rounded-full bg-[#006635]/15 p-4">
                                    <CloudUpload className="size-9 text-[#4cc185]" />
                                </div>

                                <h3 className="text-base font-semibold text-white">
                                    Arrastra tus fotografías aquí
                                </h3>

                                <p className="mt-2 text-sm text-white/45">
                                    O selecciónalas desde tu
                                    computadora.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#006635] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087a43]"
                                >
                                    <FolderOpen className="size-4" />
                                    Explorar imágenes
                                </button>

                                <p className="mt-4 text-xs text-white/35">
                                    JPG, PNG o WEBP · Máximo 5 MB
                                    por imagen · Hasta 6 fotografías
                                </p>

                                <input
                                    ref={fileInputRef}
                                    id="imagenes"
                                    name="imagenes[]"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    multiple
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                            </div>

                                {photoError && (
                                <p
                                    role="alert"
                                    className="mt-3 text-sm text-red-400"
                                >
                                    {photoError}
                                </p>
                            )}

                            {form.errors.imagenes && (
                                <p
                                    role="alert"
                                    className="mt-3 text-sm text-red-400"
                                >
                                    {form.errors.imagenes}
                                </p>
                            )}

                            <div className="mt-5">
                                <p className="text-sm text-white/55">
                                    {photos.length} de {MAX_PHOTOS}{' '}
                                    fotografías seleccionadas
                                </p>

                                {photos.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                        {photos.map((photo) => (
                                            <div
                                                key={photo.id}
                                                className="relative overflow-hidden rounded-xl border border-white/10 bg-[#141816]"
                                            >
                                                <img
                                                    src={photo.preview}
                                                    alt={photo.file.name}
                                                    className="h-36 w-full object-contain p-2"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removePhoto(
                                                            photo.id,
                                                        )
                                                    }
                                                    aria-label={`Eliminar ${photo.file.name}`}
                                                    className="absolute right-2 top-2 rounded-full bg-black/80 p-1.5 text-white transition hover:bg-red-600"
                                                >
                                                    <X className="size-4" />
                                                </button>

                                                <p
                                                    className="truncate border-t border-white/10 px-3 py-2 text-xs text-white/60"
                                                    title={photo.file.name}
                                                >
                                                    {photo.file.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* =====================================
                            ACCIONES
                        ===================================== */}
                        <div className="flex flex-col gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href={
                                    refaccion
                                        ? show.url({
                                              modalidad:
                                                  modalidadSeleccionada.slug,
                                              refaccion:
                                                  refaccion.id,
                                          })
                                        : refaccionesRoute.url()
                                }
                                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white/55 transition hover:text-white"
                            >
                                <ArrowLeft className="size-4" />
                                {refaccion
                                    ? 'Volver a los detalles'
                                    : 'Volver a refacciones'}
                            </Link>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#006635] px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#087a43] hover:shadow-[0_6px_20px_rgba(0,102,53,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Send className="size-4" />
                                {form.processing
                                    ? 'Enviando...'
                                    : 'Enviar solicitud de cotización'}
                            </button>
                        </div>

                    </form>
                    {/* FIN DE LA COLUMNA IZQUIERDA */}

                    {/* COLUMNA DERECHA: WHATSAPP */}
                    <aside className="min-w-0 xl:sticky xl:top-6">

                        {/* =====================================
                            CONTACTO POR WHATSAPP
                        ===================================== */}

<section className="rounded-2xl border border-[#006635]/40 bg-[#071710] p-5 sm:p-7">
                            <div className="flex items-start gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#20c866] text-white">
                                    <MessageCircle className="size-6" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold text-white sm:text-xl">
                                        Solicitar cotización por WhatsApp
                                    </h2>

                                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                                    Completa el formulario de cotización y observa
                                    cómo se genera automáticamente tu mensaje de
                                    WhatsApp con la información que ingreses.
                                    Podrás revisarlo antes de iniciar la
                                    conversación con nuestro equipo.
                                    </p>
                                </div>
                            </div>

                            {/* Vista previa del mensaje */}

                            <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#090b0a]">
                                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="size-4 text-[#4cc185]" />

                                        <span className="text-xs font-semibold text-white/75">
                                            Vista previa del mensaje
                                        </span>
                                    </div>

                                    <span className="text-[11px] text-white/35">
                                        Actualización automática
                                    </span>
                                </div>

                                <div className="max-h-80 overflow-y-auto px-4 py-5 sm:px-5">
                                    <p className="break-words whitespace-pre-wrap text-sm leading-7 text-white/80 [overflow-wrap:anywhere]">
                                        {mensajeWhatsApp}
                                    </p>
                                </div>
                            </div>

                            {/* Información importante */}

                            <div className="mt-4 flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4cc185]" />

                                <p className="text-xs leading-relaxed text-white/45">
                                    El mensaje se genera con la información
                                    capturada. Las fotografías adjuntas no
                                    se transfieren automáticamente a WhatsApp;
                                    podrás enviarlas directamente en la
                                    conversación.
                                </p>
                            </div>

                            {/* Botón principal */}

                            {whatsappNumber ? (
                                <a
                                    href={whatsappChatUrl(
                                        whatsappNumber,
                                        mensajeWhatsApp,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#20c866] px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#19b45a] hover:shadow-[0_8px_25px_rgba(32,200,102,0.20)]"
                                >
                                    <MessageCircle className="size-5" />
                                    Abrir conversación en WhatsApp
                                </a>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        disabled
                                        className="mt-6 flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#20c866] px-5 py-3 text-sm font-bold text-white opacity-50"
                                    >
                                        <MessageCircle className="size-5" />
                                        Abrir conversación en WhatsApp
                                    </button>
                                    <p className="mt-3 text-center text-xs text-amber-400/80">
                                        Pendiente de configurar el número oficial
                                        de WhatsApp.
                                    </p>
                                </>
                            )}

                            <p className="mt-4 text-center text-xs text-white/35">
                                WhatsApp se abrirá en una nueva pestaña.
                                Podrás revisar el mensaje antes de enviarlo.
                            </p>
                        </section>

                    </aside>
                    {/* FIN DE LA COLUMNA DERECHA */}

                </div>
                {/* FIN DEL CONTENEDOR DE DOS COLUMNAS */}

                </div>
            </main>
            
            {/* =====================================
                MODAL DE COTIZACIÓN ENVIADA
            ===================================== */}

{modalExitoAbierto && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-modal-exito"
                        aria-describedby="descripcion-modal-exito"
                        className="relative w-full max-w-lg rounded-2xl border border-[#006635]/60 bg-[#071710] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)] sm:p-8"
                    >
                        {/* Icono de confirmación */}

                        <div className="flex justify-center">
                            <div className="flex size-16 items-center justify-center rounded-full bg-[#006635] shadow-[0_0_30px_rgba(0,102,53,0.25)]">
                                <CheckCircle2 className="size-9 text-white" />
                            </div>
                        </div>

                        {/* Título y descripción */}

                        <div className="mt-6 text-center">
                            <h2
                                id="titulo-modal-exito"
                                className="text-xl font-bold tracking-tight text-white sm:text-2xl"
                            >
                                ¡Solicitud enviada correctamente!
                            </h2>

                            <p
                                id="descripcion-modal-exito"
                                className="mt-4 text-sm leading-7 text-white/65"
                            >
                                Hemos recibido tu solicitud de cotización
                                de refacciones. Nuestro equipo revisará
                                la información y se pondrá en contacto
                                contigo a través de los datos proporcionados.
                            </p>
                        </div>

                        {/* Mensaje institucional */}

                        <div className="mt-6 border-t border-[#006635]/40 pt-5">
                            <div className="flex items-center justify-center gap-2 text-center">
                                <CheckCircle2 className="size-4 shrink-0 text-[#4cc185]" />

                                <p className="text-xs leading-relaxed text-white/50">
                                    Gracias por confiar en MIG Medical Imaging Group.
                                </p>
                            </div>
                        </div>

                        {/* Botón para cerrar */}

                        <button
                            type="button"
                            onClick={() => setModalExitoAbierto(false)}
                            className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#006635] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#087a43] hover:shadow-[0_8px_25px_rgba(0,102,53,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc185]"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}

        </>
    );
}
