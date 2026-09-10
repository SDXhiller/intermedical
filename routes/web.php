<?php

use App\Http\Controllers\Admin\ClienteCotisacionController as AdminClienteCotisacionController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DatosContactoController as AdminDatosContactoController;
use App\Http\Controllers\Admin\EquipoModuloController as AdminEquipoModuloController;
use App\Http\Controllers\Admin\FabricanteController as AdminFabricanteController;
use App\Http\Controllers\Admin\Imagen360Controller as AdminImagen360Controller;
use App\Http\Controllers\Admin\ModuloController as AdminModuloController;
use App\Http\Controllers\Admin\ServicioController as AdminServicioController;
use App\Http\Controllers\Admin\UsuarioController as AdminUsuarioController;
use App\Http\Controllers\Auth\AdminAuthenticatedSessionController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ClienteCotisacionController;
use App\Http\Controllers\ContactoController;
use App\Http\Controllers\ModuloController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('mantenimiento', 'Mantenimiento/Mantenimiento')->name('mantenimiento');
Route::inertia('sobre-nosotros', 'Empresa/Sobrenosotros')->name('sobre-nosotros');
Route::get('contacto', [ContactoController::class, 'show'])->name('contacto');

Route::get('cotizacion/cliente', [ClienteCotisacionController::class, 'create'])
    ->name('cliente-cotisacion.create');
Route::post('cotizacion/cliente', [ClienteCotisacionController::class, 'store'])
    ->name('cliente-cotisacion.store');

Route::get('equipos/{category}', [ModuloController::class, 'index'])->name('equipos.index');
Route::get('modulos/{slug}', [ModuloController::class, 'show'])->name('modulos.show');
Route::get('buscar', [SearchController::class, 'index'])->name('search.index');
Route::get('buscar/sugerencias', [SearchController::class, 'suggest'])->name('search.suggest');

