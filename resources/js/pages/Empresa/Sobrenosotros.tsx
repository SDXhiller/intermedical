import { Head } from '@inertiajs/react';
import {
    Award,
    Compass,
    Eye,
    Gem,
    Handshake,
    Heart,
    MapPin,
    Scale,
    Settings,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';

const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';
const OBJETIVO_IMAGE = `/Imagen/Sobrenosotros/${encodeURIComponent('ChatGPT Image 22 ago 2026, 06_56_54 p.m..png')}`;
const MISION_IMAGE = `/Imagen/Sobrenosotros/${encodeURIComponent('ChatGPT Image 22 ago 2026, 06_17_56 p.m..png')}`;
const VISION_IMAGE = `/Imagen/Sobrenosotros/${encodeURIComponent('ChatGPT Image 22 ago 2026, 10_40_55 p.m..png')}`;

const quickLinks: { id: string; label: string; icon: LucideIcon }[] = [
    { id: 'objetivo', label: 'OBJETIVO', icon: Target },
    { id: 'mision', label: 'MISIÓN', icon: Compass },
    { id: 'vision', label: 'VISIÓN', icon: Eye },
    { id: 'valores', label: 'VALORES', icon: Gem },
];

const objetivoTags: { label: string; icon: LucideIcon }[] = [
    { label: 'Ética', icon: Scale },
    { label: 'Seguridad', icon: ShieldCheck },
    { label: 'Excelencia', icon: Award },
    { label: 'Mejora continua', icon: TrendingUp },
];

const misionTags: { label: string; icon: LucideIcon }[] = [
    { label: 'Ingeniería', icon: Wrench },
    { label: 'Innovación', icon: Sparkles },
    { label: 'Servicio cercano', icon: Heart },
];

const visionTags: { label: string; icon: LucideIcon }[] = [
    { label: 'México', icon: MapPin },
    { label: 'Innovación', icon: Sparkles },
    { label: 'Crecimiento', icon: TrendingUp },
    { label: 'Impacto humano', icon: Users },
];

const valores: { title: string; description: string; icon: LucideIcon }[] = [
    {
        title: 'Compromiso',
        description:
            'Nos involucramos con cada proyecto hasta lograr resultados confiables y oportunos.',
        icon: Handshake,
    },
    {
        title: 'Profesionalismo',
        description:
            'Aplicamos criterios técnicos rigurosos en cada intervención y asesoría.',
        icon: Settings,
    },
    {
        title: 'Responsabilidad',
        description:
            'Cuidamos equipos, procesos y personas con un sentido claro de deber.',
        icon: ShieldCheck,
    },
    {
        title: 'Honestidad',
        description:
            'Comunicamos con claridad y transparencia en cada etapa del servicio.',
        icon: Scale,
    },
    {
        title: 'Servicio',
        description:
            'Acompañamos a nuestros clientes con atención cercana y soluciones útiles.',
        icon: Heart,
    },
    {
        title: 'Lealtad',
        description:
            'Construimos relaciones duraderas basadas en confianza y excelencia.',
        icon: Gem,
    },
];

function ImagePlaceholder({
    label,
    className = '',
}: {
    label: string;
    className?: string;
}) {
    return (
        <div
            className={`flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-[#0a7c4a]/35 bg-[#0a7c4a]/5 ${className}`}
        >
            <p className="px-4 text-center text-xs tracking-wide text-[#0a7c4a]/80 uppercase sm:text-sm">
                Imagen pendiente
                <span className="mt-1 block text-[10px] normal-case tracking-normal text-white/40">
                    {label}
                </span>
            </p>
        </div>
    );
}

function BlendedPillarImage({
    src,
    alt,
    fadeTo = 'right',
    className = '',
    focus = '22% 48%',
}: {
    src: string;
    alt: string;
    fadeTo?: 'left' | 'right';
    className?: string;
    focus?: string;
}) {
    const sideFade =
        fadeTo === 'right'
            ? 'bg-gradient-to-r from-transparent from-35% via-neutral-950/55 via-70% to-neutral-950'
            : 'bg-gradient-to-l from-transparent from-35% via-neutral-950/55 via-70% to-neutral-950';

    return (
        <div
            className={`pointer-events-none absolute overflow-hidden ${className || 'inset-0'}`}
        >
            <img
                src={src}
                alt={alt}
                className="absolute inset-0 size-full object-cover opacity-75"
                style={{ objectPosition: focus }}
            />
            <div className={`absolute inset-0 ${sideFade}`} aria-hidden="true" />
            <div
                className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-neutral-950 to-transparent"
                aria-hidden="true"
            />
            <div
                className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950 to-transparent"
                aria-hidden="true"
            />
        </div>
    );
}

function TagRow({
    tags,
}: {
    tags: { label: string; icon: LucideIcon }[];
}) {
    return (
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
            {tags.map(({ label, icon: Icon }) => (
                <li
                    key={label}
                    className="inline-flex items-center gap-2 text-xs font-medium text-white/85 sm:text-sm"
                >
                    <span
                        className="flex size-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${BRAND_COLOR}22` }}
                    >
                        <Icon
                            className="size-3.5"
                            style={{ color: BRAND_COLOR }}
                            strokeWidth={1.75}
                        />
                    </span>
                    {label}
                </li>
            ))}
        </ul>
    );
}

function DigitalLinesBackdrop({ className = '' }: { className?: string }) {
    return (
        <div
            className={`pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen ${className}`}
            aria-hidden="true"
        >
            <div className="absolute inset-y-0 left-0 w-[200%] motion-safe:animate-digital-lines-drift">
                <div className="digital-lines-pattern absolute inset-0 opacity-40" />
            </div>
            <div className="absolute inset-0 opacity-55">
                <span className="digital-pulse-beam absolute top-[12%] left-0 h-px w-2/5 motion-safe:animate-digital-pulse-sweep" />
                <span
                    className="digital-pulse-beam absolute top-[28%] left-0 h-px w-1/3 motion-safe:animate-digital-pulse-sweep-slow"
                    style={{ animationDelay: '1.2s' }}
                />
                <span
                    className="digital-pulse-beam absolute top-[46%] left-0 h-px w-[45%] motion-safe:animate-digital-pulse-sweep"
                    style={{ animationDelay: '2.4s' }}
                />
                <span
                    className="digital-pulse-beam absolute top-[64%] left-0 h-px w-1/4 motion-safe:animate-digital-pulse-sweep-slow"
                    style={{ animationDelay: '0.6s' }}
                />
                <span
                    className="digital-pulse-beam absolute top-[82%] left-0 h-px w-[38%] motion-safe:animate-digital-pulse-sweep"
                    style={{ animationDelay: '3.1s' }}
                />
            </div>
        </div>
    );
}

function PillarSection({
    id,
    title,
    description,
    tags,
    imageLabel,
    imageLeft,
    imageSrc,
    imageAlt,
    imageFocus,
}: {
    id: string;
    title: string;
    description: ReactNode;
    tags: { label: string; icon: LucideIcon }[];
    imageLabel: string;
    imageLeft: boolean;
    imageSrc?: string;
    imageAlt?: string;
    imageFocus?: string;
}) {
    const content = (
        <div className="relative z-10 max-w-md lg:max-w-lg">
            <p
                className="text-sm font-bold tracking-[0.12em]"
                style={{ color: BRAND_COLOR }}
            >
                {title}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
                {description}
            </p>
            <TagRow tags={tags} />
        </div>
    );

    if (imageSrc) {
        return (
            <section
                id={id}
                className="relative z-10 w-full scroll-mt-40"
            >
                <div className="relative isolate min-h-[280px] w-full overflow-hidden sm:min-h-[340px] lg:min-h-[420px]">
                    <BlendedPillarImage
                        src={imageSrc}
                        alt={imageAlt ?? imageLabel}
                        fadeTo={imageLeft ? 'right' : 'left'}
                        focus={
                            imageFocus ??
                            (imageLeft ? '18% 48%' : '82% 48%')
                        }
                        className="inset-0"
                    />
                    <div
                        className={`relative z-10 mx-auto flex min-h-[280px] w-full items-center px-[4%] py-10 sm:min-h-[340px] lg:min-h-[420px] ${
                            imageLeft ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {content}
                    </div>
                </div>
            </section>
        );
    }

    const media = <ImagePlaceholder label={imageLabel} />;

    return (
        <section id={id} className="scroll-mt-40">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
                {imageLeft ? (
                    <>
                        {media}
                        {content}
                    </>
                ) : (
                    <>
                        <div className="lg:order-2">{media}</div>
                        <div className="lg:order-1">{content}</div>
                    </>
                )}
            </div>
        </section>
    );
}

export default function Sobrenosotros() {
    return (
        <>
            <Head title="Sobre nosotros" />

            <div className="relative isolate overflow-x-clip bg-neutral-950 text-white">
                <DigitalLinesBackdrop className="z-0" />

                <nav className="sticky top-[4.5rem] z-40 border-b border-white/10 bg-neutral-950/95 backdrop-blur sm:top-[4.75rem]">
                    <div
                        className={`mx-auto flex ${CONTENT_WIDTH} flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 sm:justify-start sm:gap-x-8`}
                    >
                        {quickLinks.map(({ id, label, icon: Icon }) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-white/75 transition hover:text-[#0a7c4a] sm:text-sm"
                            >
                                <Icon
                                    className="size-3.5"
                                    style={{ color: BRAND_COLOR }}
                                    strokeWidth={1.75}
                                />
                                {label}
                            </a>
                        ))}
                    </div>
                </nav>

                <section className="relative z-10 min-h-[450px] overflow-hidden">
                    <div className="pointer-events-none absolute inset-0">
                        <img
                            src={`/Imagen/Sobrenosotros/${encodeURIComponent('ChatGPT Image 22 ago 2026, 06_17_56 p.m..png')}`}
                            alt="Técnico de Medical Imaging Group realizando mantenimiento a equipo de imagen médica"
                            className="absolute inset-0 size-full scale-110 object-cover object-[55%_center] sm:object-[48%_center] lg:object-[42%_center]"
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/20 sm:via-neutral-950/75 sm:to-transparent lg:from-neutral-950 lg:via-neutral-950/70 lg:to-transparent"
                            aria-hidden="true"
                        />
                        <div
                            className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-neutral-950 to-transparent"
                            aria-hidden="true"
                        />
                        <div
                            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent"
                            aria-hidden="true"
                        />
                        <div
                            className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-neutral-950/90 to-transparent"
                            aria-hidden="true"
                        />
                    </div>

                    <div
                        className={`relative z-10 mx-auto grid min-h-[450px] ${CONTENT_WIDTH} items-center gap-6 py-6 sm:gap-8 lg:grid-cols-2 lg:gap-10`}
                    >
                        <div className="flex flex-col justify-center">
                            <p
                                className="text-xs font-bold tracking-[0.16em] uppercase"
                                style={{ color: BRAND_COLOR }}
                            >
                                Sobre nosotros
                            </p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
                                Sobre Medical Imaging Group
                            </h1>
                            <p
                                className="mt-3 text-sm font-medium sm:text-base"
                                style={{ color: `${BRAND_COLOR}` }}
                            >
                                Ingeniería, tecnología y compromiso con la
                                imagen médica.
                            </p>
                            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
                                Trabajamos para mantener la tecnología médica
                                disponible, segura y confiable.
                            </p>
                        </div>
                        <div className="flex items-center justify-end">
                            <div className="relative isolate flex h-[280px] w-full max-w-[520px] items-center justify-center [perspective:900px] sm:h-[360px] lg:h-[420px]">
                                <div
                                    className="pointer-events-none absolute inset-[12%] rounded-full opacity-50 blur-2xl"
                                    style={{
                                        background: `radial-gradient(circle, ${BRAND_COLOR}55 0%, transparent 70%)`,
                                    }}
                                    aria-hidden="true"
                                />

                                <div
                                    className="pointer-events-none absolute inset-[2%] [transform:rotateX(68deg)_rotateZ(-28deg)]"
                                    aria-hidden="true"
                                >
                                    <div
                                        className="relative size-full rounded-full border-[2px] border-[#0a7c4a] motion-safe:animate-orbit-spin"
                                        style={
                                            {
                                                '--orbit-duration': '14s',
                                            } as CSSProperties
                                        }
                                    >
                                        <span
                                            className="absolute top-0 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_18px_rgba(10,124,74,1)]"
                                            style={{
                                                backgroundColor: BRAND_COLOR,
                                            }}
                                        />
                                        <span className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)]" />
                                    </div>
                                </div>

                                <div
                                    className="pointer-events-none absolute inset-[8%] [transform:rotateX(68deg)_rotateZ(38deg)]"
                                    aria-hidden="true"
                                >
                                    <div
                                        className="relative size-full rounded-full border-[2px] border-white motion-safe:animate-orbit-spin-reverse"
                                        style={
                                            {
                                                '--orbit-duration': '18s',
                                            } as CSSProperties
                                        }
                                    >
                                        <span className="absolute top-0 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,1)]" />
                                        <span
                                            className="absolute top-1/2 right-0 size-4 translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_rgba(10,124,74,1)]"
                                            style={{
                                                backgroundColor: BRAND_COLOR,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    className="pointer-events-none absolute inset-[16%] [transform:rotateX(72deg)_rotateZ(8deg)]"
                                    aria-hidden="true"
                                >
                                    <div
                                        className="relative size-full rounded-full border-[2px] border-[#0a7c4a] motion-safe:animate-orbit-spin"
                                        style={
                                            {
                                                '--orbit-duration': '10s',
                                            } as CSSProperties
                                        }
                                    >
                                        <span
                                            className="absolute top-0 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_rgba(10,124,74,1)]"
                                            style={{
                                                backgroundColor: BRAND_COLOR,
                                            }}
                                        />
                                    </div>
                                </div>

                                <img
                                    src={MIG_HORIZONTAL_WHITE}
                                    alt="Medical Imaging Group"
                                    className="relative z-10 h-[52%] w-auto max-w-[82%] object-contain drop-shadow-[0_0_28px_rgba(10,124,74,0.35)] sm:h-[58%]"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className={`relative z-10 mx-auto ${CONTENT_WIDTH} py-10 text-center sm:py-12`}
                >
                    <h2 className="text-lg font-bold tracking-[0.14em] uppercase sm:text-xl">
                        Conozca quiénes somos
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                        Detrás de cada equipo de imagen médica hay una decisión
                        clínica y una persona que merece atención confiable.
                        Combinamos ingeniería especializada, innovación y
                        compromiso humano, actuando con ética, transparencia y
                        calidad en cada servicio.
                    </p>
                </section>

                <div className="relative z-10 flex w-full flex-col gap-[50px]">
                    <PillarSection
                        id="objetivo"
                        title="OBJETIVO"
                        imageLabel="Objetivo"
                        imageSrc={OBJETIVO_IMAGE}
                        imageAlt="Diana con dardo en el centro, símbolo de precisión y objetivo en imagen médica"
                        imageLeft
                        imageFocus="18% 48%"
                        tags={objetivoTags}
                        description={
                            <>
                                Establecer los principios, valores y
                                lineamientos que orientan el actuar de Medical
                                Imaging Group, promoviendo una cultura de{' '}
                                <strong className="font-semibold text-white">
                                    ética, responsabilidad, seguridad,
                                    excelencia técnica y mejora continua
                                </strong>{' '}
                                en cada una de nuestras actividades.
                            </>
                        }
                    />

                    <PillarSection
                        id="mision"
                        title="MISIÓN"
                        imageLabel="Misión"
                        imageSrc={MISION_IMAGE}
                        imageAlt="Técnico de Medical Imaging Group realizando mantenimiento a equipo de imagen médica"
                        imageLeft={false}
                        imageFocus="62% 42%"
                        tags={misionTags}
                        description="Mantener la tecnología de imagen médica segura, confiable y disponible, mediante ingeniería especializada, innovación y un servicio cercano que contribuya a una atención médica eficiente y oportuna."
                    />

                    <PillarSection
                        id="vision"
                        title="VISIÓN"
                        imageLabel="Visión"
                        imageSrc={VISION_IMAGE}
                        imageAlt="Especialista observando el horizonte con tecnología de imagen médica y un mapa holográfico de México"
                        imageLeft
                        imageFocus="42% 40%"
                        tags={visionTags}
                        description="Ser una empresa referente en México en ingeniería y soporte de tecnología de diagnóstico por imagen, reconocida por su innovación, experiencia y compromiso con una atención médica más confiable y accesible."
                    />
                </div>

                <div
                    className={`relative z-10 mx-auto ${CONTENT_WIDTH} space-y-8 pb-12 pt-8 sm:space-y-10 sm:pb-14 sm:pt-10 lg:pb-16`}
                >
                    <section id="valores" className="scroll-mt-40">
                        <p
                            className="text-sm font-bold tracking-[0.12em]"
                            style={{ color: BRAND_COLOR }}
                        >
                            NUESTROS VALORES
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
                            {valores.map(
                                ({ title, description, icon: Icon }) => (
                                    <article
                                        key={title}
                                        className="flex gap-4 rounded-2xl border border-white/10 bg-neutral-950/80 p-5"
                                    >
                                        <span
                                            className="flex size-11 shrink-0 items-center justify-center rounded-full"
                                            style={{
                                                backgroundColor: `${BRAND_COLOR}22`,
                                            }}
                                        >
                                            <Icon
                                                className="size-5"
                                                style={{ color: BRAND_COLOR }}
                                                strokeWidth={1.75}
                                            />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold text-white">
                                                {title}
                                            </h3>
                                            <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                                                {description}
                                            </p>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
