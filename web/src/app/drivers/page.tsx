'use client';

import { useState } from 'react';
import { useDrivers, useTeams } from '@/hooks/useF1Data';
import { DriverCard } from '@/components/DriverCard';

export default function DriversPage() {
    const { drivers, loading, error } = useDrivers(2024);
    const { teams } = useTeams(2024);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    const filteredDrivers = selectedTeam
        ? drivers.filter(d => d.team_id === selectedTeam)
        : drivers;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 py-20 sm:py-32">
                {/* Header Section */}
                <div className="flex flex-col mb-12">
                    <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-4 border-l-2 border-red-600 pl-4">
                        2024 Season Discovery
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <h1 className="text-3xl sm:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                            F1 <span className="text-red-600">DRIVERS</span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">
                            {drivers.length} ACTIVE ATHELETES
                        </p>
                    </div>
                </div>

                {/* Team Filter */}
                <div className="mb-12">
                    <div className="flex gap-3 overflow-x-auto pb-6 px-2 scrollbar-hide -mx-4 sm:mx-0">
                        <button
                            onClick={() => setSelectedTeam(null)}
                            className={`px-6 py-3 rounded-xl font-black italic text-sm transition-all border-2 shrink-0 ${!selectedTeam
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                                : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                }`}
                        >
                            ALL TEAMS
                        </button>
                        {teams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeam(team.id)}
                                className={`px-6 py-3 rounded-xl font-black italic text-sm transition-all border-2 shrink-0 ${selectedTeam === team.id
                                    ? 'bg-slate-900 border-white/20 text-white shadow-xl'
                                    : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                    }`}
                                style={selectedTeam === team.id ? { borderColor: `${team.color}80`, color: team.color } : {}}
                            >
                                {team.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/5] bg-slate-900/50 rounded-2xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-3xl">
                        <p className="text-red-500 font-bold uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {/* Drivers grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                        {filteredDrivers.map(driver => (
                            <DriverCard key={driver.id} driver={driver} />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredDrivers.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-3xl">
                        <p className="text-slate-500 font-mono font-bold uppercase tracking-[0.2em]">No drivers discovered</p>
                    </div>
                )}
            </main>

        </div>
    );
}
