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
import { IsometricTrackView } from "@/components/IsometricTrackView";
import { ThreeDRacingView } from "@/components/ThreeDRacingView";
import { TireDegradationChart } from "@/components/TireDegradationChart";
import { HeadToHeadMode } from "@/components/HeadToHead";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RaceReplayPage() {
    const params = useParams();
    const year = parseInt(params.year as string);
    const round = parseInt(params.round as string);

    const {
        data,
        loading,
        loadingProgress,
        loadingStage,
        error,
        isFromCache,
        playback,
        bounds,
        currentFrame,
        ghostFrame,
        actions,
        availableLaps
    } = useRaceReplay(year, round);

    const [activeTab, setActiveTab] = useState<'track' | 'track3d' | 'telemetry' | 'tires' | 'h2h'>('track');
    const [viewMode, setViewMode] = useState<'map' | 'chase' | 'cockpit'>('map');
    const [view3dMode, setView3dMode] = useState<'isometric' | 'racing'>('isometric');
    const [is3D, setIs3D] = useState(false);
    const [isMobileHUDOpen, setIsMobileHUDOpen] = useState(false);
    const [h2hDriver2, setH2hDriver2] = useState<string | null>(null);

    // Engine Audio Integration
    const selectedDriverData = playback.selectedDriver ? currentFrame?.drivers[playback.selectedDriver] : null;
    const { isEnabled: isAudioEnabled, initAudio } = useEngineAudio(
        selectedDriverData?.rpm || 0,
        selectedDriverData?.throttle || 0,
        selectedDriverData?.gear || 1,
        playback.isPlaying && !!playback.selectedDriver
    );

    // Loading stage messages
    const stageMessages: Record<string, string> = {
        init: 'Initializing...',
        cache: 'Checking local cache...',
        fetching: 'Connecting to telemetry server...',
        downloading: 'Downloading race data...',
        parsing: 'Processing telemetry frames...',
        ready: 'Ready!'
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8">
                    {/* Spinner */}
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-800 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-black text-sm">{loadingProgress}%</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-2">
                            <span className="uppercase tracking-wider">{stageMessages[loadingStage]}</span>
                            <span>{loadingProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col items-center gap-1 mt-2">
                        <p className="text-slate-200 font-mono uppercase tracking-[0.2em] text-[10px] font-black">
                            LOADING TELEMETRY
                        </p>
                        <p className="text-slate-600 font-mono text-[8px] uppercase tracking-wider text-center">
                            {year} Round {round} • {loadingStage === 'cache' ? 'Checking Cache' : 'Firebase Storage'}
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
                    <div className="px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg sm:rounded-xl border border-white/5 shadow-lg relative z-10">
                                <Link href="/" className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white shrink-0 pointer-events-auto" title="Back to Grid">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div className="hidden sm:block h-6 w-[1px] bg-white/5 mx-1" />
                                <button
                                    onClick={actions.refresh}
                                    className="hidden sm:block p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-red-500 shrink-0"
                                    title="Purge Cache & Refresh"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-tight mb-0.5">Session Live</span>
                                    {isFromCache && (
                                        <span className="hidden sm:inline bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[7px] font-black px-1.5 py-0.5 rounded-sm tracking-widest uppercase mb-0.5">
                                            Cached
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-white font-black italic uppercase text-sm sm:text-lg tracking-tighter leading-none truncate max-w-[150px] sm:max-w-none">
                                    {data.metadata?.event_name.replace(/_/g, ' ') || 'Bahrain Grand Prix'}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/50 p-1 rounded-lg sm:rounded-xl border border-white/5">
                                <button
                                    onClick={initAudio}
                                    className={`p-1.5 sm:p-2 rounded-lg border transition-all duration-500 ${isAudioEnabled
                                        ? 'bg-red-600/20 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white hover:border-slate-600'
                                        }`}
                                    title={isAudioEnabled ? "Mute Engine" : "Enable Engine Sound"}
                                >
                                    {isAudioEnabled ? (
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    )}
                                </button>
                                <div className="hidden sm:block h-6 w-[1px] bg-white/10 mx-1" />
                                <div className="hidden sm:block">
                                    <WeatherWidget weather={currentFrame?.weather} />
                                </div>
                            </div>
                            <TrackStatusIndicator data={data} currentTime={playback.currentTime} />
                        </div>
                    </div>

                    {/* Row 2: Navigation Tabs & Lap Selector */}
                    <div className="px-3 sm:px-6 py-2 flex items-center justify-between bg-white/[0.02] gap-2 overflow-x-auto">
                        {/* Perspective Tabs */}
                        <div className="flex bg-slate-900/40 p-1 rounded-xl sm:rounded-2xl border border-white/5 shadow-inner shrink-0">
                            <button
                                onClick={() => setActiveTab('track')}
                                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1.5 sm:gap-3 tracking-widest ${activeTab === 'track' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M2 12h2m16 0h2" />
                                </svg>
                                <span className="hidden xs:inline">2D</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('track3d')}
                                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1.5 sm:gap-3 tracking-widest ${activeTab === 'track3d' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                </svg>
                                <span className="hidden xs:inline">3D</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('telemetry')}
                                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1.5 sm:gap-3 tracking-widest ${activeTab === 'telemetry' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                <span className="hidden xs:inline">TELEMETRY</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('tires')}
                                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1.5 sm:gap-3 tracking-widest ${activeTab === 'tires' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="8" strokeWidth={2} />
                                    <circle cx="12" cy="12" r="4" strokeWidth={2} />
                                </svg>
                                <span className="hidden xs:inline">TIRES</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('h2h')}
                                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1.5 sm:gap-3 tracking-widest ${activeTab === 'h2h' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <span className="hidden xs:inline">H2H</span>
                            </button>
                        </div>

                        {/* Session Progress - Middle (hidden on mobile) */}
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

                    <div className={`absolute inset-0 p-2 sm:p-6 transition-all duration-500 ${activeTab === 'track' ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none'}`}>
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
                    <div className={`absolute inset-0 p-2 sm:p-6 transition-all duration-500 ${activeTab === 'track3d' ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        {/* 3D View Mode Toggle */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setView3dMode('isometric')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view3dMode === 'isometric'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                ISOMETRIC
                            </button>
                            <button
                                onClick={() => setView3dMode('racing')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view3dMode === 'racing'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                3D RACING
                            </button>
                        </div>

                        {/* Isometric View */}
                        {bounds && currentFrame && view3dMode === 'isometric' && (
                            <IsometricTrackView
                                data={data}
                                currentFrame={currentFrame}
                                bounds={bounds}
                                selectedDriver={playback.selectedDriver}
                                onDriverClick={actions.selectDriver}
                            />
                        )}

                        {/* 3D Racing View */}
                        {bounds && currentFrame && view3dMode === 'racing' && (
                            <ThreeDRacingView
                                data={data}
                                currentFrame={currentFrame}
                                bounds={bounds}
                                selectedDriver={playback.selectedDriver}
                                onDriverClick={actions.selectDriver}
                            />
                        )}
                    </div>
                    <div className={`absolute inset-0 p-2 sm:p-6 transition-all duration-500 ${activeTab === 'telemetry' ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <TelemetryChart
                            data={data}
                            playback={playback}
                            onSeek={actions.seekTo}
                        />
                    </div>
                    <div className={`absolute inset-0 transition-all duration-500 ${activeTab === 'tires' ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <div className="h-full bg-slate-900/90 border border-slate-800 rounded-2xl m-2 sm:m-6 overflow-hidden">
                            <TireDegradationChart
                                data={data}
                                selectedDriver={playback.selectedDriver}
                                comparisonDriver={playback.comparisonDriver}
                            />
                        </div>
                    </div>
                    <div className={`absolute inset-0 transition-all duration-500 ${activeTab === 'h2h' ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <div className="h-full m-2 sm:m-6">
                            <HeadToHeadMode
                                data={data}
                                currentFrame={currentFrame}
                                driver1={playback.selectedDriver}
                                driver2={h2hDriver2}
                                onSelectDriver1={actions.selectDriver}
                                onSelectDriver2={setH2hDriver2}
                            />
                        </div>
                    </div>

                    {/* Desktop HUD Overlays - Hidden on mobile */}
                    {activeTab === 'track' && playback.selectedDriver && currentFrame?.drivers[playback.selectedDriver] && (
                        <>
                            {/* Bottom Left: Analog Dials - Desktop only */}
                            <div className="hidden md:block absolute bottom-20 left-4 lg:left-20 z-50 pointer-events-none scale-75 lg:scale-95 origin-bottom-left">
                                <AnalogDialsHUD
                                    driverData={currentFrame.drivers[playback.selectedDriver]}
                                />
                            </div>

                            {/* Bottom Right: Digital Steering Wheel - Desktop only */}
                            <div className="hidden md:block absolute bottom-20 right-4 lg:right-20 z-50 pointer-events-auto scale-75 lg:scale-95 origin-bottom-right">
                                <DashboardHUD
                                    driverCode={playback.selectedDriver}
                                    driverData={currentFrame.drivers[playback.selectedDriver]}
                                    color={`rgb(${data.driver_colors[playback.selectedDriver]?.join(',') || '255,255,255'})`}
                                />
                            </div>
                        </>
                    )}

                    {/* Mobile HUD Toggle Button */}
                    {activeTab === 'track' && playback.selectedDriver && (
                        <button
                            onClick={() => setIsMobileHUDOpen(!isMobileHUDOpen)}
                            className="md:hidden fixed bottom-24 right-4 z-50 bg-slate-800 border border-slate-700 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </button>
                    )}

                    {/* Mobile HUD Bottom Sheet */}
                    {activeTab === 'track' && playback.selectedDriver && currentFrame?.drivers[playback.selectedDriver] && (
                        <>
                            {/* Backdrop */}
                            {isMobileHUDOpen && (
                                <div
                                    className="md:hidden fixed inset-0 bg-black/40 z-40"
                                    onClick={() => setIsMobileHUDOpen(false)}
                                />
                            )}

                            {/* Bottom Sheet */}
                            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 rounded-t-3xl transform transition-transform duration-300 ${isMobileHUDOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                                {/* Handle */}
                                <div className="flex justify-center pt-3 pb-2">
                                    <div className="w-12 h-1 bg-slate-600 rounded-full" />
                                </div>

                                {/* Header */}
                                <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-1 h-8 rounded-full"
                                            style={{ backgroundColor: `rgb(${data.driver_colors[playback.selectedDriver]?.join(',') || '255,255,255'})` }}
                                        />
                                        <div>
                                            <p className="text-white font-black text-lg tracking-tight">{playback.selectedDriver}</p>
                                            <p className="text-slate-500 text-xs font-mono">P{currentFrame.drivers[playback.selectedDriver].position}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsMobileHUDOpen(false)}
                                        className="p-2 rounded-lg bg-slate-800 text-slate-400"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Telemetry Grid */}
                                <div className="grid grid-cols-4 gap-2 p-4">
                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Speed</p>
                                        <p className="text-white text-xl font-black">{currentFrame.drivers[playback.selectedDriver].speed}</p>
                                        <p className="text-slate-600 text-[8px] font-mono">KM/H</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">RPM</p>
                                        <p className="text-white text-xl font-black">{Math.round((currentFrame.drivers[playback.selectedDriver].rpm || 0) / 1000)}K</p>
                                        <p className="text-slate-600 text-[8px] font-mono">REV</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Gear</p>
                                        <p className="text-white text-xl font-black">{currentFrame.drivers[playback.selectedDriver].gear || 'N'}</p>
                                        <p className="text-slate-600 text-[8px] font-mono">GEAR</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Throttle</p>
                                        <p className="text-white text-xl font-black">{currentFrame.drivers[playback.selectedDriver].throttle || 0}%</p>
                                        <p className="text-slate-600 text-[8px] font-mono">THR</p>
                                    </div>
                                </div>

                                {/* Pedal Bars */}
                                <div className="flex gap-3 px-4 pb-6">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                                            <span>THROTTLE</span>
                                            <span className="text-green-500">{currentFrame.drivers[playback.selectedDriver].throttle || 0}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-100"
                                                style={{ width: `${currentFrame.drivers[playback.selectedDriver].throttle || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                                            <span>BRAKE</span>
                                            <span className="text-red-500">{currentFrame.drivers[playback.selectedDriver].brake || 0}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100"
                                                style={{ width: `${currentFrame.drivers[playback.selectedDriver].brake || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Controls Area */}
                <div className="p-2 sm:p-6 relative z-30">
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
