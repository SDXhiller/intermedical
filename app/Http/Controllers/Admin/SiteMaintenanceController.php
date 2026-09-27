<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSiteMaintenanceRequest;
use App\Support\SiteMaintenance;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class SiteMaintenanceController extends Controller
{
    /**
     * Enable or disable the public site maintenance mode.
     */
    public function update(UpdateSiteMaintenanceRequest $request, SiteMaintenance $maintenance): RedirectResponse
    {
        $validated = $request->validated();

        if ($validated['enabled']) {
            $maintenance->activate((int) $validated['hours'], (int) $validated['minutes']);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'El sitio público está en modo mantenimiento.',
            ]);
        } else {
            $maintenance->deactivate();

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'El sitio público volvió a estar disponible.',
            ]);
        }

        return back();
    }
}
