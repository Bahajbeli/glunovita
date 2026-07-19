'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
    lat: number;
    lng: number;
}

interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{
        id: string;
        position: [number, number];
        title: string;
        description?: string;
        onAction?: () => void;
        actionLabel?: string;
    }>;
    onLocationSelect?: (lat: number, lng: number) => void;
    selectedLocation?: Location | null;
    height?: string;
}

function LocationMarker({ onLocationSelect, selectedLocation }: { onLocationSelect?: (lat: number, lng: number) => void, selectedLocation?: Location | null }) {
    const [position, setPosition] = useState<L.LatLng | null>(selectedLocation ? new L.LatLng(selectedLocation.lat, selectedLocation.lng) : null);

    const map = useMapEvents({
        click(e) {
            if (onLocationSelect) {
                setPosition(e.latlng);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    useEffect(() => {
        if (selectedLocation) {
            const newPos = new L.LatLng(selectedLocation.lat, selectedLocation.lng);
            setPosition(newPos);
            map.flyTo(newPos, map.getZoom());
        }
    }, [selectedLocation, map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

const MapInner = ({
    center = [36.8065, 10.1815], // Default to Tunis
    zoom = 13,
    markers = [],
    onLocationSelect,
    selectedLocation,
    height = "400px"
}: MapProps) => {
    return (
        <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden', zIndex: 1, position: 'relative' }}>
            {/* Defines the map container with specified height, width, border radius and z-index */}
            <MapContainer 
                center={center} 
                zoom={zoom} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {(onLocationSelect || selectedLocation) && (
                    <LocationMarker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
                )}
                {markers.map((marker) => (
                    <Marker key={marker.id} position={marker.position}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg">{marker.title}</h3>
                                {marker.description && <p className="text-sm text-gray-600 mb-2">{marker.description}</p>}
                                {marker.onAction && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (marker.onAction) {
                                                marker.onAction();
                                            }
                                        }}
                                        className="w-full mt-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-sm active:scale-95"
                                    >
                                        {marker.actionLabel || 'Select'}
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapInner;
