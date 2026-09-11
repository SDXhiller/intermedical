<?php

namespace App\Support;

use App\Models\EquipoModulo;
use App\Models\Modulo;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Builds the public sitemap from live catalog data.
 *
 * Entries are queried on every request, so newly registered or updated
 * active equipment categories and models appear automatically without a
 * separate regeneration step.
 */
final class SitemapBuilder
{
    /**
     * Public indexable URLs for search engines.
     *
     * @return list<array{loc: string, lastmod: string|null, changefreq: string, priority: string, group: string, label: string}>
     */
    public function entries(): array
    {
        return $this->staticPages()
            ->concat($this->equipmentCategories())
            ->concat($this->equipmentModels())
            ->values()
            ->all();
    }

    /**
     * Summary metrics for the admin monitoring panel.
     *
     * @return array{
     *     sitemapUrl: string,
     *     robotsUrl: string,
     *     totalUrls: int,
     *     groups: list<array{key: string, label: string, count: int}>,
     *     entries: list<array{loc: string, lastmod: string|null, changefreq: string, priority: string, group: string, label: string}>,
     *     checks: list<array{key: string, title: string, status: string, detail: string}>
     * }
     */
    public function overview(): array
    {
        $entries = $this->entries();
        $groups = collect($entries)
            ->groupBy('group')
            ->map(fn (Collection $items, string $key): array => [
                'key' => $key,
                'label' => match ($key) {
                    'static' => 'Páginas estáticas',
                    'categories' => 'Categorías de equipos',
                    'models' => 'Modelos de equipos',
                    default => $key,
                },
                'count' => $items->count(),
            ])
            ->values()
            ->all();

        return [
            'sitemapUrl' => route('sitemap'),
            'robotsUrl' => route('robots'),
            'totalUrls' => count($entries),
            'groups' => $groups,
            'entries' => $entries,
            'checks' => [
                [
                    'key' => 'sitemap',
                    'title' => 'Sitemap XML',
                    'status' => 'ok',
                    'detail' => 'Disponible en '.route('sitemap').' con '.count($entries).' URLs indexables.',
                ],
                [
                    'key' => 'robots',
                    'title' => 'robots.txt',
                    'status' => 'ok',
                    'detail' => 'Incluye la directiva Sitemap absoluta para que los buscadores descubran el mapa.',
                ],
                [
                    'key' => 'models',
                    'title' => 'Modelos públicos',
                    'status' => collect($entries)->where('group', 'models')->isNotEmpty() ? 'ok' : 'warning',
                    'detail' => 'Solo se publican modelos activos con slug válido.',
                ],
                [
                    'key' => 'auto',
                    'title' => 'Actualización automática',
                    'status' => 'ok',
                    'detail' => 'Cada alta, edición o cambio de estatus de equipos y modelos activos se refleja al instante en /sitemap.xml (sin regenerar archivos).',
                ],
            ],
        ];
    }

    public function toXml(): string
    {
        $lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ];

        foreach ($this->entries() as $entry) {
            $lines[] = '  <url>';
            $lines[] = '    <loc>'.e($entry['loc']).'</loc>';

            if ($entry['lastmod'] !== null) {
                $lines[] = '    <lastmod>'.e($entry['lastmod']).'</lastmod>';
            }

            $lines[] = '    <changefreq>'.e($entry['changefreq']).'</changefreq>';
            $lines[] = '    <priority>'.e($entry['priority']).'</priority>';
            $lines[] = '  </url>';
        }

        $lines[] = '</urlset>';

        return implode("\n", $lines)."\n";
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string, group: string, label: string}>
     */
    private function staticPages(): Collection
    {
        $now = now()->toAtomString();

        return collect([
            $this->entry(route('home'), 'Inicio', 'static', 'daily', '1.0', $now),
            $this->entry(route('mantenimiento'), 'Mantenimiento', 'static', 'weekly', '0.8', $now),
            $this->entry(route('sobre-nosotros'), 'Sobre nosotros', 'static', 'monthly', '0.7', $now),
            $this->entry(route('contacto'), 'Contacto', 'static', 'monthly', '0.7', $now),
            $this->entry(route('cliente-cotisacion.create'), 'Cotización', 'static', 'weekly', '0.6', $now),
        ]);
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string, group: string, label: string}>
     */
    private function equipmentCategories(): Collection
    {
        return Modulo::query()
            ->activos()
            ->orderBy('modulo')
            ->get(['modulo', 'slug', 'updated_at'])
            ->map(fn (Modulo $modulo): array => $this->entry(
                route('equipos.index', ['category' => $modulo->slug]),
                $modulo->modulo,
                'categories',
                'weekly',
                '0.8',
                $this->atom($modulo->updated_at),
            ));
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string, group: string, label: string}>
     */
    private function equipmentModels(): Collection
    {
        return EquipoModulo::query()
            ->where('activo', true)
            ->whereNotNull('slug')
            ->where('slug', '!=', '')
            ->orderBy('modelo')
            ->get(['modelo', 'slug', 'updated_at'])
            ->map(fn (EquipoModulo $equipo): array => $this->entry(
                route('modulos.show', ['slug' => $equipo->slug]),
                $equipo->modelo,
                'models',
                'weekly',
                '0.7',
                $this->atom($equipo->updated_at),
            ));
    }

    /**
     * @return array{loc: string, lastmod: string|null, changefreq: string, priority: string, group: string, label: string}
     */
    private function entry(
        string $loc,
        string $label,
        string $group,
        string $changefreq,
        string $priority,
        ?string $lastmod,
    ): array {
        return [
            'loc' => $loc,
            'label' => $label,
            'group' => $group,
            'changefreq' => $changefreq,
            'priority' => $priority,
            'lastmod' => $lastmod,
        ];
    }

    private function atom(?CarbonInterface $date): ?string
    {
        return $date?->toAtomString();
    }
}
