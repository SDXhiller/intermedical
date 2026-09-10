import { Head } from '@inertiajs/react';
import {
    Building2,
    Clock3,
    Headphones,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';
import ContactoOfficeMap from '@/components/contacto-office-map';
import { BRAND_COLOR, CONTENT_WIDTH } from '@/data/equipment';

const contactAvatar = '/Imagen/logoicono/MIG.png';

const adminContacts = [
    {
        name: 'Lic. Diana Grisell Reyes',
        role: 'Gerente de Marketing',
        phone: '+52 771-143-9323',
        email: 'contacto@medicalimaging.com.mx',
        phoneHref: 'tel:+527711439323',
        emailHref: 'mailto:contacto@medicalimaging.com.mx',
    },
    {
        name: 'Ing. Herberth Bravo',
        role: 'Director',
        phone: '+52 1 (554) 377-77-57',
        email: 'direccion@medicalimaging.com.mx',
        phoneHref: 'tel:+5215543777757',
        emailHref: 'mailto:direccion@medicalimaging.com.mx',
    },
    {
        name: 'Ing. Isabel Gómez',
        role: 'Gerente de Ingeniería Biomédica',
        phone: '+52 1 (563) 792-87-38',
        email: 'gerenciaib@medicalimaging.com.mx',
        phoneHref: 'tel:+5215637928738',
        emailHref: 'mailto:gerenciaib@medicalimaging.com.mx',
    },
] as const;

const officeAddressLines = [
    'C. Nte. 182 520, Pensador Mexicano,',
    'Venustiano Carranza, 15510 Ciudad de México, CDMX',
] as const;

const officeLat = 19.440514000000007;
const officeLng = -99.0865657;

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${officeLat},${officeLng}`;

function maintenanceImage(filename: string): string {
    return `/Imagen/Mantenimiento/${encodeURIComponent(filename)}`;
}

export default function ContactoInter() {
    return (
        <>
            <Head title="Contacto" />

            <section className="relative min-h-[300px] overflow-hidden sm:min-h-[340px] lg:min-h-[380px]">
                <img
                    src={maintenanceImage('Mantenimeinto.png')}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-center"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-slate-950/78" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/35" />

                <div
                    className={`relative mx-auto flex min-h-[inherit] ${CONTENT_WIDTH} max-w-6xl items-center py-12 sm:py-14`}
                >
                    <div className="max-w-2xl">
                        <p
                            className="text-xs font-bold tracking-[0.14em] uppercase sm:text-sm"
                            style={{ color: BRAND_COLOR }}
                        >
                            Contacto general
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
                            Hablemos, estamos para servirle
                        </h1>
                        <div
                            className="mt-4 h-1 w-14 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                            Póngase en contacto con nuestros encargados
                            administrativos o directivos para asuntos generales,
                            información comercial, alianzas y procesos internos.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-white py-12 dark:bg-neutral-950 sm:py-14 lg:py-16">
                <div className={`mx-auto ${CONTENT_WIDTH} max-w-6xl`}>
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Contacto con administración
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                            Comuníquese directamente con nuestro equipo
                            directivo y administrativo para atención
                            personalizada.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-3 lg:gap-6">
                        {adminContacts.map((contact) => (
                            <article
                                key={contact.name}
                                className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <div className="flex gap-4">
                                    <img
                                        src={contactAvatar}
                                        alt=""
                                        className="size-20 shrink-0 rounded-lg object-cover object-center sm:size-24"
                                        style={{ backgroundColor: BRAND_COLOR }}
                                        aria-hidden="true"
                                    />
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                            {contact.name}
                                        </h3>
                                        <p
                                            className="mt-0.5 text-sm font-semibold"
                                            style={{ color: BRAND_COLOR }}
                                        >
                                            {contact.role}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <Phone
                                            className="mt-0.5 size-4 shrink-0"
                                            style={{ color: BRAND_COLOR }}
                                            strokeWidth={1.75}
                                        />
                                        <span>{contact.phone}</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <Mail
                                            className="mt-0.5 size-4 shrink-0"
                                            style={{ color: BRAND_COLOR }}
                                            strokeWidth={1.75}
                                        />
                                        <a
                                            href={contact.emailHref}
                                            className="break-all transition hover:opacity-80"
                                        >
                                            {contact.email}
                                        </a>
                                    </p>
                                </div>

                                <div className="mt-auto pt-5">
                                    <a
                                        href={contact.phoneHref}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                                        style={{
                                            backgroundColor: BRAND_COLOR,
                                        }}
                                    >
                                        <Phone className="size-4" />
                                        Llamar
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full bg-gray-50 py-12 dark:bg-neutral-900 sm:py-14">
                <div
                    className={`mx-auto grid ${CONTENT_WIDTH} max-w-none grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr] lg:items-center lg:gap-8`}
                >
                    <div className="grid min-w-0 gap-6 sm:grid-cols-2 sm:gap-5">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <span
                                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    <Building2
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                                    Oficina principal
                                </h3>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {officeAddressLines.map((line) => (
                                    <span key={line} className="block">
                                        {line}
                                    </span>
                                ))}
                            </p>
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition hover:opacity-80"
                                style={{ color: BRAND_COLOR }}
                            >
                                <MapPin
                                    className="size-4 shrink-0"
                                    strokeWidth={1.75}
                                />
                                Ver en Google Maps
                            </a>
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <span
                                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0a7c4a]/10"
                                    style={{ color: BRAND_COLOR }}
                                >
                                    <Headphones
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                                    Conmutador general
                                </h3>
                            </div>
                            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2 whitespace-nowrap">
                                    <Phone
                                        className="size-4 shrink-0"
                                        style={{ color: BRAND_COLOR }}
                                    />
                                    <a
                                        href="tel:+5215637928738"
                                        className="font-semibold transition hover:opacity-80"
                                        style={{ color: BRAND_COLOR }}
                                    >
                                        +52 1 (563) 792 87 38
                                    </a>
                                </p>
                                <p className="flex min-w-0 items-center gap-2">
                                    <Mail
                                        className="size-4 shrink-0"
                                        style={{ color: BRAND_COLOR }}
                                    />
                                    <a
                                        href="mailto:contacto@medicalimaging.com.mx"
                                        className="truncate transition hover:opacity-80"
                                        title="contacto@medicalimaging.com.mx"
                                    >
                                        contacto@medicalimaging.com.mx
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-52 w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm lg:h-56 dark:border-neutral-700">
                        <ContactoOfficeMap />
                    </div>
                </div>
            </section>
        </>
    );
}
