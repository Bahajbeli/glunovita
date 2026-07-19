'use client';
import dynamic from 'next/dynamic';

const LocationPickerClient = dynamic(() => import('./LocationPickerClient'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-500 text-sm">Chargement de la carte...</div>
});

export default function LocationPicker(props: any) {
  return <LocationPickerClient {...props} />;
}
