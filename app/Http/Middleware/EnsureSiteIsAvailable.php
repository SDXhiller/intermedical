<?php

namespace App\Http\Middleware;

use App\Models\UserAdmin;
use App\Support\SiteMaintenance;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureSiteIsAvailable
{
    public function __construct(private SiteMaintenance $maintenance) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->maintenance->isActive()) {
            return $next($request);
        }

        if ($this->isAdminArea($request)) {
            return $next($request);
        }

        $admin = $request->user('admin');

        if ($admin instanceof UserAdmin && $admin->activo) {
            return $next($request);
        }

        $status = $this->maintenance->status();
        $until = $status['until'];

        $response = Inertia::render('Maintenance', [
            'until' => $until,
        ])->toResponse($request);

        $response->setStatusCode(503);

        if (is_string($until)) {
            $seconds = (int) now()->diffInSeconds(Carbon::parse($until), false);
            $response->headers->set('Retry-After', (string) max(1, $seconds));
        }

        return $response;
    }

    private function isAdminArea(Request $request): bool
    {
        return $request->is('admin')
            || $request->is('admin/*')
            || $request->routeIs('admin.*');
    }
}
