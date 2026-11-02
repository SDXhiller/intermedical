import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Headphones,
    Home,
    Layers,
    ShieldCheck,
    Users,
    Wrench,
} from 'lucide-react';
import { SiteBreadcrumb } from '@/components/site-breadcrumb';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { home } from '@/routes';
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
        <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0b0f0d] shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-[#006635]/80 hover:shadow-[0_8px_28px_rgba(0,102,53,0.18)]">
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-[#006635]/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div
                className="relative z-10 flex h-32 items-center justify-center overflow-hidden bg-transparent px-5"
                style={hasImage ? undefined : { backgroundColor: color }}
            >
                {hasImage ? (
                    <img
                        src={equipo.image}
                        alt={equipo.name}
                        className="h-24 w-auto max-w-[78%] object-contain object-center transition-transform duration-300 group-hover:scale-105"
                    />
                ) : null}
            </div>

            <div className="relative z-10 flex flex-1 flex-col gap-1.5 px-4 pt-3 pb-4">
                <h2
                    className="text-base font-bold leading-snug"
                    style={{ color: BRAND_COLOR }}
                >
                    {equipo.name}
                </h2>
                <p className="text-sm leading-relaxed text-white/60">
                    {description}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                    <Link
                        href={soporte.url({
                            query: { modalidad: equipo.slug },
                        })}
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition hover:opacity-90"
                        style={{ backgroundColor: BRAND_COLOR }}
                    >
                        solicitar soporte
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
                    className={`relative mx-auto py-10 sm:py-12 lg:py-14 ${CONTENT_WIDTH}`}
                >
                    <div className="relative z-10 max-w-xl lg:max-w-[52%]">
                        <SiteBreadcrumb
                            items={[
                                { label: 'Inicio', href: home.url(), icon: Home },
                                { label: 'Modalidades', icon: Layers },
                            ]}
                        />

                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
                            Modalidades
                        </h1>
                        <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                            Conoce los tipos de equipos que atendemos y consulta
                            el soporte disponible para cada modalidad. Nuestro
                            equipo te asesora en mantenimiento, instalación,
                            capacitación y más.
                        </p>
                    </div>

                    <div className="relative mt-7 grid grid-cols-[minmax(0,1.15fr)_minmax(8.5rem,0.9fr)] items-center gap-3 sm:mt-8 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch lg:gap-10">
                        <ul className="relative z-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:content-center">
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

                        <div className="relative min-h-[168px] overflow-hidden sm:min-h-[220px] lg:min-h-[280px]">
                            <div
                                className="pointer-events-none absolute inset-0"
                                aria-hidden="true"
                            >
                                <img
                                    src={MODALIDADES_HERO_IMAGE}
                                    alt=""
                                    className="absolute inset-0 size-full scale-110 object-cover object-center opacity-50 blur-2xl sm:object-right lg:[mask-image:linear-gradient(to_right,transparent_8%,black_42%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_8%,black_42%)]"
                                />
                                <img
                                    src={MODALIDADES_HERO_IMAGE}
                                    alt="Tomógrafo en sala de imagenología"
                                    className="absolute inset-0 size-full object-cover object-center sm:object-right lg:[mask-image:linear-gradient(to_right,transparent_12%,black_48%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_12%,black_48%)]"
                                />
                                <div className="absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-neutral-950 from-10% via-neutral-950/70 via-65% to-transparent sm:w-[36%] lg:w-[42%] lg:from-20% lg:via-70%" />
                            </div>
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
