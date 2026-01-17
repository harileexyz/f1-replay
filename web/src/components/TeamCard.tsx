'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Team } from '@/types/f1';

interface TeamCardProps {
    team: Team;
    driverNames?: string[];
}

export function TeamCard({ team, driverNames = [] }: TeamCardProps) {
    return (
        <Link href={`/teams/${team.id}`} className="group block h-full">
            <div
                className="relative h-full overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 
                    group-hover:border-red-600/50 transition-all duration-500 p-6 sm:p-8 flex flex-col justify-between"
            >
                {/* Team color accent strip */}
                <div
                    className="absolute top-0 right-0 w-32 h-32 blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2"
                    style={{ backgroundColor: team.color }}
                />

                {/* Vertical Team Color Bar */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: team.color }}
                />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:text-red-500 transition-colors">
                                {team.name}
                            </h3>
                            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                                {team.full_name}
                            </p>
                        </div>

                        {/* Static Logo Initial */}
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black italic border border-white/5"
                            style={{
                                backgroundColor: `${team.color}10`,
                                color: team.color
                            }}
                        >
                            {team.name.charAt(0)}
                        </div>
                    </div>

                    {/* Stats/Meta */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-sm border border-white/5">
                                📍
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-tight truncate">{team.base}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-sm border border-white/5">
                                👔
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-tight truncate">{team.team_principal}</span>
                        </div>
                    </div>

                    {/* Drivers Section */}
                    <div className="mt-auto pt-6 border-t border-white/5 group-hover:border-red-600/20 transition-colors">
                        <p className="text-[8px] font-mono text-slate-600 font-bold uppercase tracking-[0.3em] mb-3">CONSTRUCTOR LINEUP</p>
                        <div className="flex flex-wrap gap-2">
                            {driverNames.map(name => {
                                const lastName = name.split(' ').pop() || name;
                                return (
                                    <span
                                        key={name}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-black italic uppercase tracking-wider border border-white/5 bg-slate-950 text-slate-400 group-hover:text-white transition-colors"
                                    >
                                        {lastName}
                                    </span>
                                );
                            })}
                            {driverNames.length === 0 && (
                                <span className="text-[10px] font-mono text-slate-700 italic">No pilots assigned</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Arrow Icon on Hover */}
                <div className="absolute bottom-6 right-6 text-red-600 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
