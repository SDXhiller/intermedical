export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type AdminUser = {
    id: number;
    name: string;
    apellidos?: string;
    username: string;
    email: string;
    cargo?: {
        id: number;
        nombre: string;
        slug: string;
    } | null;
    rol_usuario?: {
        id: number;
        nombre: string;
    } | null;
    permisos?: string[];
    es_super_usuario?: boolean;
    [key: string]: unknown;
};

export type Auth = {
    user: User | AdminUser | null;
    admin?: AdminUser | null;
    usuario?: User | null;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
