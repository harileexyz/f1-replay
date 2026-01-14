"use client";

import React from 'react';

interface SpeedometerDialProps {
    value: number;
    maxValue: number;
    label: string;
    unit: string;
    color?: string;
    size?: number;
}

export function SpeedometerDial({ value, maxValue, label, unit, color = "rgb(239, 68, 68)", size = 120 }: SpeedometerDialProps) {
    const angle = (value / maxValue) * 270 - 135;

    return (
        <div className="relative flex flex-col items-center justify-center pointer-events-none" style={{ width: size, height: size + 20 }}>
            <div className="relative flex items-center justify-center overflow-hidden" style={{ width: size, height: size }}>
                {/* Background Track */}
                <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="6"
                        strokeDasharray="188.5"
                    />

                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeDasharray="188.5"
                        strokeDashoffset={188.5 - (Math.min(value, maxValue) / maxValue) * 188.5}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out opacity-40"
                    />

                    {/* Ticks */}
                    {[...Array(11)].map((_, i) => {
                        const tickAngle = (i / 10) * 270 - 135;
                        const isMajor = i % 2 === 0;
                        return (
                            <line
                                key={i}
                                x1="50"
                                y1="12"
                                x2="50"
                                y2={isMajor ? "20" : "16"}
                                stroke={value > (i / 10) * maxValue ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.1)"}
                                strokeWidth={isMajor ? "1.5" : "1"}
                                transform={`rotate(${tickAngle} 50 50)`}
                            />
                        );
                    })}
                </svg>

                {/* The Needle */}
                <div
                    className="absolute w-0.5 h-[40%] bg-white rounded-full origin-bottom transition-transform duration-300 ease-out shadow-[0_0_10px_white]"
                    style={{
                        transform: `rotate(${angle}deg)`,
                        bottom: '50%',
                    }}
                />

                <div className="absolute w-3 h-3 rounded-full bg-slate-900 border border-white/20 shadow-xl" />
            </div>

            {/* Labels */}
            <div className="text-center -mt-2">
                <div className="text-[14px] font-black text-white leading-none font-mono">
                    {Math.round(value)}
                </div>
                <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">
                    {unit}
                </div>
            </div>
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1 italic">
                {label}
            </div>
        </div>
    );
}
