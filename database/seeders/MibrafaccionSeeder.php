<?php

namespace Database\Seeders;

use App\Models\EquipoModulo;
use App\Models\Mibrafaccion;
use Illuminate\Database\Seeder;

class MibrafaccionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $equipos = EquipoModulo::query()
            ->where('activo', true)
            ->with(['fabricante:id,nombre', 'modulo:id,modulo'])
            ->orderBy('id')
            ->limit(6)
            ->get();

        if ($equipos->isEmpty()) {
            return;
        }

        $catalogo = [
            ['refaccion_requerida' => 'Transductor lineal', 'numero_parte' => 'PN-TL-12L', 'descripcion' => 'Transductor lineal compatible con el equipo indicado.'],
            ['refaccion_requerida' => 'Fuente de poder', 'numero_parte' => 'PN-PSU-400', 'descripcion' => 'Fuente de alimentación de reemplazo para el sistema.'],
            ['refaccion_requerida' => 'Tubo de rayos X', 'numero_parte' => 'PN-XR-TUBE-01', 'descripcion' => 'Tubo de rayos X según especificaciones del modelo.'],
            ['refaccion_requerida' => 'Colimador', 'numero_parte' => 'PN-COL-220', 'descripcion' => 'Colimador de recambio para el equipo seleccionado.'],
            ['refaccion_requerida' => 'Panel detector', 'numero_parte' => 'PN-DET-FLAT', 'descripcion' => 'Panel detector plano compatible con la modalidad.'],
            ['refaccion_requerida' => 'Teclado de consola', 'numero_parte' => 'PN-KBD-OP', 'descripcion' => 'Teclado o consola de operación de reemplazo.'],
        ];

        foreach ($equipos as $index => $equipo) {
            $pieza = $catalogo[$index % count($catalogo)];

            Mibrafaccion::query()->updateOrCreate(
                [
                    'equipo_modulo_id' => $equipo->id,
                    'numero_parte' => $pieza['numero_parte'],
                ],
                [
                    'modulo_id' => $equipo->modulo_id,
                    'fabricante_id' => $equipo->fabricante_id,
                    'refaccion_requerida' => $pieza['refaccion_requerida'],
                    'descripcion' => $pieza['descripcion'],
                    'fotografias' => $equipo->imagen ? [$equipo->imagen] : [],
                    'activo' => true,
                ],
            );
        }
    }
}
