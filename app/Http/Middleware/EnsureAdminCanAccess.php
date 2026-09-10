<?php

namespace App\Http\Middleware;

use App\Models\UserAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminCanAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $area): Response
    {
        $admin = $request->user('admin');

        if (! $admin instanceof UserAdmin) {
            return redirect()->route('admin.login');
        }

        $admin->loadMissing(['cargo', 'rolUsuario']);

        if (! $admin->canAccess($area)) {
            abort(403);
        }

        return $next($request);
    }
}
