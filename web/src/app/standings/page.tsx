'use client';

import { useState } from 'react';
import { useStandings } from '@/hooks/useStandings';
import { DriverStandingsTable, ConstructorStandingsTable } from '@/components/StandingsTable';
import { ChampionshipGraph } from '@/components/ChampionshipGraph';
import { POINTS_HISTORY_DATA } from '@/data/standings'; // Keep graph data for now as we didn't backend-ify it yet

const AVAILABLE_YEARS = [2024, 2023, 2022];

export default function StandingsPage() {
    const [year, setYear] = useState(2024);
    const [view, setView] = useState<'DRIVERS' | 'TEAMS'>('DRIVERS');

    const { data, loading, error } = useStandings(year);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-24 sm:py-32">

                {/* Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 sm:mb-20 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest">
                                {loading ? 'Fetching Live Data...' : 'Official Championship Standings'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-4">
                            <h1 className="text-5xl sm:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">
                                {year} Standings
                            </h1>

                            {/* Year Selector */}
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="bg-transparent text-slate-500 text-3xl font-black italic border-none focus:ring-0 cursor-pointer hover:text-white transition-colors"
                            >
                                {AVAILABLE_YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex bg-slate-900 rounded-xl p-1 border border-white/5 self-start xl:self-auto">
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

                {loading ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : error || !data ? (
                    <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200">
                        <p className="font-bold">Failed to load standings data.</p>
                        <p className="text-sm opacity-70 mt-1">{error || "No data available for this year."}</p>
                    </div>
                ) : (
                    <>
                        {/* Graph Section */}
                        {year === 2024 && (
                            <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-widest mb-6 border-l-2 border-red-600 pl-4">
                                    Championship Battle (Top 4)
                                </h2>
                                <ChampionshipGraph data={POINTS_HISTORY_DATA} />
                            </div>
                        )}

                        {/* Tables Section */}
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-widest mb-6 border-l-2 border-red-600 pl-4">
                                Official Classification
                            </h2>
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-2 sm:p-8">
                                {view === 'DRIVERS' ? (
                                    <DriverStandingsTable data={data.driver_standings} />
                                ) : (
                                    <ConstructorStandingsTable data={data.constructor_standings} />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
