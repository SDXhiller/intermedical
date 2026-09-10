import type { ReactNode } from 'react';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-neutral-950 dark:text-white">
            <SiteHeader />
            <div className="relative z-0 flex-1">{children}</div>
            <SiteFooter />
        </div>
    );
}
