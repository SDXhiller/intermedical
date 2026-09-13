import { Link } from '@inertiajs/react';
import { Mail, Phone, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';
import { contacto, home, mantenimiento, sobreNosotros } from '@/routes';

const MIG_HORIZONTAL_WHITE = '/Imagen/Logos/MIG-horizontal-blanco.png';

const serviceLinks = [
    { label: 'Mantenimiento preventivo', href: mantenimiento.url() },
    { label: 'Sobre nosotros', href: sobreNosotros.url() },
    { label: 'Contacto', href: contacto.url() },
] as const;

function FacebookIcon({ className, style, strokeWidth = 1.75 }: LucideProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
            aria-hidden="true"
        >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

function InstagramIcon({ className, style, strokeWidth = 1.75 }: LucideProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
            aria-hidden="true"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

function LinkedInIcon({ className, style, strokeWidth = 1.75 }: LucideProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
            aria-hidden="true"
        >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}

const socialLinks: {
    label: string;
    href: string;
    icon: ComponentType<LucideProps>;
}[] = [
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/',
        icon: FacebookIcon,
    },
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/',
        icon: InstagramIcon,
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/',
        icon: LinkedInIcon,
    },
];

const contactItems = [
    {
        label: 'contacto@medicalimaging.com.mx',
        href: 'mailto:contacto@medicalimaging.com.mx',
        icon: Mail,
    },
    {
        label: '55 1976 1691',
        href: 'tel:+525519761691',
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
                            src={MIG_HORIZONTAL_WHITE}
                            alt="Medical Imaging Group"
                            className="h-auto w-full max-w-[220px] object-contain"
                        />
                    </Link>
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                        C. Nte. 182 520, Pensador Mexicano, Venustiano Carranza,
                        15510, Ciudad de México, CDMX.
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
                        Conoce mas sobre nosotros
                    </h3>
                    <ul className="mt-4 flex items-center gap-3">
                        {socialLinks.map(({ label, href, icon: Icon }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="inline-flex size-10 items-center justify-center rounded-full border border-[#0a7c4a]/30 transition hover:bg-[#0a7c4a]/10"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    <Icon className="size-5" strokeWidth={1.75} />
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
