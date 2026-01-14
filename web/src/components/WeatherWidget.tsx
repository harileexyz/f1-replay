"use client";

import React from 'react';
import { WeatherData } from '@/types/race';

interface WeatherWidgetProps {
    weather?: WeatherData;
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
    if (!weather) return null;

    const { track_temp, air_temp, humidity, wind_speed, wind_direction, rain_state } = weather;

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex gap-6 items-center shadow-2xl">
            {/* Condition Icon */}
            <div className="flex flex-col items-center">
                {rain_state === "RAINING" ? (
                    <div className="text-blue-400 animate-bounce">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2a5 5 0 0 0-5 5v.17A5 5 0 0 0 3 12a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5a5 5 0 0 0-4-4.83V7a5 5 0 0 0-5-5zM9 19l-2 3M12 19l-2 3M15 19l-2 3" />
                        </svg>
                    </div>
                ) : (
                    <div className="text-yellow-500">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                        </svg>
                    </div>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">
                    {rain_state}
                </span>
            </div>

            {/* Temperatures */}
            <div className="flex gap-4">
                <div className="flex flex-col">
                    <span className="text-[#ff4d4d] font-black text-xl leading-none">
                        {track_temp?.toFixed(0)}°
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Track</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-black text-xl leading-none">
                        {air_temp?.toFixed(0)}°
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Air</span>
                </div>
            </div>

            {/* Wind & Humidity */}
            <div className="border-l border-white/10 pl-4 flex gap-4">
                <div className="flex flex-col items-center">
                    <div
                        className="transition-transform duration-1000"
                        style={{ transform: `rotate(${wind_direction || 0}deg)` }}
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-mono text-white mt-1">{(wind_speed || 0).toFixed(1)} <span className="text-[8px] opacity-50">m/s</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-slate-300 leading-none">{humidity?.toFixed(0)}%</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Humidity</span>
                </div>
            </div>
        </div>
    );
}
