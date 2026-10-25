import { Form, Head, usePage } from '@inertiajs/react';
import {
    CloudUpload,
    FolderOpen,
    ImagePlus,
    PackagePlus,
    Save,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import RefaccionController from '@/actions/App/Http/Controllers/Admin/RefaccionController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ModeloOption = {
    id: number;
    nombre: string;
};

type FabricanteOption = {
    id: number;
    nombre: string;
};

type PageProps = {
    modelos: ModeloOption[];
    fabricantes: FabricanteOption[];
    flash?: { success?: string | null };
};

const CATEGORIAS = [
    'Cables',
    'Fuentes de poder',
    'Módulos',
    'Paneles',
    'Tarjetas electrónicas',
];

const inputClass =
    'h-11 w-full rounded-lg border border-white/15 bg-[#111315] px-3 text-sm text-white placeholder:text-white/35 outline-none transition focus-visible:border-[#006635] focus-visible:ring-2 focus-visible:ring-[#006635]/25';
const selectClass = `${inputClass} cursor-pointer [color-scheme:dark]`;
const sectionClass = 'w-full';

export default function FormularioPiesasReffaciones({
    modelos,
    fabricantes,
}: PageProps) {
    const { flash } = usePage<PageProps>().props;
    const [moduloId, setModuloId] = useState(modelos[0] ? String(modelos[0].id) : '');
    const [fabricanteId, setFabricanteId] = useState(
        fabricantes[0] ? String(fabricantes[0].id) : '',
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [photos, setPhotos] = useState<
        { file: File; preview: string }[]
    >([]);
    
    const [isDragging, setIsDragging] = useState(false);
    const [photoError, setPhotoError] = useState('');
    
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    const ALLOWED_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];
    
    const updatePhotos = (files: File[]) => {
        setPhotoError('');
    
        const validFiles = files.filter((file) => {
            return (
                ALLOWED_TYPES.includes(file.type) &&
                file.size <= MAX_FILE_SIZE
            );
        });
    
        if (validFiles.length !== files.length) {
            setPhotoError(
                'Solo se permiten imágenes JPG, PNG o WEBP de máximo 5 MB.',
            );
        }
    
        setPhotos((previous) => {
            const existing = new Set(
                previous.map(
                    (item) =>
                        `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
                ),
            );
    
            const newPhotos = validFiles
                .filter(
                    (file) =>
                        !existing.has(
                            `${file.name}-${file.size}-${file.lastModified}`,
                        ),
                )
                .map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                }));
    
            const updated = [...previous, ...newPhotos];
    
            if (fileInputRef.current) {
                const transfer = new DataTransfer();
    
                updated.forEach((item) => {
                    transfer.items.add(item.file);
                });
    
                fileInputRef.current.files = transfer.files;
            }
    
            return updated;
        });
    };
    
    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        updatePhotos(Array.from(event.target.files ?? []));
    };
    
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    
        updatePhotos(Array.from(event.dataTransfer.files));
    };
    
    const removePhoto = (index: number) => {
        setPhotos((previous) => {
            const removed = previous[index];
    
            if (removed) {
                URL.revokeObjectURL(removed.preview);
            }
    
            const updated = previous.filter((_, i) => i !== index);
    
            if (fileInputRef.current) {
                const transfer = new DataTransfer();
    
                updated.forEach((item) => {
                    transfer.items.add(item.file);
                });
    
                fileInputRef.current.files = transfer.files;
            }
    
            return updated;
        });
    };

    return (
        <>
            <Head title="Registrar refacción" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6">
                <Heading
                    title="Registrar refacción"
                    description="Registra piezas compatibles con tus equipos y administra su publicación en el catálogo."
                />

                {flash?.success ? (
                    <p role="status" className="rounded-lg border border-emerald-700/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
                        {flash.success}
                    </p>
                ) : null}

                    <Form
                        {...RefaccionController.store.form()}
                        encType="multipart/form-data"
                        className="space-y-10 text-white"
                    >
                    {({ errors, processing }) => (
                        <>
                            <section className={sectionClass}>
                                <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
                                    <PackagePlus className="size-5 text-[#33a36a]" />
                                    <div>
                                        <h2 className="text-base font-semibold">Información de la refacción</h2>
                                        <p className="text-xs text-white/50">Selecciona el equipo y registra los datos de identificación.</p>
                                    </div>
                                </div>
                                <div className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="modulo_id">Modelo del equipo <span className="text-[#4cc185]">*</span></Label>
                                        <select
                                            id="modulo_id"
                                            name="modulo_id"
                                            value={moduloId}
                                            onChange={(event) => setModuloId(event.target.value)}
                                            required
                                            className={selectClass}
                                        >
                                            {modelos.length === 0 ? (
                                                <option value="" className="bg-[#111315] text-white">No hay modelos publicados</option>
                                            ) : (
                                                modelos.map((modelo) => (
                                                    <option key={modelo.id} value={modelo.id} className="bg-[#111315] text-white">
                                                        {modelo.nombre}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <InputError message={errors.modulo_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre">Nombre de la refacción <span className="text-[#4cc185]">*</span></Label>
                                        <Input id="nombre" name="nombre" required placeholder="Ej. Tarjeta de control principal" className={inputClass} />
                                        <InputError message={errors.nombre} />
                                    </div>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="numero_parte">Número de parte (P/N)</Label>
                                            <Input id="numero_parte" name="numero_parte" placeholder="Código del fabricante" className={inputClass} />
                                            <InputError message={errors.numero_parte} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="fabricante_id">Marca / fabricante <span className="text-[#4cc185]">*</span></Label>
                                            <select
                                                id="fabricante_id"
                                                name="fabricante_id"
                                                value={fabricanteId}
                                                onChange={(event) => setFabricanteId(event.target.value)}
                                                required
                                                className={selectClass}
                                            >
                                                {fabricantes.length === 0 ? (
                                                    <option value="" className="bg-[#111315] text-white">No hay fabricantes registrados</option>
                                                ) : (
                                                    fabricantes.map((fabricante) => (
                                                        <option key={fabricante.id} value={fabricante.id} className="bg-[#111315] text-white">
                                                            {fabricante.nombre}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <InputError message={errors.fabricante_id} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className={sectionClass}>
                                <div className="mb-5 border-b border-white/10 pb-4">
                                    <h2 className="text-base font-semibold">Clasificación y disponibilidad</h2>
                                    <p className="mt-1 text-xs text-white/50">Estos datos ayudarán a filtrar las piezas en el catálogo.</p>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="categoria">Categoría</Label>
                                        <select id="categoria" name="categoria" defaultValue={CATEGORIAS[0]} className={selectClass}>
                                            {CATEGORIAS.map((categoria) => (
                                                <option key={categoria} value={categoria} className="bg-[#111315] text-white">{categoria}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.categoria} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="condicion">Condición</Label>
                                        <select id="condicion" name="condicion" defaultValue="nueva" className={selectClass}>
                                            <option value="nueva" className="bg-[#111315] text-white">Nueva</option>
                                            <option value="usada" className="bg-[#111315] text-white">Usada</option>
                                            <option value="reacondicionada" className="bg-[#111315] text-white">Reacondicionada</option>
                                        </select>
                                        <InputError message={errors.condicion} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="disponibilidad">Disponibilidad</Label>
                                        <select id="disponibilidad" name="disponibilidad" defaultValue="disponible" className={selectClass}>
                                            <option value="disponible" className="bg-[#111315] text-white">Disponible</option>
                                            <option value="bajo_pedido" className="bg-[#111315] text-white">Bajo pedido</option>
                                            <option value="consultar" className="bg-[#111315] text-white">Consultar</option>
                                        </select>
                                        <InputError message={errors.disponibilidad} />
                                    </div>
                                </div>
                                <div className="mt-5 grid gap-2">
                                    <Label htmlFor="descripcion">Descripción</Label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        rows={5}
                                        placeholder="Describe la función de la pieza, sus características y observaciones de compatibilidad..."
                                        className={`${inputClass} h-auto min-h-32 resize-y py-3`}
                                    />
                                    <InputError message={errors.descripcion} />
                                </div>
                            </section>


                            <section className={sectionClass}>
    <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
        <ImagePlus className="size-5 text-[#33a36a]" />

        <div>
            <h2 className="text-base font-semibold text-white">
                Fotografías de la refacción
            </h2>

            <p className="text-xs text-white/50">
                Agrega imágenes para identificar correctamente la pieza.
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
        className={`relative flex flex-col items-center justify-center
            rounded-xl border-2 border-dashed px-5 py-10
            text-center transition-all duration-200 ${
                isDragging
                    ? 'border-[#35b879] bg-[#143021]'
                    : 'border-white/20 bg-[#111315] hover:border-[#35b879]/60'
            }`}
    >
        <div className="mb-4 rounded-full bg-[#183224] p-4">
            <CloudUpload className="size-9 text-[#4cc185]" />
        </div>

        <h3 className="text-base font-semibold text-white">
            Arrastra tus imágenes aquí
        </h3>

        <p className="mt-2 text-sm text-white/50">
            O selecciona los archivos desde tu computadora
        </p>

        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 inline-flex items-center gap-2
                rounded-lg bg-[#006635] px-5 py-2.5
                text-sm font-semibold text-white
                transition hover:bg-[#087a43]"
        >
            <FolderOpen className="size-4" />
            Explorar imágenes
        </button>

        <p className="mt-4 text-xs text-white/40">
            JPG, PNG y WEBP · Máximo 5 MB por imagen
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
        <p role="alert" className="mt-3 text-sm text-red-400">
            {photoError}
        </p>
    )}

    <InputError message={errors.imagenes} />

    <div className="mt-5">
        <p className="mb-3 text-sm text-white/65">
            {photos.length} fotografía(s) seleccionada(s)
        </p>

        {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo, index) => (
                    <div
                        key={`${photo.file.name}-${photo.file.lastModified}-${index}`}
                        className="group relative overflow-hidden rounded-lg
                            border border-white/15 bg-[#111315]"
                    >
                        <img
                            src={photo.preview}
                            alt={photo.file.name}
                            className="h-32 w-full object-contain p-2"
                        />

                        <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            aria-label={`Eliminar ${photo.file.name}`}
                            className="absolute top-2 right-2 rounded-full
                                bg-black/80 p-1.5 text-white
                                transition hover:bg-red-600"
                        >
                            <X className="size-4" />
                        </button>

                        <p className="truncate border-t border-white/10
                            px-2 py-2 text-xs text-white/60"
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

                            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="submit"
                                    disabled={processing || modelos.length === 0 || fabricantes.length === 0}
                                    className="h-11 w-full gap-2 rounded-lg bg-[#006635] px-6 font-semibold text-white hover:bg-[#087a43] sm:w-auto"
                                >
                                    <Save className="size-4" />
                                    {processing ? 'Guardando...' : 'Guardar refacción'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
