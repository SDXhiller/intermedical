export type PhoneCountry = {
    iso: string;
    name: string;
    dial: string;
};

export const phoneCountries: PhoneCountry[] = [
    { iso: 'MX', name: 'México', dial: '+52' },
    { iso: 'US', name: 'Estados Unidos', dial: '+1' },
    { iso: 'CA', name: 'Canadá', dial: '+1' },
    { iso: 'GT', name: 'Guatemala', dial: '+502' },
    { iso: 'BZ', name: 'Belice', dial: '+501' },
    { iso: 'SV', name: 'El Salvador', dial: '+503' },
    { iso: 'HN', name: 'Honduras', dial: '+504' },
    { iso: 'NI', name: 'Nicaragua', dial: '+505' },
    { iso: 'CR', name: 'Costa Rica', dial: '+506' },
    { iso: 'PA', name: 'Panamá', dial: '+507' },
    { iso: 'CU', name: 'Cuba', dial: '+53' },
    { iso: 'DO', name: 'República Dominicana', dial: '+1' },
    { iso: 'CO', name: 'Colombia', dial: '+57' },
    { iso: 'VE', name: 'Venezuela', dial: '+58' },
    { iso: 'EC', name: 'Ecuador', dial: '+593' },
    { iso: 'PE', name: 'Perú', dial: '+51' },
    { iso: 'BO', name: 'Bolivia', dial: '+591' },
    { iso: 'CL', name: 'Chile', dial: '+56' },
    { iso: 'AR', name: 'Argentina', dial: '+54' },
    { iso: 'UY', name: 'Uruguay', dial: '+598' },
    { iso: 'PY', name: 'Paraguay', dial: '+595' },
    { iso: 'BR', name: 'Brasil', dial: '+55' },
    { iso: 'ES', name: 'España', dial: '+34' },
    { iso: 'FR', name: 'Francia', dial: '+33' },
    { iso: 'DE', name: 'Alemania', dial: '+49' },
    { iso: 'GB', name: 'Reino Unido', dial: '+44' },
    { iso: 'IT', name: 'Italia', dial: '+39' },
    { iso: 'PT', name: 'Portugal', dial: '+351' },
    { iso: 'CN', name: 'China', dial: '+86' },
    { iso: 'JP', name: 'Japón', dial: '+81' },
    { iso: 'KR', name: 'Corea del Sur', dial: '+82' },
    { iso: 'IN', name: 'India', dial: '+91' },
    { iso: 'AU', name: 'Australia', dial: '+61' },
];

export function phoneCountryFlagUrl(iso: string): string {
    return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
}
