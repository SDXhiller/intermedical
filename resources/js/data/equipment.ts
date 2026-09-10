export const BRAND_COLOR = '#0a7c4a';
export const CONTENT_WIDTH = 'w-[92%]';
export const BRAND_ICON = '/brand-icon.png';

export type EquipmentItem = {
    name: string;
    slug: string;
    image: string | null;
    hasListing?: boolean;
};

export type ManufacturerItem = {
    id: number;
    name: string;
    image: string | null;
};
