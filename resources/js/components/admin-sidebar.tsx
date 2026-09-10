import { Form, Link, usePage } from '@inertiajs/react';
import {
    Box,
    Contact,
    Factory,
    Headphones,
    Layers,
    LayoutGrid,
    LogOut,
    Phone,
    Settings,
    UserPen,
    UserPlus,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { useCurrentUrl } from '@/hooks/use-current-url';
import {
    dashboard as adminDashboard,
    logout as adminLogout,
    modelosEquipos as adminModelosEquipos,
} from '@/routes/admin';
import { index as adminDatosContacto } from '@/routes/admin/datos-contacto';
import { create as adminEquipos } from '@/routes/admin/equipos';
import { index as adminCotizaciones } from '@/routes/admin/cotizaciones';
import { index as adminFabricantes } from '@/routes/admin/fabricantes';
import { index as adminServicios } from '@/routes/admin/servicios';
import {
    create as adminUsuariosCreate,
    edit as adminUsuariosEdit,
} from '@/routes/admin/usuarios';
import type { AdminUser, NavItem } from '@/types';

const principalItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: adminDashboard(),
        icon: LayoutGrid,
    },
];

const contentItems: NavItem[] = [
    {
        title: 'Equipos',
        href: adminEquipos(),
        icon: Box,
        area: 'equipos',
    },
    {
        title: 'Modelos de equipos',
        href: adminModelosEquipos(),
        icon: Layers,
        area: 'modelos-equipos',
    },
    {
        title: 'Fabricantes',
        href: adminFabricantes(),
        icon: Factory,
        area: 'fabricantes',
    },
    {
        title: 'Datos de contacto',
        href: adminDatosContacto(),
        icon: Phone,
        area: 'datos-contacto',
    },
    {
        title: 'Servicios',
        href: adminServicios(),
        icon: Contact,
        area: 'servicios',
    },
];

const userItems: NavItem[] = [
    {
        title: 'Crear Usuario',
        href: adminUsuariosCreate(),
        icon: UserPlus,
        area: 'usuarios',
    },
    {
        title: 'Editar Usuario',
        href: adminUsuariosEdit(),
        icon: UserPen,
        area: 'usuarios',
    },
];

const supportItems: NavItem[] = [
    {
        title: 'Cotizaciones',
        href: adminCotizaciones(),
        icon: Headphones,
        area: 'cotizaciones',
    },
    {
        title: 'Configuración',
        href: adminDashboard(),
        icon: Settings,
        area: 'configuracion',
    },
];

function useVisibleNavItems(items: NavItem[]): NavItem[] {
    const { auth } = usePage().props;
    const admin = auth.admin as AdminUser | null | undefined;
    const permisos = admin?.permisos ?? [];

    return items.filter((item) => {
        if (!item.area) {
            return true;
        }

        return permisos.includes(item.area);
    });
}

function AdminNavGroup({
    label,
    items,
}: {
    label: string;
    items: NavItem[];
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const visibleItems = useVisibleNavItems(items);

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function AdminNavUser() {
    const { auth } = usePage().props;
    const admin = auth.admin as AdminUser | null | undefined;

    if (!admin) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-2 rounded-lg px-2 py-2">
                    <UserInfo user={admin as never} showEmail />
                </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Form
                    action={adminLogout.url()}
                    method="post"
                    className="w-full"
                >
                    {({ processing }) => (
                        <SidebarMenuButton
                            type="submit"
                            disabled={processing}
                            tooltip={{ children: 'Cerrar sesión' }}
                            data-test="admin-logout-button"
                        >
                            <LogOut />
                            <span>Cerrar sesión</span>
                        </SidebarMenuButton>
                    )}
                </Form>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={adminDashboard()} prefetch>
                                <AppLogoIcon className="size-8 shrink-0 object-contain" />
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="truncate text-xs font-semibold tracking-wide text-[#0a7c4a]">
                                        MEDICAL IMAGING
                                    </span>
                                    <span className="truncate text-[10px] text-muted-foreground">
                                        Panel de control
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <AdminNavGroup label="Principal" items={principalItems} />
                <AdminNavGroup label="Contenido" items={contentItems} />
                <AdminNavGroup label="Usuarios" items={userItems} />
                <AdminNavGroup label="Operación" items={supportItems} />
            </SidebarContent>

            <SidebarFooter>
                <AdminNavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
