import dynamic from 'next/dynamic';
import React from 'react';

const MapInner = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
            <div className="flex flex-col items-center">
                <svg className="w-10 h-10 mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Loading Map...</span>
            </div>
        </div>
    ),
});

export default MapInner;
