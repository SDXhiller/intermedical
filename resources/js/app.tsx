import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import SiteLayout from '@/layouts/site-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name.startsWith('Mantenimiento/'):
            case name.startsWith('Empresa/'):
            case name === 'Contacto/Mostrar-contacto':
            case name === 'contacto-inter':
            case name === 'Cliente':
            case name === 'Search':
            case name.startsWith('Modulos/') &&
                name !== 'Modulos/Registrar-modulo' &&
                name !== 'Modulos/Registro-equipos-modelos' &&
                name !== 'Modulos/Crear-fabricante':
                return SiteLayout;
            case name === 'Admins/Login':
            case name.startsWith('auth/'):
                return AuthLayout;
            case name === 'Modulos/Registrar-modulo':
            case name === 'Modulos/Registro-equipos-modelos':
            case name === 'Modulos/Crear-fabricante':
            case name === 'Contacto/Cargar-datos-contactos':
            case name === 'Contacto/Cargar-contacto':
            case name.startsWith('Cotizaciones/'):
            case name.startsWith('Users/'):
            case name.startsWith('Admins/'):
                return AdminLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
