"use client";

import React from 'react';
import { RaceData, Frame, WeatherData } from '@/types/race';

interface TrackMetaWidgetProps {
    data: RaceData;
    currentFrame: Frame;
    currentTime: number;
}

export function TrackMetaWidget({ data, currentFrame, currentTime }: TrackMetaWidgetProps) {
    const weather = currentFrame.weather;

    const currentStatus = data.track_statuses.find(s =>
        currentTime >= s.start_time && (s.end_time === null || currentTime <= s.end_time)
    );

    const statusMap: Record<string, { label: string, color: string, icon: string }> = {
        "1": { label: "TRACK CLEAR", color: "text-emerald-500", icon: "🟢" },
        "2": { label: "YELLOW FLAG", color: "text-yellow-500", icon: "🟡" },
        "4": { label: "SAFETY CAR", color: "text-yellow-500 animate-pulse", icon: "🏎️" },
        "5": { label: "RED FLAG", color: "text-red-500", icon: "🔴" },
        "6": { label: "VIRTUAL SAFETY CAR", color: "text-yellow-500 animate-pulse", icon: "⏱️" },
        "7": { label: "VSC ENDING", color: "text-yellow-400", icon: "🟡" },
    };

    const statusInfo = currentStatus ? (statusMap[currentStatus.status] || { label: "UNKNOWN", color: "text-slate-500", icon: "⚪" }) : statusMap["1"];

    return (
        <div className="flex flex-col gap-4">
            {/* Track Condition Card */}
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm">{statusInfo.icon}</span>
                            <span className={`text-sm font-black italic uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                    </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Track Temp</div>
                        <div className="text-lg font-black text-red-500 leading-none">{weather?.track_temp?.toFixed(1) || '--'}°C</div>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Air Temp</div>
                        <div className="text-lg font-black text-white leading-none">{weather?.air_temp?.toFixed(1) || '--'}°C</div>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Humidity</div>
                        <div className="text-lg font-black text-slate-300 leading-none">{weather?.humidity?.toFixed(0) || '--'}%</div>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Rain State</div>
                        <div className={`text-xs font-black uppercase leading-none mt-1 ${weather?.rain_state === 'RAINING' ? 'text-blue-500' : 'text-slate-400'}`}>
                            {weather?.rain_state || 'DRY'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event History - Small */}
            <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2 px-1">Recent Flag Changes</span>
                <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                    {data.track_statuses.slice().reverse().slice(0, 5).map((status, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-[9px] opacity-60 hover:opacity-100 transition-opacity">
                            <span className="font-mono text-slate-500">{Math.floor(status.start_time / 60)}:{(status.start_time % 60).toString().padStart(2, '0')}</span>
                            <span className={`font-black uppercase ${statusMap[status.status]?.color || 'text-slate-400'}`}>
                                {statusMap[status.status]?.label || 'CLEAR'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
