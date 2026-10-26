<?php

namespace App\Http\Middleware;

use App\Models\UserAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPatternVerified
{
    public const SESSION_KEY = 'admin_patron_verificado';

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user('admin');

        if (! $admin instanceof UserAdmin) {
            return redirect()->route('admin.login');
        }

        if (blank($admin->patron) || $request->session()->get(self::SESSION_KEY) === true) {
            return $next($request);
        }

        return redirect()->route('admin.patron');
    }
}
