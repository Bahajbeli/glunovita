'use client';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

const createCustomIcon = (type: string) => {
  let svgPath = '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path>'; // default (plus circle)
  let bgColor = '#ef4444'; // rose-500
  
  if (type === 'STORE') {
    svgPath = '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>';
    bgColor = '#ef4444'; 
  } else if (type === 'PHARMACY') {
    svgPath = '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>';
    bgColor = '#10b981'; 
  } else if (type === 'RESTAURANT') {
    svgPath = '<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>';
    bgColor = '#f59e0b'; 
  }

  const htmlString = `
    <div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${svgPath}
      </svg>
    </div>
  `;

  return L.divIcon({
    html: htmlString,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

function MapClickHandler({ setPosition, onChange }: { setPosition: any, onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerClient({ 
  onLocationSelect, 
  initialLat, 
  initialLng,
  pointType = 'STORE'
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  pointType?: string;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition(L.latLng(initialLat, initialLng));
    } else {
      setPosition(null);
    }
  }, [initialLat, initialLng]);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', zIndex: 1 }} className="border border-slate-200">
      <MapContainer center={[36.8, 10.18]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler setPosition={setPosition} onChange={onLocationSelect} />
        {position && <Marker position={position} icon={createCustomIcon(pointType)} />}
      </MapContainer>
    </div>
  );
}
