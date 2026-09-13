<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * @var list<array{nombre: string, slug: string}>
     */
    private array $tipos = [
        [
            'nombre' => 'Mantenimiento preventivo',
            'slug' => 'mantenimiento-preventivo',
        ],
        [
            'nombre' => 'Mantenimiento correctivo',
            'slug' => 'mantenimiento-correctivo',
        ],
        [
            'nombre' => 'Diagnóstico',
            'slug' => 'diagnostico',
        ],
        [
            'nombre' => 'Renta de equipos médicos',
            'slug' => 'renta-de-equipos-medicos',
        ],
        [
            'nombre' => 'Instalación',
            'slug' => 'instalacion',
        ],
        [
            'nombre' => 'Desinstalación',
            'slug' => 'desinstalacion',
        ],
        [
            'nombre' => 'Puesta en marcha',
            'slug' => 'puesta-en-marcha',
        ],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();
        $desiredSlugs = collect($this->tipos)->pluck('slug');

        foreach ($this->tipos as $tipo) {
            $existing = DB::table('tipo_servicio_mantenimiento')
                ->where('slug', $tipo['slug'])
                ->first();

            if ($existing === null) {
                DB::table('tipo_servicio_mantenimiento')->insert([
                    'nombre' => $tipo['nombre'],
                    'slug' => $tipo['slug'],
                    'activo' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                continue;
            }

            DB::table('tipo_servicio_mantenimiento')
                ->where('id', $existing->id)
                ->update([
                    'nombre' => $tipo['nombre'],
                    'activo' => true,
                    'updated_at' => $now,
                ]);
        }

        $instalacionId = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'instalacion')
            ->value('id');

        $legacyInstalacionId = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'instalacion-y-puesta-en-marcha')
            ->value('id');

        if ($instalacionId !== null && $legacyInstalacionId !== null) {
            DB::table('servicios')
                ->where('tipo_servicio_mantenimiento_id', $legacyInstalacionId)
                ->update([
                    'tipo_servicio_mantenimiento_id' => $instalacionId,
                    'updated_at' => $now,
                ]);
        }

        $preventivoId = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'mantenimiento-preventivo')
            ->value('id');

        $legacyCapacitacionId = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'capacitacion-tecnica')
            ->value('id');

        if ($preventivoId !== null && $legacyCapacitacionId !== null) {
            DB::table('servicios')
                ->where('tipo_servicio_mantenimiento_id', $legacyCapacitacionId)
                ->update([
                    'tipo_servicio_mantenimiento_id' => $preventivoId,
                    'updated_at' => $now,
                ]);
        }

        DB::table('tipo_servicio_mantenimiento')
            ->whereNotIn('slug', $desiredSlugs->all())
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $now = now();

        $legacyTipos = [
            [
                'nombre' => 'Instalación y puesta en marcha',
                'slug' => 'instalacion-y-puesta-en-marcha',
            ],
            [
                'nombre' => 'Capacitación técnica',
                'slug' => 'capacitacion-tecnica',
            ],
        ];

        foreach ($legacyTipos as $tipo) {
            $exists = DB::table('tipo_servicio_mantenimiento')
                ->where('slug', $tipo['slug'])
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('tipo_servicio_mantenimiento')->insert([
                'nombre' => $tipo['nombre'],
                'slug' => $tipo['slug'],
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $legacyInstalacionId = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'instalacion-y-puesta-en-marcha')
            ->value('id');

        $instalacionId = DB::table('tipo_servicio_mantenimiento')
            ->where('slug', 'instalacion')
            ->value('id');

        if ($legacyInstalacionId !== null && $instalacionId !== null) {
            DB::table('servicios')
                ->where('tipo_servicio_mantenimiento_id', $instalacionId)
                ->update([
                    'tipo_servicio_mantenimiento_id' => $legacyInstalacionId,
                    'updated_at' => $now,
                ]);
        }

        $slugsToRemove = [
            'diagnostico',
            'renta-de-equipos-medicos',
            'instalacion',
            'desinstalacion',
            'puesta-en-marcha',
        ];

        foreach ($slugsToRemove as $slug) {
            $tipoId = DB::table('tipo_servicio_mantenimiento')
                ->where('slug', $slug)
                ->value('id');

            if ($tipoId === null) {
                continue;
            }

            DB::table('servicios')
                ->where('tipo_servicio_mantenimiento_id', $tipoId)
                ->delete();

            DB::table('tipo_servicio_mantenimiento')
                ->where('id', $tipoId)
                ->delete();
        }
    }
};
