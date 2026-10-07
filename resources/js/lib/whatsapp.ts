export function whatsappChatUrl(number: string, text: string): string {
    const digits = number.replace(/\D/g, '');

    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function absoluteAssetUrl(path: string | null | undefined): string | null {
    if (path === null || path === undefined || path === '') {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const normalized = path.startsWith('/') ? path : `/${path}`;

    return `${origin}${normalized}`;
}
