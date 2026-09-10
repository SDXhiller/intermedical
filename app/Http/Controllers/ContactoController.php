<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use App\Models\TipoServicioMantenimiento;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ContactoController extends Controller
{
    /**
     * Show the public contact page.
     */
    public function show(Request $request): Response
    {
        $tipoSlug = $request->string('tipo')->toString();

        if ($tipoSlug === '') {
            return Inertia::render('contacto-inter');
        }

        $tipo = TipoServicioMantenimiento::query()
            ->where('slug', $tipoSlug)
            ->where('activo', true)
            ->first();

        if ($tipo === null) {
            throw new NotFoundHttpException;
        }

        $servicios = Servicio::query()
            ->where('activo', true)
            ->where('tipo_servicio_mantenimiento_id', $tipo->id)
            ->with([
                'telefono:id,nombre,numero,tipo',
                'correo:id,nombre,correo',
                'horario:id,dias,hora_inicio,hora_fin',
            ])
            ->latest()
            ->get()
            ->map(fn (Servicio $servicio): array => [
                'id' => $servicio->id,
                'nombre' => $servicio->nombre,
                'slug' => $servicio->slug,
                'descripcion' => $servicio->descripcion,
                'icono' => $servicio->icono->value,
                'telefono' => $servicio->telefono === null ? null : [
                    'id' => $servicio->telefono->id,
                    'nombre' => $servicio->telefono->nombre,
                    'numero' => $servicio->telefono->numero,
                    'tipo' => $servicio->telefono->tipo,
                ],
                'correo' => $servicio->correo === null ? null : [
                    'id' => $servicio->correo->id,
                    'nombre' => $servicio->correo->nombre,
                    'correo' => $servicio->correo->correo,
                ],
                'horario' => $servicio->horario === null ? null : [
                    'id' => $servicio->horario->id,
                    'dias' => $servicio->horario->dias,
                    'hora_inicio' => $servicio->horario->hora_inicio,
                    'hora_fin' => $servicio->horario->hora_fin,
                ],
            ])
            ->values();

        return Inertia::render('Contacto/Mostrar-contacto', [
            'servicios' => $servicios,
            'tipoServicio' => [
                'id' => $tipo->id,
                'nombre' => $tipo->nombre,
                'slug' => $tipo->slug,
            ],
        ]);
    }
}
