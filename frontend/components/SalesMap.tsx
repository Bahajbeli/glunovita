'use client';
import dynamic from 'next/dynamic';

const SalesMapClient = dynamic(() => import('./SalesMapClient'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-500 font-medium border border-slate-200 shadow-sm">Loading Map Engine...</div>
});

export default function SalesMap({ points }: { points: any[] }) {
  return <SalesMapClient points={points} />;
}
