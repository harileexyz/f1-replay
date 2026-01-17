'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Driver } from '@/types/f1';

interface DriverCardProps {
    driver: Driver;
    variant?: 'default' | 'compact';
}

export function DriverCard({ driver, variant = 'default' }: DriverCardProps) {
    const isCompact = variant === 'compact';

    return (
        <Link href={`/drivers/${driver.id}`} className="block group">
            <div
                className={`
                    relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 
                    group-hover:border-red-600/50 transition-all duration-500 shadow-2xl
                    ${isCompact ? 'p-3' : 'p-0'}
                `}
            >
                {/* Accent Glow */}
                <div
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full z-0"
                    style={{ backgroundColor: driver.team_color }}
                />

                <div className="relative z-10">
                    {/* Driver Image Container */}
                    <div className={`
                        relative overflow-hidden bg-slate-900
                        ${isCompact ? 'w-16 h-16 rounded-xl' : 'w-full aspect-[4/5]'}
                    `}>
                        {driver.headshot_url ? (
                            <Image
                                src={driver.headshot_url}
                                alt={driver.full_name}
                                fill
                                className="object-cover object-top filter grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl font-black text-slate-800 italic">
                                    {driver.code}
                                </span>
                            </div>
                        )}

                        {/* Number Overlay */}
                        {!isCompact && (
                            <div className="absolute top-4 left-4 flex flex-col items-center">
                                <span className="text-4xl font-black italic tracking-tighter text-white/20 group-hover:text-white/40 transition-colors">
                                    {driver.driver_number}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className={`p-4 sm:p-6 ${isCompact ? 'flex items-center gap-4' : ''}`}>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: driver.team_color }}
                                />
                                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                                    {driver.team_name}
                                </span>
                            </div>

                            <h3 className={`font-black uppercase italic tracking-tighter text-white group-hover:text-red-500 transition-colors truncate ${isCompact ? 'text-sm' : 'text-xl sm:text-2xl'}`}>
                                {driver.first_name} <br className={isCompact ? 'hidden' : 'block'} />
                                <span className="text-red-600">{driver.last_name}</span>
                            </h3>
                        </div>

                        {!isCompact && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center group-hover:border-red-600/20 transition-colors">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">Wins</span>
                                        <span className="text-sm font-black text-white italic">{driver.stats?.race_wins || 0}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">Podiums</span>
                                        <span className="text-sm font-black text-white italic">{driver.stats?.podiums || 0}</span>
                                    </div>
                                </div>
                                <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
