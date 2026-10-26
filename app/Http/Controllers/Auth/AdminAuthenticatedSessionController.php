<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureAdminPatternVerified;
use App\Http\Requests\Auth\AdminLoginRequest;
use App\Models\UserAdmin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthenticatedSessionController extends Controller
{
    /**
     * Display the admin login view.
     */
    public function create(): Response
    {
        return Inertia::render('Admins/Login');
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function store(AdminLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $admin = $request->user('admin');

        if ($admin instanceof UserAdmin && filled($admin->patron)) {
            $request->session()->forget(EnsureAdminPatternVerified::SESSION_KEY);

            return redirect()->route('admin.patron');
        }

        $request->session()->put(EnsureAdminPatternVerified::SESSION_KEY, true);

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated admin session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
