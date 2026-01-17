"use client";

import { useMemo } from 'react';
import { RaceData, Frame } from '@/types/race';

interface HeadToHeadProps {
    data: RaceData;
    currentFrame: Frame | null;
    driver1: string | null;
    driver2: string | null;
    onSelectDriver1: (code: string | null) => void;
    onSelectDriver2: (code: string | null) => void;
}

interface DriverStats {
    code: string;
    position: number;
    speed: number;
    rpm: number;
    gear: number;
    throttle: number;
    brake: number;
    drs: boolean;
    lap: number;
    color: string;
}

export function HeadToHeadMode({ data, currentFrame, driver1, driver2, onSelectDriver1, onSelectDriver2 }: HeadToHeadProps) {
    // Get all available drivers
    const availableDrivers = useMemo(() => {
        if (!currentFrame) return [];
        return Object.entries(currentFrame.drivers)
            .sort(([, a], [, b]) => (a.position || 99) - (b.position || 99))
            .map(([code]) => code);
    }, [currentFrame]);

    // Get driver stats
    const getDriverStats = (code: string | null): DriverStats | null => {
        if (!code || !currentFrame?.drivers[code]) return null;
        const d = currentFrame.drivers[code];
        const colors = data.driver_colors[code] || [255, 255, 255];
        return {
            code,
            position: d.position || 0,
            speed: d.speed || 0,
            rpm: d.rpm || 0,
            gear: d.gear || 0,
            throttle: d.throttle || 0,
            brake: d.brake || 0,
            drs: !!d.drs,
            lap: d.lap || 0,
            color: `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`
        };
    };

    const stats1 = getDriverStats(driver1);
    const stats2 = getDriverStats(driver2);

    // Calculate delta
    const delta = useMemo(() => {
        if (!stats1 || !stats2 || !currentFrame) return null;

        // Simple position-based delta indicator
        const posDiff = stats1.position - stats2.position;

        // Calculate approximate gap based on lap progress
        // This is a simplified version - real gap would need lap timing data
        const lapDiff = stats1.lap - stats2.lap;

        return {
            positionDiff: posDiff,
            lapDiff,
            leader: posDiff < 0 ? driver1 : posDiff > 0 ? driver2 : null
        };
    }, [stats1, stats2, currentFrame, driver1, driver2]);

    // Driver selector dropdown
    const DriverSelector = ({
        value,
        onChange,
        excludeDriver,
        label
    }: {
        value: string | null;
        onChange: (code: string | null) => void;
        excludeDriver: string | null;
        label: string;
    }) => (
        <div className="flex-1">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">
                {label}
            </label>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value || null)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em'
                }}
            >
                <option value="">Select Driver</option>
                {availableDrivers
                    .filter(d => d !== excludeDriver)
                    .map(code => (
                        <option key={code} value={code}>
                            P{currentFrame?.drivers[code]?.position || '?'} - {code}
                        </option>
                    ))}
            </select>
        </div>
    );

    // Stat card component
    const StatCard = ({ label, value, unit, color }: { label: string; value: number | string; unit?: string; color?: string }) => (
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white text-xl sm:text-2xl font-black" style={{ color }}>
                {value}
                {unit && <span className="text-slate-500 text-xs ml-1">{unit}</span>}
            </p>
        </div>
    );

    // Pedal bar component
    const PedalBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-8 font-bold">{label}</span>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-100 rounded-full"
                    style={{ width: `${value}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-[10px] text-slate-400 w-8 text-right font-mono">{Math.round(value)}%</span>
        </div>
    );

    // Driver panel component
    const DriverPanel = ({ stats, isLeft }: { stats: DriverStats | null; isLeft: boolean }) => {
        if (!stats) {
            return (
                <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-sm">Select a driver</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
                {/* Header with team color */}
                <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: stats.color }}
                />

                <div className="p-4">
                    {/* Driver Code & Position */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                                style={{ backgroundColor: stats.color, color: '#000' }}
                            >
                                {stats.code}
                            </div>
                            <div>
                                <p className="text-white font-black text-2xl">P{stats.position}</p>
                                <p className="text-slate-500 text-xs font-mono">LAP {stats.lap}</p>
                            </div>
                        </div>
                        {stats.drs && (
                            <div className="px-3 py-1 bg-green-500 text-black font-black text-xs rounded-lg animate-pulse">
                                DRS
                            </div>
                        )}
                    </div>

                    {/* Speed & RPM */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <StatCard label="Speed" value={stats.speed} unit="km/h" />
                        <StatCard label="Gear" value={stats.gear} />
                    </div>

                    {/* RPM Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 font-bold">RPM</span>
                            <span className="text-white font-mono">{stats.rpm.toLocaleString()}</span>
                        </div>
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-100 rounded-full"
                                style={{
                                    width: `${Math.min(100, (stats.rpm / 15000) * 100)}%`,
                                    background: stats.rpm > 12000
                                        ? 'linear-gradient(90deg, #22c55e, #eab308, #ef4444)'
                                        : 'linear-gradient(90deg, #22c55e, #22c55e)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Pedal Inputs */}
                    <div className="space-y-2">
                        <PedalBar label="THR" value={stats.throttle} color="#22c55e" />
                        <PedalBar label="BRK" value={stats.brake} color="#ef4444" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-950 rounded-2xl overflow-hidden">
            {/* Header - Driver Selection */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <DriverSelector
                        value={driver1}
                        onChange={onSelectDriver1}
                        excludeDriver={driver2}
                        label="Driver 1"
                    />

                    <div className="flex flex-col items-center">
                        <span className="text-slate-600 text-xl font-black">VS</span>
                    </div>

                    <DriverSelector
                        value={driver2}
                        onChange={onSelectDriver2}
                        excludeDriver={driver1}
                        label="Driver 2"
                    />
                </div>
            </div>

            {/* Delta Display */}
            {delta && stats1 && stats2 && (
                <div className="px-4 py-3 bg-slate-900/30 border-b border-slate-800">
                    <div className="flex items-center justify-center gap-4">
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${delta.leader === driver1 ? 'bg-green-500/20' : 'bg-slate-800/50'}`}
                        >
                            <span
                                className={`font-black ${delta.leader === driver1 ? 'text-green-400' : 'text-slate-400'}`}
                            >
                                {stats1.code}
                            </span>
                            {delta.leader === driver1 && (
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Position Gap</p>
                            <p className="text-white font-black text-2xl">
                                {Math.abs(delta.positionDiff)} {Math.abs(delta.positionDiff) === 1 ? 'place' : 'places'}
                            </p>
                        </div>

                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${delta.leader === driver2 ? 'bg-green-500/20' : 'bg-slate-800/50'}`}
                        >
                            {delta.leader === driver2 && (
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span
                                className={`font-black ${delta.leader === driver2 ? 'text-green-400' : 'text-slate-400'}`}
                            >
                                {stats2.code}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Split View */}
            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
                <DriverPanel stats={stats1} isLeft={true} />
                <DriverPanel stats={stats2} isLeft={false} />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800">
                <p className="text-slate-600 text-[10px] font-mono text-center uppercase tracking-wider">
                    Real-time Telemetry Comparison
                </p>
            </div>
        </div>
    );
}
