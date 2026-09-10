import L from 'leaflet';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from 'react';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const OFFICE_POSITION: [number, number] = [
    19.440514000000007,
    -99.0865657,
];

const officeIcon = L.icon({
    iconUrl: markerIconUrl,
    iconRetinaUrl: markerIconRetinaUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'contacto-office-marker',
});

function MapReady() {
    const map = useMap();

    useEffect(() => {
        const timers = [50, 200, 400].map((delay) =>
            window.setTimeout(() => {
                map.invalidateSize();
                map.setView(OFFICE_POSITION, 16, { animate: false });
            }, delay),
        );

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [map]);

    return null;
}

export default function ContactoOfficeMap() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);

    if (!ready) {
        return (
            <div className="flex h-48 w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                Cargando mapa...
            </div>
        );
    }

    return (
        <MapContainer
            key={`${OFFICE_POSITION[0]}-${OFFICE_POSITION[1]}`}
            center={OFFICE_POSITION}
            zoom={16}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
            className="z-0 h-full w-full rounded-xl"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapReady />
            <Marker
                position={OFFICE_POSITION}
                icon={officeIcon}
                zIndexOffset={1000}
            >
                <Popup>
                    Medical Imaging Group
                    <br />
                    Oficina principal
                </Popup>
            </Marker>
        </MapContainer>
    );
}
