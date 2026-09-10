<?php

use App\Models\EquipoModulo;
use App\Models\Modulo;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('modelo');
        });

        EquipoModulo::query()
            ->orderBy('id')
            ->each(function (EquipoModulo $equipo): void {
                $equipo->forceFill([
                    'slug' => $this->uniqueSlug($equipo->modelo, $equipo->id),
                ])->saveQuietly();
            });

        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipos_modulos', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }

    private function uniqueSlug(string $modelo, int $ignoreId): string
    {
        $base = Str::slug($modelo);
        $base = $base !== '' ? $base : 'equipo';
        $slug = $base;
        $suffix = 2;

        while (
            EquipoModulo::query()
                ->whereKeyNot($ignoreId)
                ->where('slug', $slug)
                ->exists()
            || Modulo::query()->where('slug', $slug)->exists()
        ) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
};
