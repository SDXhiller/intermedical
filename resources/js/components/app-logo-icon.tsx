import { BRAND_ICON } from '@/data/equipment';
import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    alt = 'Medical Imaging Group',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={BRAND_ICON}
            alt={alt}
            className={className}
            {...props}
        />
    );
}
