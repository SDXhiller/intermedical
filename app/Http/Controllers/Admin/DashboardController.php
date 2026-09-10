<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserAdmin;
use App\Support\AdminDashboardOverview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the admin control panel overview.
     */
    public function __invoke(Request $request): Response
    {
        $admin = $request->user('admin');

        abort_unless($admin instanceof UserAdmin, 403);

        return Inertia::render(
            'Admins/dashboard-admin',
            (new AdminDashboardOverview($admin))->toArray(),
        );
    }
}
