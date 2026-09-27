import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { BRAND_COLOR } from '@/data/equipment';

export type SiteBreadcrumbItem = {
    label: string;
    href?: string;
    icon: LucideIcon;
};

export function SiteBreadcrumb({ items }: { items: SiteBreadcrumbItem[] }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2"
        >
            {items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === items.length - 1;
                const className =
                    'inline-flex max-w-[14rem] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:max-w-xs sm:text-sm';
                const content = (
                    <>
                        <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                        <span className="truncate">{item.label}</span>
                    </>
                );

                if (isLast) {
                    return (
                        <span
                            key={`${item.label}-${index}`}
                            className={`${className} text-white`}
                            style={{ backgroundColor: BRAND_COLOR }}
                            aria-current="page"
                        >
                            {content}
                        </span>
                    );
                }

                if (!item.href) {
                    return (
                        <span
                            key={`${item.label}-${index}`}
                            className={`${className} border`}
                            style={{
                                borderColor: BRAND_COLOR,
                                color: BRAND_COLOR,
                                backgroundColor: `${BRAND_COLOR}14`,
                            }}
                        >
                            {content}
                        </span>
                    );
                }

                return (
                    <Link
                        key={`${item.label}-${index}`}
                        href={item.href}
                        className={`${className} border hover:opacity-90`}
                        style={{
                            borderColor: BRAND_COLOR,
                            color: BRAND_COLOR,
                            backgroundColor: `${BRAND_COLOR}14`,
                        }}
                    >
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
}
