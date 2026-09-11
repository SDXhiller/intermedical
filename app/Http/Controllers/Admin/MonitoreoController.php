<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserAdmin;
use App\Support\SitemapBuilder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitoreoController extends Controller
{
    /**
     * Show SEO and sitemap monitoring for administrators.
     */
    public function __invoke(Request $request, SitemapBuilder $sitemap): Response
    {
        $admin = $request->user('admin');

        abort_unless($admin instanceof UserAdmin, 403);

        return Inertia::render(
            'settings/monitoreo',
            $sitemap->overview(),
        );
    }
}
