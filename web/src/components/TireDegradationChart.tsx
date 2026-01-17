"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RaceData, Frame } from '@/types/race';

interface TireChartProps {
    data: RaceData;
    selectedDriver: string | null;
    comparisonDriver: string | null;
}

interface LapData {
    lap: number;
    [key: string]: number | string | undefined;
}

// Tire compound colors
const TIRE_COLORS = {
    SOFT: '#FF3333',
    MEDIUM: '#FFD700',
    HARD: '#FFFFFF',
    INTERMEDIATE: '#43B02A',
    WET: '#0067AD',
    UNKNOWN: '#888888'
};

export function TireDegradationChart({ data, selectedDriver, comparisonDriver }: TireChartProps) {
    // Calculate lap times from frame data
    const lapData = useMemo(() => {
        if (!data.frames || data.frames.length === 0) return [];

        const drivers = selectedDriver ? [selectedDriver] : [];
        if (comparisonDriver && !drivers.includes(comparisonDriver)) {
            drivers.push(comparisonDriver);
        }

        // If no drivers selected, show top 3
        if (drivers.length === 0) {
            const firstFrame = data.frames[0];
            const sortedDrivers = Object.entries(firstFrame.drivers)
                .sort(([, a], [, b]) => (a.position || 99) - (b.position || 99))
                .slice(0, 3)
                .map(([code]) => code);
            drivers.push(...sortedDrivers);
        }

        // Group frames by lap
        const lapFrames: Map<number, Frame[]> = new Map();
        data.frames.forEach(frame => {
            const lap = frame.lap || 1;
            if (!lapFrames.has(lap)) {
                lapFrames.set(lap, []);
            }
            lapFrames.get(lap)!.push(frame);
        });

        // Calculate lap times
        const laps: LapData[] = [];
        const sortedLaps = Array.from(lapFrames.keys()).sort((a, b) => a - b);

        for (let i = 1; i < sortedLaps.length; i++) {
            const currentLap = sortedLaps[i];
            const prevLap = sortedLaps[i - 1];

            const currentFrames = lapFrames.get(currentLap) || [];
            const prevFrames = lapFrames.get(prevLap) || [];

            if (currentFrames.length === 0 || prevFrames.length === 0) continue;

            const lapEntry: LapData = { lap: currentLap };

            drivers.forEach(driverCode => {
                // Find first and last frame of this lap for the driver
                const driverFrames = currentFrames.filter(f => f.drivers[driverCode]);
                if (driverFrames.length < 2) return;

                const firstFrameTime = driverFrames[0].t;
                const lastFrameTime = driverFrames[driverFrames.length - 1].t;

                // Lap time in seconds
                const lapTime = lastFrameTime - firstFrameTime;

                // Filter out outliers (pit stops, safety cars)
                if (lapTime > 0 && lapTime < 180) { // Less than 3 minutes
                    lapEntry[driverCode] = Math.round(lapTime * 100) / 100;
                }
            });

            if (Object.keys(lapEntry).length > 1) {
                laps.push(lapEntry);
            }
        }

        return laps;
    }, [data.frames, selectedDriver, comparisonDriver]);

    // Get driver colors
    const getDriverColor = (code: string) => {
        const colors = data.driver_colors[code];
        if (colors) {
            return `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
        }
        return '#888888';
    };

    // Get active drivers for the chart
    const chartDrivers = useMemo(() => {
        const drivers: string[] = [];
        if (selectedDriver) drivers.push(selectedDriver);
        if (comparisonDriver && comparisonDriver !== selectedDriver) drivers.push(comparisonDriver);

        if (drivers.length === 0 && lapData.length > 0) {
            // Get drivers from data
            const firstLap = lapData[0];
            Object.keys(firstLap).filter(k => k !== 'lap').slice(0, 3).forEach(d => drivers.push(d));
        }

        return drivers;
    }, [selectedDriver, comparisonDriver, lapData]);

    // Calculate average lap time for reference line
    const avgLapTime = useMemo(() => {
        if (lapData.length === 0) return 0;

        let sum = 0;
        let count = 0;

        lapData.forEach(lap => {
            chartDrivers.forEach(driver => {
                const time = lap[driver];
                if (typeof time === 'number') {
                    sum += time;
                    count++;
                }
            });
        });

        return count > 0 ? Math.round(sum / count * 100) / 100 : 0;
    }, [lapData, chartDrivers]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl">
                    <p className="text-white font-bold text-sm mb-2">Lap {label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-400">{entry.dataKey}:</span>
                            <span className="text-white font-mono font-bold">
                                {formatLapTime(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Format lap time as M:SS.mmm
    const formatLapTime = (seconds: number) => {
        if (!seconds) return '--:--.---';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
    };

    if (lapData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm font-medium">No lap time data available</p>
                    <p className="text-xs mt-1">Select a driver to view their lap times</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div>
                    <h3 className="text-white font-bold text-sm">Lap Time Analysis</h3>
                    <p className="text-slate-500 text-xs">Track tire degradation over the race</p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4">
                    {chartDrivers.map(driver => (
                        <div key={driver} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getDriverColor(driver) }}
                            />
                            <span className="text-white text-xs font-bold">{driver}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lapData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="lap"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            axisLine={{ stroke: '#475569' }}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            axisLine={{ stroke: '#475569' }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toFixed(0).padStart(2, '0')}`}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Average lap time reference */}
                        {avgLapTime > 0 && (
                            <ReferenceLine
                                y={avgLapTime}
                                stroke="#6366f1"
                                strokeDasharray="5 5"
                                label={{
                                    value: 'Avg',
                                    position: 'right',
                                    fill: '#6366f1',
                                    fontSize: 10
                                }}
                            />
                        )}

                        {/* Driver lines */}
                        {chartDrivers.map(driver => (
                            <Line
                                key={driver}
                                type="monotone"
                                dataKey={driver}
                                stroke={getDriverColor(driver)}
                                strokeWidth={2}
                                dot={{ fill: getDriverColor(driver), strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Footer */}
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Total Laps:</span>
                            <span className="text-white font-mono font-bold">{lapData.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Avg Lap:</span>
                            <span className="text-white font-mono font-bold">{formatLapTime(avgLapTime)}</span>
                        </div>
                    </div>

                    {/* Tire compound legend */}
                    <div className="flex items-center gap-3">
                        <span className="text-slate-600 text-[10px] uppercase tracking-wider">Compounds:</span>
                        {Object.entries(TIRE_COLORS).slice(0, 3).map(([name, color]) => (
                            <div key={name} className="flex items-center gap-1">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-slate-500 text-[10px]">{name[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
