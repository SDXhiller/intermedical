<?php

namespace App\Http\Middleware;

use App\Models\EquipoModulo;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\UserAdmin;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $admin = $request->user('admin');
        $usuario = $request->user('usuario');

        if ($admin instanceof UserAdmin) {
            $admin->loadMissing(['cargo', 'rolUsuario']);
            $admin->append(['permisos', 'es_super_usuario']);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $admin ?? $usuario ?? $request->user(),
                'admin' => $admin,
                'usuario' => $usuario,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'cotizacion_enviada' => $request->session()->get('cotizacion_enviada'),
                'cotizacion_cliente' => $request->session()->get('cotizacion_cliente'),
                'open_360_equipo_id' => $request->session()->get('open_360_equipo_id'),
                'nueva_imagen_360_id' => $request->session()->get('nueva_imagen_360_id'),
            ],
            'equipmentItems' => fn () => Modulo::catalogItems(),
            'subEquipmentItems' => fn () => EquipoModulo::catalogItems(),
            'manufacturerItems' => fn () => Fabricante::catalogItems(),
        ];
    }
}
