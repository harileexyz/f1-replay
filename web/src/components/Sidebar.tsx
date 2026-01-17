"use client";

import React, { useState } from 'react';
import { RaceData, Frame } from '@/types/race';
import { TrackMetaWidget } from './TrackMetaWidget';
import { DriverProfile } from './DriverProfile';

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
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [profileDriver, setProfileDriver] = useState<string | null>(null);

    // Sort drivers by position
    const sortedDrivers = Object.entries(currentFrame.drivers)
        .sort(([, a], [, b]) => (a.position || 0) - (b.position || 0));

    const sidebarContent = (
        <>
            <div className="p-4 sm:p-6 border-b border-slate-800">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tighter italic">F1 REPLAY</h2>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
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
                                className={`group relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all border ${isSelected
                                    ? 'bg-slate-800 border-slate-700 shadow-lg'
                                    : isComparing
                                        ? 'bg-slate-900 border-white/20'
                                        : 'border-transparent hover:bg-slate-800/50'
                                    }`}
                            >
                                {/* Driver Profile Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setProfileDriver(code);
                                    }}
                                    className="absolute right-8 top-2 p-1 rounded-md transition-all z-20 bg-slate-700/50 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-slate-600"
                                    title="View Driver Profile"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </button>

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
                                    onClick={() => {
                                        onSelectDriver(isSelected ? null : code);
                                        // Close mobile sidebar after selection
                                        if (window.innerWidth < 1024) {
                                            setIsMobileOpen(false);
                                        }
                                    }}
                                    className="flex-1 flex items-center gap-2 sm:gap-3 text-left"
                                >
                                    <div
                                        className="w-1 sm:w-1.5 h-8 sm:h-10 rounded-full shrink-0"
                                        style={{ backgroundColor: colorStr }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className={`font-black text-white text-sm sm:text-base tracking-tight ${isSelected ? 'italic' : ''}`}>{code}</span>
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

            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
                <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest text-center">
                    OpenF1 Data Stream
                </div>
            </div>

            {/* Driver Profile Modal */}
            {profileDriver && (
                <DriverProfile
                    driverCode={profileDriver}
                    isOpen={!!profileDriver}
                    onClose={() => setProfileDriver(null)}
                    currentPosition={currentFrame.drivers[profileDriver]?.position}
                    currentSpeed={currentFrame.drivers[profileDriver]?.speed}
                    driverColor={data.driver_colors[profileDriver] ? `rgb(${data.driver_colors[profileDriver].join(',')})` : undefined}
                />
            )}
        </>
    );

    return (
        <>
            {/* Mobile Toggle Button - Fixed at bottom left */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed bottom-24 left-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg shadow-red-900/30 hover:bg-red-500 transition-all"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </button>

            {/* Mobile Drawer Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-64 h-full bg-slate-900 border-r border-slate-800 flex-col shadow-2xl overflow-hidden">
                {sidebarContent}
            </div>

            {/* Mobile Drawer */}
            <div className={`lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </div>
        </>
    );
}
