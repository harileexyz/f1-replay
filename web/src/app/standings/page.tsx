'use client';

import { useState } from 'react';
import { DRIVER_STANDINGS_2024, CONSTRUCTOR_STANDINGS_2024, POINTS_HISTORY_DATA } from '@/data/standings';
import { DriverStandingsTable, ConstructorStandingsTable } from '@/components/StandingsTable';
import { ChampionshipGraph } from '@/components/ChampionshipGraph';

export default function StandingsPage() {
    const [view, setView] = useState<'DRIVERS' | 'TEAMS'>('DRIVERS');

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-24 sm:py-32">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-20 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest">Live Championship Update</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">
                            2024 Standings
                        </h1>
                    </div>

                    <div className="flex bg-slate-900 rounded-xl p-1 border border-white/5">
                        <button
                            onClick={() => setView('DRIVERS')}
                            className={`px-6 py-2 rounded-lg text-sm font-black italic uppercase tracking-wider transition-all ${view === 'DRIVERS' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            Drivers
                        </button>
                        <button
                            onClick={() => setView('TEAMS')}
                            className={`px-6 py-2 rounded-lg text-sm font-black italic uppercase tracking-wider transition-all ${view === 'TEAMS' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            Constructors
                        </button>
                    </div>
                </div>

                {/* Graph Section */}
                <div className="mb-20">
                    <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-widest mb-6 border-l-2 border-red-600 pl-4">
                        Championship Battle (Top 4)
                    </h2>
                    <ChampionshipGraph data={POINTS_HISTORY_DATA} />
                </div>

                {/* Tables Section */}
                <div>
                    <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-widest mb-6 border-l-2 border-red-600 pl-4">
                        Official Classification
                    </h2>
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-2 sm:p-8">
                        {view === 'DRIVERS' ? (
                            <DriverStandingsTable data={DRIVER_STANDINGS_2024} />
                        ) : (
                            <ConstructorStandingsTable data={CONSTRUCTOR_STANDINGS_2024} />
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