Route::middleware('guest:admin')->group(function () {
    Route::get('admin/login', [AdminAuthenticatedSessionController::class, 'create'])
        ->name('admin.login');
    Route::post('admin/login', [AdminAuthenticatedSessionController::class, 'store'])
        ->name('admin.login.store');
});

Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', AdminDashboardController::class)->name('dashboard');
    Route::post('logout', [AdminAuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::middleware('admin.area:equipos')->group(function () {
        Route::get('equipos', [AdminModuloController::class, 'create'])
            ->name('equipos.create');
        Route::post('equipos', [AdminModuloController::class, 'store'])
            ->name('equipos.store');
        Route::patch('equipos/{modulo}/estatus', [AdminModuloController::class, 'toggleStatus'])
            ->name('equipos.toggle-status');
        Route::delete('equipos/{modulo}', [AdminModuloController::class, 'destroy'])
            ->name('equipos.destroy');
    });

    Route::middleware('admin.area:modelos-equipos')->group(function () {
        Route::get('modelos-equipos', [AdminEquipoModuloController::class, 'index'])
            ->name('modelos-equipos');
        Route::post('modelos-equipos', [AdminEquipoModuloController::class, 'store'])
            ->name('modelos-equipos.store');
        Route::put('modelos-equipos/{equipoModulo}', [AdminEquipoModuloController::class, 'update'])
            ->name('modelos-equipos.update');
        Route::patch('modelos-equipos/{equipoModulo}/estatus', [AdminEquipoModuloController::class, 'toggleStatus'])
            ->name('modelos-equipos.toggle-status');
        Route::delete('modelos-equipos/{equipoModulo}', [AdminEquipoModuloController::class, 'destroy'])
            ->name('modelos-equipos.destroy');

        Route::post('modelos-equipos/{equipoModulo}/imagenes-360', [AdminImagen360Controller::class, 'store'])
            ->name('modelos-equipos.imagenes-360.store');
        Route::put('modelos-equipos/{equipoModulo}/imagenes-360/{imagen360}/puntos', [AdminImagen360Controller::class, 'syncPuntos'])
            ->name('modelos-equipos.imagenes-360.sync-puntos');
        Route::delete('modelos-equipos/{equipoModulo}/imagenes-360/{imagen360}', [AdminImagen360Controller::class, 'destroy'])
            ->name('modelos-equipos.imagenes-360.destroy');
    });

    Route::middleware('admin.area:fabricantes')->group(function () {
        Route::get('fabricantes', [AdminFabricanteController::class, 'index'])
            ->name('fabricantes.index');
        Route::post('fabricantes', [AdminFabricanteController::class, 'store'])
            ->name('fabricantes.store');
        Route::patch('fabricantes/{fabricante}/estatus', [AdminFabricanteController::class, 'toggleStatus'])
            ->name('fabricantes.toggle-status');
        Route::delete('fabricantes/{fabricante}', [AdminFabricanteController::class, 'destroy'])
            ->name('fabricantes.destroy');
    });

    Route::middleware('admin.area:datos-contacto')->group(function () {
        Route::get('datos-contacto', [AdminDatosContactoController::class, 'index'])
            ->name('datos-contacto.index');
        Route::post('datos-contacto/telefonos', [AdminDatosContactoController::class, 'storeTelefono'])
            ->name('datos-contacto.telefonos.store');
        Route::patch('datos-contacto/telefonos/{telefono}/estatus', [AdminDatosContactoController::class, 'toggleTelefono'])
            ->name('datos-contacto.telefonos.toggle-status');
        Route::delete('datos-contacto/telefonos/{telefono}', [AdminDatosContactoController::class, 'destroyTelefono'])
            ->name('datos-contacto.telefonos.destroy');
        Route::post('datos-contacto/correos', [AdminDatosContactoController::class, 'storeCorreo'])
            ->name('datos-contacto.correos.store');
        Route::patch('datos-contacto/correos/{correo}/estatus', [AdminDatosContactoController::class, 'toggleCorreo'])
            ->name('datos-contacto.correos.toggle-status');
        Route::delete('datos-contacto/correos/{correo}', [AdminDatosContactoController::class, 'destroyCorreo'])
            ->name('datos-contacto.correos.destroy');
        Route::post('datos-contacto/horarios', [AdminDatosContactoController::class, 'storeHorario'])
            ->name('datos-contacto.horarios.store');
        Route::patch('datos-contacto/horarios/{horario}/estatus', [AdminDatosContactoController::class, 'toggleHorario'])
            ->name('datos-contacto.horarios.toggle-status');
        Route::delete('datos-contacto/horarios/{horario}', [AdminDatosContactoController::class, 'destroyHorario'])
            ->name('datos-contacto.horarios.destroy');
    });

    Route::middleware('admin.area:cotizaciones')->group(function () {
        Route::get('cotizaciones', [AdminClienteCotisacionController::class, 'index'])
            ->name('cotizaciones.index');
        Route::delete('cotizaciones/{clienteCotisacion}', [AdminClienteCotisacionController::class, 'destroy'])
            ->name('cotizaciones.destroy');
    });

    Route::middleware('admin.area:servicios')->group(function () {
        Route::get('servicios', [AdminServicioController::class, 'index'])
            ->name('servicios.index');
        Route::post('servicios', [AdminServicioController::class, 'store'])
            ->name('servicios.store');
        Route::patch('servicios/{servicio}/estatus', [AdminServicioController::class, 'toggleStatus'])
            ->name('servicios.toggle-status');
        Route::delete('servicios/{servicio}', [AdminServicioController::class, 'destroy'])
            ->name('servicios.destroy');
    });

    Route::middleware('admin.area:usuarios')->group(function () {
        Route::get('usuarios/crear', [AdminUsuarioController::class, 'create'])
            ->name('usuarios.create');
        Route::post('usuarios', [AdminUsuarioController::class, 'store'])
            ->name('usuarios.store');
        Route::get('usuarios/editar', [AdminUsuarioController::class, 'edit'])
            ->name('usuarios.edit');
        Route::put('usuarios/{userAdmin}', [AdminUsuarioController::class, 'update'])
            ->name('usuarios.update');
        Route::delete('usuarios/{userAdmin}', [AdminUsuarioController::class, 'destroy'])
            ->name('usuarios.destroy');
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
