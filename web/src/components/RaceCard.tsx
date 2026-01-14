"use client";

import React from 'react';
import { RaceMetadata } from '@/types/race';

interface RaceCardProps {
    race: {
        year: number;
        round: number;
        event_name: string;
        uploaded_at: any;
    };
    onClick: () => void;
}

export function RaceCard({ race, onClick }: RaceCardProps) {
    return (
        <button
            onClick={onClick}
            className="group relative bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-red-600/50 rounded-2xl p-6 transition-all text-left overflow-hidden shadow-xl"
        >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-red-600/10 blur-3xl group-hover:bg-red-600/20 transition-all rounded-full" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-red-500 font-mono text-sm font-bold tracking-tighter uppercase">
                        ROUND {race.round} • {race.year}
                    </span>
                    <div className="bg-slate-800 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>

                <h3 className="text-2xl font-black text-white italic tracking-tight mb-2 group-hover:text-red-500 transition-colors uppercase">
                    {race.event_name.replace(/_/g, ' ')}
                </h3>

                <div className="flex items-center gap-4 text-slate-500 text-xs font-mono">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                        AVAILABLE
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>FULL TELEMETRY</span>
                </div>
            </div>
        </button>
    );
}
