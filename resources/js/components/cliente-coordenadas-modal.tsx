import L from 'leaflet';
import { LocateFixed, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BRAND_COLOR } from '@/data/equipment';

export type Coordenadas = {
    latitud: number;
    longitud: number;
};

const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332];
const MAP_HEIGHT = 320;

const locationIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function MapResizeOnOpen({ open }: { open: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (!open) {
            return;
        }

        const timers = [150, 350, 600].map((delay) =>
            window.setTimeout(() => {
                map.invalidateSize();
            }, delay),
        );

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [map, open]);

    return null;
}

function MapViewUpdater({ value }: { value: Coordenadas | null }) {
    const map = useMap();

    useEffect(() => {
        if (!value) {
            return;
        }

        map.flyTo([value.latitud, value.longitud], 16, {
            animate: true,
            duration: 0.8,
        });

        const timer = window.setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => window.clearTimeout(timer);
    }, [map, value?.latitud, value?.longitud]);

    return null;
}

function MapClickHandler({
    onSelect,
}: {
    onSelect: (coords: Coordenadas) => void;
}) {
    useMapEvents({
        click(event) {
            onSelect({
                latitud: Number(event.latlng.lat.toFixed(7)),
                longitud: Number(event.latlng.lng.toFixed(7)),
            });
        },
    });

    return null;
}

function CoordenadasMap({
    open,
    value,
    focus,
    onChange,
}: {
    open: boolean;
    value: Coordenadas | null;
    focus?: MapaEnfoque | null;
    onChange: (coords: Coordenadas) => void;
}) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);

    if (!ready) {
        return (
            <div
                className="flex w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground"
                style={{ height: MAP_HEIGHT }}
            >
                Cargando mapa...
            </div>
        );
    }

    const center: [number, number] = value
        ? [value.latitud, value.longitud]
        : focus
          ? [focus.latitud, focus.longitud]
          : DEFAULT_CENTER;
    const zoom = value ? 16 : (focus?.zoom ?? 5);

    return (
        <div
            className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800"
            style={{ height: MAP_HEIGHT }}
        >
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom
                style={{ height: MAP_HEIGHT, width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizeOnOpen open={open} />
                <MapViewUpdater value={value} />
                <MapClickHandler onSelect={onChange} />
                {value && (
                    <Marker
                        position={[value.latitud, value.longitud]}
                        icon={locationIcon}
                    />
                )}
            </MapContainer>
            {value ? null : (
                <p className="pointer-events-none absolute inset-x-3 bottom-3 z-10 rounded-lg bg-black/80 px-3 py-2 text-center text-sm font-semibold text-white">
                    Haga clic en el mapa para marcar el lugar
                </p>
            )}
        </div>
    );
}

function formatCoordenadasInput(coords: Coordenadas | null): string {
    if (!coords) {
        return '';
    }

    return `${coords.latitud}, ${coords.longitud}`;
}

function parseCoordenadasText(value: string): Coordenadas | null {
    const trimmed = value.trim();

    if (trimmed === '') {
        return null;
    }

    const parts = trimmed.split(',').map((part) => part.trim());

    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
        return null;
    }

    const lat = Number(parts[0]);
    const lng = Number(parts[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
    }

    return {
        latitud: Number(lat.toFixed(7)),
        longitud: Number(lng.toFixed(7)),
    };
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Permita el acceso a su ubicación en el navegador para usar esta opción.';
        case error.POSITION_UNAVAILABLE:
            return 'Su ubicación no está disponible en este momento.';
        case error.TIMEOUT:
            return 'La solicitud de ubicación tardó demasiado. Inténtelo de nuevo.';
        default:
            return 'No se pudo obtener su ubicación. Selecciónela manualmente en el mapa.';
    }
}

export type MapaEnfoque = Coordenadas & {
    zoom: number;
};

type ClienteCoordenadasModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: Coordenadas | null;
    onConfirm: (coords: Coordenadas) => void;
    focus?: MapaEnfoque | null;
};

