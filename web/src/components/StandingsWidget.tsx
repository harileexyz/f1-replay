'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useStandings } from '@/hooks/useStandings';

export function StandingsWidget() {
    // Determine current year or default to 2024
    const currentYear = 2024;
    const { data, loading } = useStandings(currentYear);

    // If loading, show a skeleton or return null
    if (loading) {
        return (
            <section className="mb-20 animate-pulse">
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                    <div className="h-4 w-32 bg-slate-800 rounded"></div>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 sm:p-8 h-[300px]"></div>
            </section>
        );
    }

    // Fallback if no data
    if (!data?.driver_standings) return null;

    const top5 = data.driver_standings.slice(0, 5);

    return (
        <section className="mb-20">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
                <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-widest pl-4 border-l-2 border-red-600">
                    Championship Lead ({currentYear})
                </h2>
                <Link href="/standings" className="text-red-500 text-xs font-bold italic uppercase tracking-wider hover:text-red-400 transition-colors">
                    Full Standings →
                </Link>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 sm:p-8">
                <div className="space-y-6">
                    {top5.map((driver) => (
                        <Link
                            key={driver.driverId}
                            href={`/drivers/${driver.driverId}`}
                            className="flex items-center gap-4 group hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                        >
                            <span className={`text-xl font-black italic w-8 text-center ${driver.position === 1 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                {driver.position}
                            </span>

                            <div className="w-8 h-8 rounded-full overflow-hidden relative bg-slate-800 border border-white/10 shrink-0">
                                {driver.avatarUrl ? (
                                    <Image src={driver.avatarUrl} alt={driver.name} fill className="object-cover object-top" sizes="32px" />
                                ) : (
                                    <div className="w-full h-full bg-slate-700" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className="block text-white font-bold text-sm uppercase group-hover:text-red-500 transition-colors truncate">
                                    {driver.name}
                                </span>
                                <span className="block text-[10px] text-slate-500 font-mono uppercase truncate">
                                    {driver.team}
                                </span>
                            </div>

                            <div className="text-right shrink-0">
                                <span className="block text-white font-bold font-mono text-sm leading-none">
                                    {driver.points}
                                </span>
                                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">PTS</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
