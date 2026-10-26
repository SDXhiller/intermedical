<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureAdminPatternVerified;
use App\Http\Requests\Admin\ConfirmAdminPatronRequest;
use App\Models\UserAdmin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminPatronController extends Controller
{
    /**
     * Ask for the arrow pattern after a successful password login.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $admin = $request->user('admin');

        if (! $admin instanceof UserAdmin || blank($admin->patron)) {
            return redirect()->route('admin.dashboard');
        }

        if ($request->session()->get(EnsureAdminPatternVerified::SESSION_KEY) === true) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return Inertia::render('Admins/Patron');
    }

    /**
     * Unlock the admin session or return to the login screen.
     */
    public function store(ConfirmAdminPatronRequest $request): RedirectResponse
    {
        $admin = $request->user('admin');
        /** @var list<string> $direcciones */
        $direcciones = $request->validated('patron');
        $longitud = $admin instanceof UserAdmin ? (int) $admin->patron_longitud : 0;

        if ($admin instanceof UserAdmin && filled($admin->patron) && count($direcciones) < $longitud) {
            return redirect()->route('admin.patron');
        }

        $intento = array_slice($direcciones, 0, $longitud);

        if (! $admin instanceof UserAdmin || blank($admin->patron) || ! $admin->patronCoincide($intento)) {
            Auth::guard('admin')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('admin.login')
                ->with('error', 'El patrón no es correcto. Inicie sesión de nuevo.')
                ->withErrors([
                    'patron' => 'El patrón no es correcto. Inicie sesión de nuevo.',
                ]);
        }

        $request->session()->put(EnsureAdminPatternVerified::SESSION_KEY, true);

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }
}
