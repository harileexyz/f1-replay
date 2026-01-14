"use client";

import React, { useMemo, memo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Brush
} from 'recharts';
import { RaceData, PlaybackState } from '@/types/race';

interface TelemetryChartProps {
    data: RaceData;
    playback: PlaybackState;
    onSeek?: (frameIndex: number) => void;
}

// Memoized Lane component to prevent re-renders when parent state (like currentFrameIndex) 
// doesn't directly affect the chart data array itself.
const TelemetryLane = memo(({
    dataKey,
    color,
    label,
    domain,
    height,
    chartData,
    currentValue,
    ghostValue,
    ghostCode,
    currentTime,
    showBrush = false,
    unit = "",
    onSeek
}: {
    dataKey: string,
    color: string,
    label: string,
    domain: [number, number],
    height: string,
    chartData: any[],
    currentValue?: number,
    ghostValue?: number,
    ghostCode?: string | null,
    currentTime: number,
    showBrush?: boolean,
    unit?: string,
    onSeek?: (frameIndex: number) => void
}) => {
    const handleChartClick = (state: any) => {
        if (state && state.activePayload && state.activePayload.length > 0 && onSeek) {
            onSeek(state.activePayload[0].payload.index);
        }
    };

    return (
        <div style={{ height }} className="w-full relative group">
            <div className="absolute left-0 top-0 z-10 flex gap-2 pointer-events-none">
                <div className="bg-slate-950/90 px-2 py-0.5 rounded text-[10px] font-bold border border-white/5 uppercase tracking-tighter shadow-lg" style={{ color }}>
                    {label}: {currentValue?.toFixed(0)}{unit}
                </div>
                {ghostCode && (
                    <div className="bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold border border-black/5 text-black uppercase tracking-tighter shadow-lg">
                        {ghostCode}: {ghostValue?.toFixed(0)}{unit}
                    </div>
                )}
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    syncId="f1_telemetry"
                    onClick={handleChartClick}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis dataKey="time" hide={true} domain={['auto', 'auto']} />
                    <YAxis
                        orientation="left"
                        domain={domain}
                        stroke="#475569"
                        fontSize={8}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                    />
                    <Tooltip
                        isAnimationActive={false}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }}
                        labelFormatter={(v) => `T: ${v.toFixed(2)}s`}
                    />
                    <ReferenceLine
                        x={currentTime}
                        stroke="#fff"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                    />
                    {/* Ghost Line */}
                    <Line
                        type="monotone"
                        dataKey={`${dataKey}_ghost`}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                    />
                    {/* Primary Line */}
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                    />
                    {showBrush && (
                        <Brush
                            dataKey="time"
                            height={24}
                            stroke="#1e293b"
                            fill="#0f172a"
                            travellerWidth={8}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});

TelemetryLane.displayName = 'TelemetryLane';

export function TelemetryChart({ data, playback, onSeek }: TelemetryChartProps) {
    const { currentFrameIndex, selectedDriver, comparisonDriver } = playback;

    // Stable data windowing
    const chartData = useMemo(() => {
        if (!selectedDriver) return [];

        const snap = 50;
        const snappedIndex = Math.floor(currentFrameIndex / snap) * snap;

        const windowSize = 1000;
        const start = Math.max(0, snappedIndex - 400);
        const end = Math.min(data.frames.length, start + windowSize);

        return data.frames.slice(start, end).map((frame, index) => {
            const driverData = frame.drivers[selectedDriver];
            const ghostData = comparisonDriver ? frame.drivers[comparisonDriver] : null;
            return {
                index: start + index,
                time: frame.t,
                speed: driverData?.speed || 0,
                throttle: driverData?.throttle || 0,
                brake: (driverData?.brake || 0) * 100,
                speed_ghost: ghostData?.speed || 0,
                throttle_ghost: ghostData?.throttle || 0,
                brake_ghost: (ghostData?.brake || 0) * 100,
            };
        });
    }, [data.frames, selectedDriver, comparisonDriver, Math.floor(currentFrameIndex / 50)]);

    if (!selectedDriver) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-slate-500 italic">
                <p>Select a driver to view telemetry analysis</p>
            </div>
        );
    }

    const currentFrameData = data.frames[currentFrameIndex].drivers[selectedDriver];
    const ghostFrameData = comparisonDriver ? data.frames[currentFrameIndex].drivers[comparisonDriver] : null;
    const currentFrameTime = data.frames[currentFrameIndex].t;

    return (
        <div className="w-full h-full bg-slate-950/60 rounded-3xl p-4 shadow-2xl border border-white/5 backdrop-blur-md flex flex-col gap-2">
            <TelemetryLane
                label="Speed"
                dataKey="speed"
                color="#ef4444"
                domain={[0, 350]}
                height="45%"
                chartData={chartData}
                currentValue={currentFrameData?.speed}
                ghostValue={ghostFrameData?.speed}
                ghostCode={comparisonDriver}
                currentTime={currentFrameTime}
                unit=" KM/H"
                onSeek={onSeek}
            />

            <TelemetryLane
                label="Throttle"
                dataKey="throttle"
                color="#22c55e"
                domain={[0, 100]}
                height="22%"
                chartData={chartData}
                currentValue={currentFrameData?.throttle}
                ghostValue={ghostFrameData?.throttle}
                ghostCode={comparisonDriver}
                currentTime={currentFrameTime}
                unit="%"
                onSeek={onSeek}
            />

            <TelemetryLane
                label="Brake"
                dataKey="brake"
                color="#3b82f6"
                domain={[0, 100]}
                height="22%"
                chartData={chartData}
                currentValue={currentFrameData?.brake ? currentFrameData.brake * 100 : 0}
                ghostValue={ghostFrameData?.brake ? ghostFrameData.brake * 100 : 0}
                ghostCode={comparisonDriver}
                currentTime={currentFrameTime}
                unit="%"
                showBrush={true}
                onSeek={onSeek}
            />

            <div className="mt-2 px-12 text-[9px] font-mono text-slate-500 uppercase tracking-widest flex justify-between">
                <span>← TRACK PROGRESS</span>
                <span className="text-white/20">STABILIZED TELEMETRY VIEW • CLICK TO SEEK</span>
                <span>SYNCED TIME →</span>
            </div>
        </div>
    );
}
