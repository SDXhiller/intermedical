import { Link } from '@inertiajs/react';
import { Mail, Phone } from 'lucide-react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { contacto, home, mantenimiento, sobreNosotros } from '@/routes';

const MIG_HORIZONTAL_ORIGINAL = '/Imagen/Logos/MIG-horizontal-original.png';

const serviceLinks = [
    { label: 'Mantenimiento preventivo', href: mantenimiento.url() },
    { label: 'Sobre nosotros', href: sobreNosotros.url() },
    { label: 'Contacto', href: contacto.url() },
] as const;

const supportPhones = [
    { label: '55 1234 5678', href: 'tel:+525512345678' },
    { label: '55 2345 6789', href: 'tel:+525523456789' },
    { label: '800 123 4567', href: 'tel:+528001234567' },
] as const;

const contactItems = [
    {
        label: 'contacto@medicalimaging.com.mx',
        href: 'mailto:contacto@medicalimaging.com.mx',
        icon: Mail,
    },
    {
        label: '55 1234 5678',
        href: 'tel:+525512345678',
        icon: Phone,
    },
    {
        label: '55 8765 4321',
        href: 'tel:+525587654321',
        icon: Phone,
    },
] as const;

export default function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div
                className={`mx-auto grid ${CONTENT_WIDTH} gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-14`}
            >
                <div className="space-y-4">
                    <Link href={home()} className="inline-block">
                        <img
                            src={MIG_HORIZONTAL_ORIGINAL}
                            alt="Medical Imaging Group"
                            className="h-auto w-full max-w-[220px] object-contain"
                        />
                    </Link>
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                        C. Nte. 182 520, Pensador Mexicano, Venustiano Carranza,
                        15510 Ciudad de México, CDMX
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Servicios
                    </h3>
                    <ul className="mt-4 space-y-2.5">
                        {serviceLinks.map(({ label, href }) => (
                            <li key={label}>
                                <Link
                                    href={href}
                                    className="text-sm text-muted-foreground transition hover:text-[#0a7c4a]"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Soporte
                    </h3>
                    <ul className="mt-4 space-y-2.5">
                        {supportPhones.map(({ label, href }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-[#0a7c4a]"
                                >
                                    <Phone
                                        className="size-4 shrink-0"
                                        style={{ color: BRAND_COLOR }}
                                        strokeWidth={1.75}
                                    />
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Contacto
                    </h3>
                    <ul className="mt-4 space-y-2.5">
                        {contactItems.map(({ label, href, icon: Icon }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-[#0a7c4a]"
                                >
                                    <Icon
                                        className="size-4 shrink-0"
                                        style={{ color: BRAND_COLOR }}
                                        strokeWidth={1.75}
                                    />
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="w-full" style={{ backgroundColor: BRAND_COLOR }}>
                <p
                    className={`mx-auto ${CONTENT_WIDTH} py-3 text-center text-sm text-white`}
                >
                    ©{year} Derechos Reservados Medical Imaging Group
                </p>
            </div>
        </footer>
    );
}
