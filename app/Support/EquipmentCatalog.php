<?php

namespace App\Support;

final class EquipmentCatalog
{
    /**
     * @return array<string, array{name: string, image: string, plural_title: string}>
     */
    public static function categories(): array
    {
        return [
            'ultrasonido' => [
                'name' => 'Ultrasonido',
                'plural_title' => 'Ultrasonidos disponibles',
                'image' => self::machineImage('Ultrasonido.png'),
            ],
            'rayos-x' => [
                'name' => 'Rayos X',
                'plural_title' => 'Equipos de Rayos X disponibles',
                'image' => self::machineImage('RayosX.png'),
            ],
            'mastografia' => [
                'name' => 'Mastografía',
                'plural_title' => 'Equipos de Mastografía disponibles',
                'image' => self::machineImage('MastoGrafia.png'),
            ],
            'arcos-en-c' => [
                'name' => 'Arcos en C',
                'plural_title' => 'Arcos en C disponibles',
                'image' => self::machineImage('Arcos en C.png'),
            ],
            'tomografia' => [
                'name' => 'Tomografía',
                'plural_title' => 'Tomógrafos disponibles',
                'image' => self::machineImage('TomoGrafia.png'),
            ],
            'resonancia-magnetica' => [
                'name' => 'Resonancia magnética',
                'plural_title' => 'Resonancias magnéticas disponibles',
                'image' => self::machineImage('Resonancia magnetica.png'),
            ],
            'angiografia' => [
                'name' => 'Angiografía',
                'plural_title' => 'Angiógrafos disponibles',
                'image' => self::machineImage('Angiografia.png'),
            ],
            'medicina-nuclear-e-imagen-molecular' => [
                'name' => 'Medicina nuclear e imagen molecular',
                'plural_title' => 'Equipos de medicina nuclear disponibles',
                'image' => self::machineImage('medicina nuclear e imagen molecular.png'),
            ],
        ];
    }

    /**
     * @deprecated Use categories() or findCategory()
     *
     * @return array<string, array{name: string, image: string}>
     */
    public static function all(): array
    {
        return self::categories();
    }

    /**
     * @return array{name: string, image: string, slug: string, plural_title: string}|null
     */
    public static function findCategory(string $slug): ?array
    {
        $category = self::categories()[$slug] ?? null;

        if ($category === null) {
            return null;
        }

        return [
            ...$category,
            'slug' => $slug,
        ];
    }

    /**
     * @return array{name: string, image: string, slug: string}|null
     */
    public static function find(string $slug): ?array
    {
        $product = self::findProduct($slug);

        if ($product !== null) {
            return [
                'name' => $product['name'],
                'image' => $product['image'],
                'slug' => $product['slug'],
            ];
        }

        $category = self::findCategory($slug);

        if ($category === null || $slug === 'ultrasonido') {
            return null;
        }

        return [
            'name' => $category['name'],
            'image' => $category['image'],
            'slug' => $category['slug'],
        ];
    }

    /**
     * @return list<array{
     *     slug: string,
     *     name: string,
     *     brand: string,
     *     type: string,
     *     applications: string,
     *     status: string,
     *     image: string,
     *     category: string
     * }>
     */
    public static function productsForCategory(string $category): array
    {
        return array_values(array_filter(
            self::products(),
            fn (array $product): bool => $product['category'] === $category
        ));
    }

    /**
     * @return array{
     *     slug: string,
     *     name: string,
     *     brand: string,
     *     type: string,
     *     applications: string,
     *     status: string,
     *     image: string,
     *     category: string
     * }|null
     */
    public static function findProduct(string $slug): ?array
    {
        return self::products()[$slug] ?? null;
    }

    /**
     * @return array<string, array{
     *     slug: string,
     *     name: string,
     *     brand: string,
     *     type: string,
     *     applications: string,
     *     status: string,
     *     image: string,
     *     category: string
     * }>
     */
    public static function products(): array
    {
        $image = self::machineImage('Ultrasonido.png');

        return [
            'acuson-sequoia' => [
                'slug' => 'acuson-sequoia',
                'name' => 'ACUSON Sequoia',
                'brand' => 'Siemens Healthineers',
                'type' => 'Tipo carro',
                'applications' => 'Cardiología, Vascular, Imagen general',
                'status' => 'available',
                'image' => $image,
                'category' => 'ultrasonido',
            ],
            'logiq-e10' => [
                'slug' => 'logiq-e10',
                'name' => 'LOGIQ E10',
                'brand' => 'GE Healthcare',
                'type' => 'Tipo carro',
                'applications' => 'Radiología, Obstetricia, Músculo-esquelético',
                'status' => 'available',
                'image' => $image,
                'category' => 'ultrasonido',
            ],
            'epiq-elite' => [
                'slug' => 'epiq-elite',
                'name' => 'EPIQ Elite',
                'brand' => 'Philips',
                'type' => 'Tipo carro',
                'applications' => 'Cardiología, Pediatría, Vascular',
                'status' => 'on_order',
                'image' => $image,
                'category' => 'ultrasonido',
            ],
            'aplio-i800' => [
                'slug' => 'aplio-i800',
                'name' => 'Aplio i800',
                'brand' => 'Canon Medical',
                'type' => 'Tipo carro',
                'applications' => 'Imagen general, Abdomen, Ginecología',
                'status' => 'available',
                'image' => $image,
                'category' => 'ultrasonido',
            ],
        ];
    }

    /**
     * Categories that open a public listing page instead of a direct detail page.
     *
     * @return list<string>
     */
    public static function listingCategories(): array
    {
        return ['ultrasonido'];
    }

    public static function hasListing(string $slug): bool
    {
        return in_array($slug, self::listingCategories(), true);
    }

    private static function machineImage(string $filename): string
    {
        return '/Imagen/Maquinas/'.rawurlencode($filename);
    }
}
