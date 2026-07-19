'use client';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Default icon (if needed)
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const createCustomIcon = (type: string) => {
  let svgPath = '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path>'; // default (plus circle)
  let bgColor = '#ef4444'; // rose-500
  
  if (type === 'STORE') {
    // Shopping bag
    svgPath = '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>';
    bgColor = '#ef4444'; // Red (like in the screenshot)
  } else if (type === 'PHARMACY') {
    // Medical Cross
    svgPath = '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>';
    bgColor = '#10b981'; // Green
  } else if (type === 'RESTAURANT') {
    // Coffee cup
    svgPath = '<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>';
    bgColor = '#f59e0b'; // Amber
  } else if (type === 'DEFAULT') {
    return defaultIcon;
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
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

interface SalesPoint {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pointType?: string;
  description?: string;
}

export default function SalesMapClient({ points }: { points: SalesPoint[] }) {
  const defaultCenter = points.length > 0 ? [points[0].latitude, points[0].longitude] : [36.8, 10.18];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 1 }} className="border border-slate-200 shadow-sm">
      <MapContainer center={defaultCenter as [number, number]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point) => (
          <Marker 
            key={point._id} 
            position={[point.latitude, point.longitude]} 
            icon={createCustomIcon(point.pointType || 'STORE')}
          >
            <Tooltip permanent direction="right" offset={[15, 0]} className="font-semibold bg-white border-0 shadow-sm rounded-lg text-slate-800 text-sm px-2 py-1">
              {point.name}
            </Tooltip>
            <Popup>
              <div className="text-sm min-w-[200px]">
                <strong className="text-lg text-primary-700 block mb-1">{point.name}</strong>
                <span className="text-slate-600 block">{point.address}</span>
                {point.description && <p className="mt-2 text-slate-500 text-xs italic">{point.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
