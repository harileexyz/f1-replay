"use client";

import React from 'react';

interface LapSelectorProps {
    currentLap: number;
    availableLaps: number[];
    onSelectLap: (lap: number) => void;
}

export function LapSelector({ currentLap, availableLaps, onSelectLap }: LapSelectorProps) {
    return (
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/50 p-1 rounded-lg sm:rounded-xl border border-white/5 shrink-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 px-1 sm:px-2 uppercase tracking-widest hidden sm:block">Lap</span>
            <div className="flex gap-0.5 sm:gap-1 overflow-x-auto max-w-[100px] sm:max-w-[300px] scrollbar-hide py-1">
                {availableLaps.map(lap => (
                    <button
                        key={lap}
                        onClick={() => onSelectLap(lap)}
                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all shrink-0 ${currentLap === lap
                            ? 'bg-white text-black scale-105 sm:scale-110 shadow-lg'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {lap}
                    </button>
                ))}
            </div>
        </div>
    );
}
