import { Head, Link } from '@inertiajs/react';
import {
    Headphones,
    Home,
    ShieldCheck,
    Users,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home } from '@/routes';
import { index as equiposIndex } from '@/routes/equipos';
import { soporte } from '@/routes/mantenimiento';

type BibliotecaEquipo = {
    slug: string;
    name: string;
    brand: string;
    type: string;
    applications: string;
    status: string;
    image: string;
    category: string;
};

const MODALIDADES_HERO_IMAGE = '/Imagen/Body/Body.png';

const heroHighlights: {
    title: string;
    icon: LucideIcon;
}[] = [
    { title: 'Soporte especializado', icon: Wrench },
    { title: 'Ingenieros capacitados', icon: Users },
    { title: 'Atención en todo el país', icon: ShieldCheck },
    { title: 'Acompañamiento en cada etapa', icon: Headphones },
];

const placeholderColors = [
    '#0a7c4a',
    '#1e5f4a',
    '#2d6a4f',
    '#40916c',
    '#52b788',
    '#1b4332',
] as const;

function placeholderColorFor(slug: string): string {
    let hash = 0;

    for (let index = 0; index < slug.length; index++) {
        hash = (hash + slug.charCodeAt(index) * (index + 1)) % 997;
    }

    return placeholderColors[hash % placeholderColors.length];
}

function EquipoCard({ equipo }: { equipo: BibliotecaEquipo }) {
    const hasImage = equipo.image.trim() !== '';
    const color = placeholderColorFor(equipo.slug);
    const description =
        equipo.applications.trim() !== ''
            ? equipo.applications
            : 'Consulta el soporte y los equipos disponibles para esta modalidad.';

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
            <div
                className="flex h-36 items-center justify-center px-6 pt-4"
                style={hasImage ? undefined : { backgroundColor: color }}
            >
                {hasImage ? (
                    <img
                        src={equipo.image}
                        alt={equipo.name}
                        className="h-28 w-auto max-w-[78%] object-contain object-center"
                    />
                ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-3">
                <h2 className="text-lg font-bold leading-snug text-neutral-900">
                    {equipo.name}
                </h2>
                <p className="text-sm leading-relaxed text-neutral-500">
                    {description}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                    <Link
                        href={soporte.url({
                            query: { modalidad: equipo.slug },
                        })}
                        className="inline-flex items-center rounded-full px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        Ver soporte →
                    </Link>
                    <Link
                        href={equiposIndex.url(equipo.slug)}
                        className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50"
                    >
                        Ver equipos
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function ListaBibliotecaequipos({
    equipos,
}: {
    equipos: BibliotecaEquipo[];
}) {
    return (
        <>
            <Head title="Modalidades" />

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
                            <span
                                className="font-semibold text-white"
                                aria-current="page"
                            >
                                Modalidades
                            </span>
                        </nav>

                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
                            Modalidades
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                            Conoce los tipos de equipos que atendemos y consulta
                            el soporte disponible para cada modalidad. Nuestro
                            equipo te asesora en mantenimiento, instalación,
                            capacitación y más.
                        </p>

                        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
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
                                src={MODALIDADES_HERO_IMAGE}
                                alt=""
                                className="absolute inset-0 size-full scale-110 object-cover object-right opacity-50 blur-2xl [mask-image:linear-gradient(to_right,transparent_8%,black_42%)] [-webkit-mask-image:linear-gradient(to_right,transparent_8%,black_42%)]"
                            />
                            <img
                                src={MODALIDADES_HERO_IMAGE}
                                alt="Tomógrafo en sala de imagenología"
                                className="absolute inset-0 size-full object-cover object-right [mask-image:linear-gradient(to_right,transparent_12%,black_48%)] [-webkit-mask-image:linear-gradient(to_right,transparent_12%,black_48%)]"
                            />
                            <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-neutral-950 from-20% via-neutral-950/75 via-70% to-transparent" />
                        </div>

                        <div className="relative z-10 max-w-[16rem] pt-10 sm:pt-14 lg:pt-16">
                            <p className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                                “Equipos que cuidan más vidas”
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-white/75">
                                Tecnología, soporte y confianza médica
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-neutral-950 pb-12 sm:pb-14 lg:pb-16">
                <div className={`mx-auto ${CONTENT_WIDTH}`}>
                    {equipos.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/60">
                            Aún no hay modalidades publicadas.
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {equipos.map((equipo) => (
                                <EquipoCard
                                    key={equipo.slug}
                                    equipo={equipo}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
