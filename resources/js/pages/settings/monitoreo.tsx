import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    ExternalLink,
    FileCode2,
    Map,
    TriangleAlert,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { monitoreo as adminMonitoreo } from '@/routes/admin';

type SitemapEntry = {
    loc: string;
    lastmod: string | null;
    changefreq: string;
    priority: string;
    group: string;
    label: string;
};

type SitemapGroup = {
    key: string;
    label: string;
    count: number;
};

type SeoCheck = {
    key: string;
    title: string;
    status: 'ok' | 'warning';
    detail: string;
};

type PageProps = {
    sitemapUrl: string;
    robotsUrl: string;
    totalUrls: number;
    groups: SitemapGroup[];
    entries: SitemapEntry[];
    checks: SeoCheck[];
};

const groupLabels: Record<string, string> = {
    static: 'Páginas estáticas',
    categories: 'Categorías de equipos',
    models: 'Modelos de equipos',
};

export default function Monitoreo({
    sitemapUrl,
    robotsUrl,
    totalUrls,
    groups,
    entries,
    checks,
}: PageProps) {
    return (
        <>
            <Head title="Monitoreo SEO" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Monitoreo SEO"
                    description="Revise el sitemap del sitio, robots.txt y las URLs públicas que los buscadores pueden indexar."
                />

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold tracking-wider text-[#0a7c4a]">
                                SITEMAP
                            </p>
                            <h2 className="mt-2 text-lg font-semibold text-foreground">
                                ¿Qué es el sitemap y para qué sirve?
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                El <strong>sitemap.xml</strong> es un mapa del
                                sitio en formato XML. Lista las páginas
                                importantes (inicio, categorías, modelos, etc.)
                                para que Google y otros buscadores las
                                descubran más rápido. No garantiza el ranking,
                                pero evita que queden páginas huérfanas sin
                                rastrear.
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Se actualiza <strong>en automático</strong>:
                                cada vez que registra o activa un equipo
                                (categoría) o un modelo de equipo, su URL
                                pública entra al sitemap en la siguiente
                                visita a{' '}
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    /sitemap.xml
                                </code>
                                . No hay que regenerar archivos a mano.
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                El archivo <strong>robots.txt</strong> indica
                                reglas básicas a los bots y, con la línea{' '}
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    Sitemap:
                                </code>
                                , les apunta la URL absoluta del mapa.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                                <a
                                    href={sitemapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FileCode2 className="size-4" />
                                    Ver sitemap.xml
                                    <ExternalLink className="size-3.5" />
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <a
                                    href={robotsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Map className="size-4" />
                                    Ver robots.txt
                                    <ExternalLink className="size-3.5" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground">
                                URLs indexables
                            </p>
                            <Activity className="size-4 text-[#0a7c4a]" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-foreground">
                            {totalUrls}
                        </p>
                    </div>
                    {groups.map((group) => (
                        <div
                            key={group.key}
                            className="rounded-xl border border-border bg-card p-4 shadow-sm"
                        >
                            <p className="text-sm text-muted-foreground">
                                {group.label}
                            </p>
                            <p className="mt-3 text-3xl font-bold text-foreground">
                                {group.count}
                            </p>
                        </div>
                    ))}
                </div>

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-foreground">
                        Estado SEO
                    </h2>
                    <ul className="mt-4 space-y-3">
                        {checks.map((check) => (
                            <li
                                key={check.key}
                                className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                            >
                                {check.status === 'ok' ? (
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7c4a]" />
                                ) : (
                                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {check.title}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {check.detail}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-foreground">
                            URLs del sitemap
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Se refresca solo al registrar o activar equipos y
                            modelos
                        </p>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[40rem] text-left text-sm">
                            <thead className="border-b border-border text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-2 py-2 font-medium">
                                        Página
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                        Grupo
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                        Prioridad
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                        Frecuencia
                                    </th>
                                    <th className="px-2 py-2 font-medium">
                                        URL
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => (
                                    <tr
                                        key={entry.loc}
                                        className="border-b border-border last:border-0"
                                    >
                                        <td className="px-2 py-2.5 font-medium text-foreground">
                                            {entry.label}
                                        </td>
                                        <td className="px-2 py-2.5 text-muted-foreground">
                                            {groupLabels[entry.group] ??
                                                entry.group}
                                        </td>
                                        <td className="px-2 py-2.5 text-muted-foreground">
                                            {entry.priority}
                                        </td>
                                        <td className="px-2 py-2.5 text-muted-foreground">
                                            {entry.changefreq}
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <a
                                                href={entry.loc}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="break-all text-[#0a7c4a] hover:underline"
                                            >
                                                {entry.loc}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}

Monitoreo.layout = {
    breadcrumbs: [
        {
            title: 'Monitoreo',
            href: adminMonitoreo(),
        },
    ],
};
