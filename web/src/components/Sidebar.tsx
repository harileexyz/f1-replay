"use client";

import React, { useState } from 'react';
import { RaceData, Frame } from '@/types/race';
import { TrackMetaWidget } from './TrackMetaWidget';

interface SidebarProps {
    data: RaceData;
    currentFrame: Frame;
    selectedDriver: string | null;
    comparisonDriver: string | null;
    onSelectDriver: (code: string | null) => void;
    onSelectComparison: (code: string | null) => void;
    onRefresh?: () => void;
}

export function Sidebar({ data, currentFrame, selectedDriver, comparisonDriver, onSelectDriver, onSelectComparison, onRefresh }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'track'>('leaderboard');

    // Sort drivers by position
    const sortedDrivers = Object.entries(currentFrame.drivers)
        .sort(([, a], [, b]) => (a.position || 0) - (b.position || 0));

    return (
        <div className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-black text-white tracking-tighter italic">F1 REPLAY</h2>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-tight">
                        {data.metadata?.event_name || 'Race Replay'}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-white text-[10px] font-mono tracking-tighter uppercase">Live Telemetry</span>
                    </div>
                </div>
            </div>

            {/* Tab Selector */}
            <div className="flex p-2 gap-1 bg-slate-950/50 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-tighter ${activeTab === 'leaderboard' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Leaderboard
                </button>
                <button
                    onClick={() => setActiveTab('track')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-tighter ${activeTab === 'track' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Track Info
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                {activeTab === 'leaderboard' ? (
                    sortedDrivers.map(([code, telemetry]) => {
                        const color = data.driver_colors[code] || [255, 255, 255];
                        const colorStr = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                        const isSelected = selectedDriver === code;
                        const isComparing = comparisonDriver === code;

                        return (
                            <div
                                key={code}
                                className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all border ${isSelected
                                    ? 'bg-slate-800 border-slate-700 shadow-lg'
                                    : isComparing
                                        ? 'bg-slate-900 border-white/20'
                                        : 'border-transparent hover:bg-slate-800/50'
                                    }`}
                            >
                                {/* Comparison Selection (Hidden unless hovering or active) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectComparison(isComparing ? null : code);
                                    }}
                                    className={`absolute right-2 top-2 p-1 rounded-md transition-all z-20 ${isComparing
                                        ? 'bg-white text-black opacity-100'
                                        : 'bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white'
                                        }`}
                                    title="Set as Ghost for Comparison"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => onSelectDriver(isSelected ? null : code)}
                                    className="flex-1 flex items-center gap-3 text-left"
                                >
                                    <div
                                        className="w-1.5 h-10 rounded-full shrink-0"
                                        style={{ backgroundColor: colorStr }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className={`font-black text-white text-base tracking-tight ${isSelected ? 'italic' : ''}`}>{code}</span>
                                            <span className="text-[10px] text-slate-500 font-mono font-bold">P{telemetry.position}</span>
                                        </div>
                                        <div className="flex justify-between text-[9px] font-mono">
                                            <span className="text-slate-400">{telemetry.speed} KM/H</span>
                                            {isSelected && <span className="text-red-500 font-bold animate-pulse">ACTIVE</span>}
                                            {isComparing && <span className="text-white font-bold tracking-widest">GHOST</span>}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-2">
                        <TrackMetaWidget
                            data={data}
                            currentFrame={currentFrame}
                            currentTime={currentFrame.t}
                        />
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest text-center">
                    OpenF1 Data Stream
                </div>
            </div>
        </div >
    );
}