export default function ClienteCoordenadasModal({
    open,
    onOpenChange,
    value,
    onConfirm,
    focus = null,
}: ClienteCoordenadasModalProps) {
    const [draft, setDraft] = useState<Coordenadas | null>(value);
    const [coordenadasInput, setCoordenadasInput] = useState('');
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const syncInput = (coords: Coordenadas | null) => {
        setCoordenadasInput(formatCoordenadasInput(coords));
    };

    const updateDraft = (coords: Coordenadas | null) => {
        setDraft(coords);
        syncInput(coords);
    };

    useEffect(() => {
        if (open) {
            updateDraft(value);
            setLocationError(null);
        }
    }, [open, value]);

    const applyManualCoordinates = (rawValue = coordenadasInput) => {
        const parsed = parseCoordenadasText(rawValue);

        if (parsed) {
            setDraft(parsed);
            setCoordenadasInput(formatCoordenadasInput(parsed));
            setLocationError(null);

            return true;
        }

        if (rawValue.trim() !== '') {
            setLocationError(
                'Pegue las coordenadas en formato: latitud, longitud. Ejemplo: 20.125455, -98.792666',
            );
        }

        return false;
    };

    const handleCoordenadasInputChange = (value: string) => {
        setCoordenadasInput(value);
        setLocationError(null);

        const parsed = parseCoordenadasText(value);

        if (parsed) {
            setDraft(parsed);
        }
    };

    const useCurrentLocation = () => {
        if (!window.isSecureContext) {
            setLocationError(
                'La geolocalización requiere una conexión segura (HTTPS).',
            );

            return;
        }

        if (!navigator.geolocation) {
            setLocationError('Su navegador no permite obtener la ubicación.');

            return;
        }

        setLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitud: Number(position.coords.latitude.toFixed(7)),
                    longitud: Number(position.coords.longitude.toFixed(7)),
                };

                setDraft(coords);
                setCoordenadasInput(formatCoordenadasInput(coords));
                setLocating(false);
            },
            (error) => {
                setLocationError(geolocationErrorMessage(error));
                setLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    };

    const handleConfirm = () => {
        const coords =
            parseCoordenadasText(coordenadasInput) ?? draft;

        if (!coords) {
            setLocationError(
                'Seleccione un punto en el mapa o pegue las coordenadas en formato: latitud, longitud.',
            );

            return;
        }

        onConfirm(coords);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Ingresar coordenadas</DialogTitle>
                    <DialogDescription>
                        Marque el lugar del equipo. Puede hacerlo de tres
                        formas:
                    </DialogDescription>
                </DialogHeader>

                <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
                    <li>Haga clic en el mapa, justo sobre el lugar.</li>
                    <li>
                        Pulse{' '}
                        <span className="font-semibold">Usar mi ubicación</span>{' '}
                        si usted está en ese lugar.
                    </li>
                    <li>
                        Pegue la latitud y la longitud separadas por una coma.
                        Ejemplo: 20.125455, -98.792666.
                    </li>
                </ol>
                <p className="text-sm font-semibold text-foreground">
                    Cuando el punto sea el correcto, pulse Confirmar ubicación.
                </p>

                <div className="space-y-4">
                    {open && (
                        <CoordenadasMap
                            open={open}
                            value={draft}
                            focus={focus}
                            onChange={(coords) => {
                                updateDraft(coords);
                                setLocationError(null);
                            }}
                        />
                    )}

                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={useCurrentLocation}
                            disabled={locating}
                            className="gap-2"
                        >
                            <LocateFixed className="size-4" />
                            {locating
                                ? 'Obteniendo ubicación...'
                                : 'Usar mi ubicación'}
                        </Button>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="coordenadas-input"
                                className="inline-flex items-center gap-1.5"
                            >
                                <MapPin
                                    className="size-3.5"
                                    style={{ color: BRAND_COLOR }}
                                />
                                Coordenadas
                            </Label>
                            <Input
                                id="coordenadas-input"
                                type="text"
                                value={coordenadasInput}
                                onChange={(event) =>
                                    handleCoordenadasInputChange(
                                        event.target.value,
                                    )
                                }
                                onBlur={() => applyManualCoordinates()}
                                onPaste={(event) => {
                                    const pasted =
                                        event.clipboardData.getData('text');

                                    window.setTimeout(() => {
                                        applyManualCoordinates(pasted);
                                    }, 0);
                                }}
                                placeholder="20.125455078576326, -98.7926666117937"
                            />
                            <p className="text-xs text-muted-foreground">
                                Ejemplo: 20.125455, -98.792666.
                            </p>
                        </div>
                    </div>

                    {locationError && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {locationError}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        style={{ backgroundColor: BRAND_COLOR }}
                        className="text-white hover:opacity-90"
                    >
                        Confirmar ubicación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function formatCoordenadas(coords: Coordenadas | null): string | null {
    if (!coords) {
        return null;
    }

    return `${coords.latitud.toFixed(6)}, ${coords.longitud.toFixed(6)}`;
}
