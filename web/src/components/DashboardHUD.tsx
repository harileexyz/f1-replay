"use client";

import React, { useMemo } from 'react';
import { DriverData } from '@/types/race';

interface DashboardHUDProps {
    driverData: DriverData;
    color: string;
    driverCode: string;
}

export function DashboardHUD({ driverData, color, driverCode }: DashboardHUDProps) {
    // Current F1 cars shift around 11,000 - 12,000 RPM. 
    // Since we are simulating for now, let's map speed/gear to a "feel-good" RPM
    const simulatedRPM = useMemo(() => {
        if (driverData.rpm) return driverData.rpm;

        // Very basic simulation: higher gear + higher speed = higher RPM
        const base = 4000;
        return Math.min(12000, base + (driverData.speed * (10 / (driverData.gear || 1))));
    }, [driverData.speed, driverData.gear, driverData.rpm]);

    const rpmPercentage = (simulatedRPM / 12000) * 100;

    // Helper to get rev-light color
    const getRevColor = (index: number) => {
        const p = (index / 15) * 100;
        if (p < 50) return 'bg-green-500';
        if (p < 80) return 'bg-red-500';
        return 'bg-purple-500';
    };

    return (
        <div className="relative w-80">
            <div className="bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-none">
                {/* Driver Indicator */}
                <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-white font-black italic tracking-tighter text-lg">{driverCode}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${driverData.drs >= 10 ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                    DRS
                </div>
                </div>

                {/* Rev Bar (The LED Lights) */}
                <div className="flex gap-1 mb-4 h-3">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-sm transition-all duration-75 ${rpmPercentage > (i / 15) * 100
                                    ? getRevColor(i) + ' shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                    : 'bg-white/5'
                                }`}
                        />
                    ))}
                </div>

                {/* Main Stats Area */}
                <div className="grid grid-cols-3 gap-4 items-center">
                {/* Speed */}
                <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Speed</div>
                    <div className="text-2xl font-black text-white font-mono">{driverData.speed.toFixed(0)}</div>
                    <div className="text-[8px] text-slate-400 font-mono">KM/H</div>
                </div>

                {/* GEAR (The Focus) */}
                <div className="text-center relative">
                    <div className="absolute inset-0 bg-white/5 rounded-xl -m-2 border border-white/5" />
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest relative z-10">Gear</div>
                    <div className="text-5xl font-black text-white italic relative z-10 leading-none py-1">
                        {driverData.gear || 'N'}
                    </div>
                </div>

                {/* Inputs */}
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inputs</div>
                    <div className="space-y-1.5 mt-2">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-75"
                                style={{ width: `${driverData.throttle}%` }}
                            />
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 transition-all duration-75"
                                style={{ width: `${driverData.brake * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
                </div>

                {/* G-Force Ball Simulation */}
                <div className="mt-4 flex justify-center">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent relative">
                        <div
                            className="absolute top-1/2 left-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] transition-transform duration-100"
                            style={{
                                transform: `translate(calc(-50% + ${Math.sin(driverData.speed / 20) * 40}px), -50%)`
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
