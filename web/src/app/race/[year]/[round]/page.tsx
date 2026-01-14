"use client";

import { useState } from "react";
import { useRaceReplay } from "@/hooks/useRaceReplay";
import { TrackMap } from "@/components/TrackMap";
import { TelemetryChart } from "@/components/TelemetryChart";
import { RaceControls } from "@/components/RaceControls";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHUD } from "@/components/DashboardHUD";
import { AnalogDialsHUD } from "@/components/AnalogDialsHUD";
import { WeatherWidget } from "@/components/WeatherWidget";
import { RainOverlay } from "@/components/RainOverlay";
import { LapSelector } from "@/components/LapSelector";
import { useEngineAudio } from "@/hooks/useEngineAudio";
import { TrackMap3D } from "@/components/TrackMap3D";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RaceReplayPage() {
    const params = useParams();
    const year = parseInt(params.year as string);
    const round = parseInt(params.round as string);

    const {
        data,
        loading,
        error,
        isFromCache,
        playback,
        bounds,
        currentFrame,
        ghostFrame,
        actions,
        availableLaps
    } = useRaceReplay(year, round);

    const [activeTab, setActiveTab] = useState<'track' | 'telemetry'>('track');
    const [viewMode, setViewMode] = useState<'map' | 'chase' | 'cockpit'>('map');
    const [is3D, setIs3D] = useState(false);

    // Engine Audio Integration
    const selectedDriverData = playback.selectedDriver ? currentFrame?.drivers[playback.selectedDriver] : null;
    const { isEnabled: isAudioEnabled, initAudio } = useEngineAudio(
        selectedDriverData?.rpm || 0,
        selectedDriverData?.throttle || 0,
        selectedDriverData?.gear || 1,
        playback.isPlaying && !!playback.selectedDriver
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-slate-200 font-mono animate-pulse uppercase tracking-[0.3em] text-[10px] font-black">
                            INITIALIZING TELEMETRY STREAM
                        </p>
                        <p className="text-slate-500 font-mono text-[8px] uppercase tracking-wider">
                            Retrieving race data from {isFromCache ? "Local Storage" : "Satellite Link"}...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 p-8">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2 uppercase">Stream Error</h1>
                    <p className="text-slate-400 mb-6 text-sm">{error || "No race data found."}</p>
                    <Link
                        href="/"
                        className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        RETURN TO GRID
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 font-sans">
            {/* Sidebar */}
            <Sidebar
                data={data}
                currentFrame={currentFrame!}
                selectedDriver={playback.selectedDriver}
                comparisonDriver={playback.comparisonDriver}
                onSelectDriver={actions.selectDriver}
                onSelectComparison={actions.selectComparisonDriver}
                onRefresh={actions.refresh}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">

                {/* 2-Row Header System */}
                <div className="z-30 backdrop-blur-md bg-slate-950/80 border-b border-white/10 shadow-2xl flex flex-col">

                    {/* Row 1: Session Info & Global Controls */}
                    <div className="px-6 py-3 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 shadow-lg">
                                <Link href="/" className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white shrink-0" title="Back to Grid">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div className="h-6 w-[1px] bg-white/5 mx-1" />
                                <button
                                    onClick={actions.refresh}
                                    className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-red-500 shrink-0"
                                    title="Purge Cache & Refresh"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.3em] leading-tight mb-0.5">Session Live</span>
                                    {isFromCache && (
                                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-widest uppercase mb-0.5">
                                            Cached
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-white font-black italic uppercase text-lg tracking-tighter leading-none">
                                    {data.metadata?.event_name.replace(/_/g, ' ') || 'Bahrain Grand Prix'}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={initAudio}
                                    className={`p-2 rounded-lg border transition-all duration-500 ${isAudioEnabled
                                        ? 'bg-red-600/20 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white hover:border-slate-600'
                                        }`}
                                    title={isAudioEnabled ? "Mute Engine" : "Enable Engine Sound"}
                                >
                                    {isAudioEnabled ? (
                                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    )}
                                </button>
                                <div className="h-6 w-[1px] bg-white/10 mx-1" />
                                <WeatherWidget weather={currentFrame?.weather} />
                            </div>
                            <TrackStatusIndicator data={data} currentTime={playback.currentTime} />
                        </div>
                    </div>

                    {/* Row 2: Navigation Tabs & Lap Selector */}
                    <div className="px-6 py-2 flex items-center justify-between bg-white/[0.02]">
                        {/* Perspective Tabs */}
                        <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 shadow-inner">
                            <button
                                onClick={() => setActiveTab('track')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-3 tracking-widest ${activeTab === 'track' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M2 12h2m16 0h2" />
                                </svg>
                                TRACK VIEW
                            </button>
                            <button
                                onClick={() => setActiveTab('telemetry')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-3 tracking-widest ${activeTab === 'telemetry' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                TELEMETRY
                            </button>
                        </div>

                        {/* Session Progress - Middle */}
                        <div className="hidden lg:flex flex-col items-center gap-2 px-8 flex-1 max-w-md">
                            <div className="flex justify-between w-full text-[8px] font-black font-mono text-slate-500 uppercase tracking-widest">
                                <span>Lap {currentFrame?.lap || 0}</span>
                                <span>{data.total_laps || 0} Laps</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                                <div
                                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-300 relative z-10"
                                    style={{ width: `${((currentFrame?.lap || 0) / (data.total_laps || 1)) * 100}%` }}
                                />
                                {/* Grid lines for segments */}
                                <div className="absolute inset-0 flex justify-between px-1 opacity-20 pointer-events-none">
                                    {[...Array(5)].map((_, i) => <div key={i} className="w-[1px] h-full bg-white" />)}
                                </div>
                            </div>
                        </div>

                        {/* Lap Selector gets its own space */}
                        <LapSelector
                            currentLap={currentFrame?.lap || 1}
                            availableLaps={availableLaps}
                            onSelectLap={actions.seekToLap}
                        />
                    </div>
                </div>

                {/* Viewport Area */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Rain Effect */}
                    {currentFrame?.weather?.rain_state === "RAINING" && <RainOverlay />}

                    <div className={`absolute inset-0 p-6 transition-all duration-500 ${activeTab === 'track' ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        {bounds && currentFrame && (
                            <TrackMap
                                key="map-2d"
                                data={data}
                                currentFrame={currentFrame}
                                bounds={bounds}
                                selectedDriver={playback.selectedDriver}
                                ghostFrame={ghostFrame}
                                viewMode="map"
                                onDriverClick={actions.selectDriver}
                            />
                        )}
                    </div>
                    <div className={`absolute inset-0 p-6 transition-all duration-500 ${activeTab === 'telemetry' ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <TelemetryChart
                            data={data}
                            playback={playback}
                            onSeek={actions.seekTo}
                        />
                    </div>

                    {/* Dual HUD Overlay - Only show on Track View */}
                    {activeTab === 'track' && playback.selectedDriver && currentFrame?.drivers[playback.selectedDriver] && (
                        <>
                            {/* Bottom Left: Analog Dials */}
                            <div className="absolute bottom-20 left-20 z-50 pointer-events-none scale-95 origin-bottom-left">
                                <AnalogDialsHUD
                                    driverData={currentFrame.drivers[playback.selectedDriver]}
                                />
                            </div>

                            {/* Bottom Right: Digital Steering Wheel */}
                            <div className="absolute bottom-20 right-20 z-50 pointer-events-auto scale-95 origin-bottom-right">
                                <DashboardHUD
                                    driverCode={playback.selectedDriver}
                                    driverData={currentFrame.drivers[playback.selectedDriver]}
                                    color={`rgb(${data.driver_colors[playback.selectedDriver]?.join(',') || '255,255,255'})`}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Controls Area */}
                <div className="p-6 relative z-30">
                    <RaceControls
                        playback={playback}
                        onTogglePlay={actions.togglePlay}
                        onSetSpeed={actions.setSpeed}
                        onSeek={actions.seekTo}
                        totalFrames={data.frames.length}
                    />
                </div>
            </main>
        </div>
    );
}

function TrackStatusIndicator({ data, currentTime }: { data: any, currentTime: number }) {
    const currentStatus = data.track_statuses.find((s: any) =>
        currentTime >= s.start_time && (s.end_time === null || currentTime <= s.end_time)
    );

    if (!currentStatus || currentStatus.status === "1") return null;

    const statusMap: Record<string, { label: string, color: string }> = {
        "2": { label: "YELLOW FLAG", color: "bg-yellow-500" },
        "4": { label: "SAFETY CAR", color: "bg-yellow-600 animate-pulse" },
        "5": { label: "RED FLAG", color: "bg-red-600" },
        "6": { label: "VIRTUAL SAFETY CAR", color: "bg-yellow-500 animate-pulse" },
        "7": { label: "VSC ENDING", color: "bg-yellow-400" },
    };

    const info = statusMap[currentStatus.status] || { label: "TRACK STATUS", color: "bg-slate-700" };

    return (
        <div className={`${info.color} text-black font-black px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-black/10 text-xs whitespace-nowrap`}>
            {info.label}
        </div>
    );
}
