<?php

namespace App\Support;

use App\Models\Cargo;
use App\Models\ClienteCotisacion;
use App\Models\EquipoModulo;
use App\Models\Modulo;
use App\Models\Servicio;
use App\Models\UserAdmin;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class AdminDashboardOverview
{
    public function __construct(private UserAdmin $admin)
    {
        $this->admin->loadMissing(['cargo', 'rolUsuario']);
    }

    /**
     * @return array{
     *     stats: list<array{key: string, title: string, value: int, status: string, trend: string}>,
     *     acciones: list<array{key: string, title: string}>,
     *     actividad: list<array{id: string, title: string, time: string}>,
     *     resumenMensual: array{mes: string, total: int, dias: list<array{dia: int, total: int, esHoy: bool}>}|null
     * }
     */
    public function toArray(): array
    {
        return [
            'stats' => $this->stats(),
            'acciones' => $this->acciones(),
            'actividad' => $this->actividad(),
            'resumenMensual' => $this->admin->canAccess(Cargo::AREA_COTIZACIONES)
                ? $this->resumenMensual()
                : null,
        ];
    }

    /**
     * @return list<array{key: string, title: string, value: int, status: string, trend: string}>
     */
    private function stats(): array
    {
        $now = now();
        $startOfToday = $now->copy()->startOfDay();
        $startOfWeek = $now->copy()->startOfWeek(Carbon::MONDAY);
        $startOfMonth = $now->copy()->startOfMonth();
        $stats = [];

        if ($this->admin->canAccess(Cargo::AREA_EQUIPOS)) {
            $equiposTotal = Modulo::query()->count();
            $equiposPublicados = Modulo::query()->activos()->count();
            $equiposNuevosMes = Modulo::query()->where('created_at', '>=', $startOfMonth)->count();

            $stats[] = [
                'key' => 'equipos',
                'title' => 'Equipos',
                'value' => $equiposTotal,
                'status' => $this->counted($equiposPublicados, '1 publicado', ':count publicados'),
                'trend' => $this->counted($equiposNuevosMes, '1 nuevo este mes', ':count nuevos este mes'),
            ];
        }

        if ($this->admin->canAccess(Cargo::AREA_MODELOS_EQUIPOS)) {
            $modelosTotal = EquipoModulo::query()->count();
            $modelosActivos = EquipoModulo::query()->where('activo', true)->count();
            $modelosNuevosSemana = EquipoModulo::query()->where('created_at', '>=', $startOfWeek)->count();

            $stats[] = [
                'key' => 'modelos',
                'title' => 'Modelos de equipos',
                'value' => $modelosTotal,
                'status' => $this->counted($modelosActivos, '1 activo', ':count activos'),
                'trend' => $this->counted($modelosNuevosSemana, '1 nuevo esta semana', ':count nuevos esta semana'),
            ];
        }

        if ($this->admin->canAccess(Cargo::AREA_SERVICIOS)) {
            $serviciosTotal = Servicio::query()->count();
            $serviciosActivos = Servicio::query()->where('activo', true)->count();
            $serviciosActualizadosMes = Servicio::query()
                ->where('updated_at', '>=', $startOfMonth)
                ->count();

            $stats[] = [
                'key' => 'servicios',
                'title' => 'Servicios',
                'value' => $serviciosTotal,
                'status' => $this->counted($serviciosActivos, '1 disponible', ':count disponibles'),
                'trend' => $this->counted($serviciosActualizadosMes, '1 actualizado este mes', ':count actualizados este mes'),
            ];
        }

        if ($this->admin->canAccess(Cargo::AREA_COTIZACIONES)) {
            $cotizacionesHoy = ClienteCotisacion::query()->where('created_at', '>=', $startOfToday)->count();
            $cotizacionesSemana = ClienteCotisacion::query()->where('created_at', '>=', $startOfWeek)->count();

            $stats[] = [
                'key' => 'cotizaciones',
                'title' => 'Cotizaciones',
                'value' => $cotizacionesHoy,
                'status' => 'Recibidas hoy',
                'trend' => $this->counted($cotizacionesSemana, '1 esta semana', ':count esta semana'),
            ];
        }

        return $stats;
    }

    /**
     * @return list<array{key: string, title: string}>
     */
    private function acciones(): array
    {
        $acciones = [
            ['key' => 'equipos', 'title' => 'Nuevo equipo', 'area' => Cargo::AREA_EQUIPOS],
            ['key' => 'modelos', 'title' => 'Modelos de equipos', 'area' => Cargo::AREA_MODELOS_EQUIPOS],
            ['key' => 'servicios', 'title' => 'Nuevo servicio', 'area' => Cargo::AREA_SERVICIOS],
            ['key' => 'cotizaciones', 'title' => 'Ver cotizaciones', 'area' => Cargo::AREA_COTIZACIONES],
        ];

        return collect($acciones)
            ->filter(fn (array $accion): bool => $this->admin->canAccess($accion['area']))
            ->map(fn (array $accion): array => [
                'key' => $accion['key'],
                'title' => $accion['title'],
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: string, title: string, time: string}>
     */
    private function actividad(): array
    {
        /** @var Collection<int, array{id: string, title: string, time: string, occurred_at: CarbonInterface}> $items */
        $items = collect();

        if ($this->admin->canAccess(Cargo::AREA_EQUIPOS)) {
            $items = $items->concat(
                Modulo::query()
                    ->latest('updated_at')
                    ->limit(8)
                    ->get(['id', 'modulo', 'created_at', 'updated_at'])
                    ->map(fn (Modulo $modulo): array => $this->activityItem(
                        'equipo-'.$modulo->id,
                        $this->isNew($modulo->created_at, $modulo->updated_at)
                            ? "Se registró el equipo {$modulo->modulo}"
                            : "Se actualizó el equipo {$modulo->modulo}",
                        $modulo->updated_at,
                    )),
            );
        }

        if ($this->admin->canAccess(Cargo::AREA_MODELOS_EQUIPOS)) {
            $items = $items->concat(
                EquipoModulo::query()
                    ->latest('updated_at')
                    ->limit(8)
                    ->get(['id', 'modelo', 'created_at', 'updated_at'])
                    ->map(fn (EquipoModulo $modelo): array => $this->activityItem(
                        'modelo-'.$modelo->id,
                        $this->isNew($modelo->created_at, $modelo->updated_at)
                            ? "Se registró el modelo {$modelo->modelo}"
                            : "Se actualizó el modelo {$modelo->modelo}",
                        $modelo->updated_at,
                    )),
            );
        }

        if ($this->admin->canAccess(Cargo::AREA_SERVICIOS)) {
            $items = $items->concat(
                Servicio::query()
                    ->latest('updated_at')
                    ->limit(8)
                    ->get(['id', 'nombre', 'created_at', 'updated_at'])
                    ->map(fn (Servicio $servicio): array => $this->activityItem(
                        'servicio-'.$servicio->id,
                        $this->isNew($servicio->created_at, $servicio->updated_at)
                            ? "Se registró el servicio {$servicio->nombre}"
                            : "Se actualizó el servicio {$servicio->nombre}",
                        $servicio->updated_at,
                    )),
            );
        }

        return $items
            ->sortByDesc('occurred_at')
            ->take(8)
            ->values()
            ->map(fn (array $item): array => [
                'id' => $item['id'],
                'title' => $item['title'],
                'time' => $item['time'],
            ])
            ->all();
    }

    /**
     * @return array{mes: string, total: int, dias: list<array{dia: int, total: int, esHoy: bool}>}
     */
    private function resumenMensual(): array
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $today = $now->day;
        $daysInMonth = $now->daysInMonth;
        $dayExpression = match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m-%d', created_at)",
            default => 'DATE(created_at)',
        };

        $totalesPorDia = ClienteCotisacion::query()
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->selectRaw("{$dayExpression} as dia, COUNT(*) as total")
            ->groupByRaw($dayExpression)
            ->pluck('total', 'dia');

        $conteos = [];

        foreach ($totalesPorDia as $fecha => $total) {
            $conteos[(int) Carbon::parse((string) $fecha)->day] = (int) $total;
        }

        $dias = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dias[] = [
                'dia' => $day,
                'total' => $conteos[$day] ?? 0,
                'esHoy' => $day === $today,
            ];
        }

        $mesNombre = $now->copy()->locale('es')->isoFormat('MMMM YYYY');

        return [
            'mes' => mb_strtoupper(mb_substr($mesNombre, 0, 1)).mb_substr($mesNombre, 1),
            'total' => array_sum($conteos),
            'dias' => $dias,
        ];
    }

    /**
     * @return array{id: string, title: string, time: string, occurred_at: CarbonInterface}
     */
    private function activityItem(string $id, string $title, CarbonInterface $occurredAt): array
    {
        return [
            'id' => $id,
            'title' => $title,
            'time' => $occurredAt->locale('es')->diffForHumans(),
            'occurred_at' => $occurredAt,
        ];
    }

    private function isNew(?CarbonInterface $createdAt, ?CarbonInterface $updatedAt): bool
    {
        if ($createdAt === null || $updatedAt === null) {
            return false;
        }

        return $updatedAt->diffInSeconds($createdAt) <= 1;
    }

    private function counted(int $count, string $one, string $many): string
    {
        if ($count === 1) {
            return $one;
        }

        return str_replace(':count', (string) $count, $many);
    }
}
