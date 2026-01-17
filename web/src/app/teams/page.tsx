'use client';

import { useTeams, useDrivers } from '@/hooks/useF1Data';
import { TeamCard } from '@/components/TeamCard';

export default function TeamsPage() {
    const { teams, loading, error } = useTeams(2024);
    const { drivers } = useDrivers(2024);

    // Group drivers by team
    const driversByTeam = drivers.reduce((acc, driver) => {
        if (!acc[driver.team_id]) {
            acc[driver.team_id] = [];
        }
        acc[driver.team_id].push(driver.full_name);
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 py-20 sm:py-32">
                {/* Header Section */}
                <div className="flex flex-col mb-12">
                    <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-4 border-l-2 border-red-600 pl-4">
                        Constructor Discovery
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                            F1 <span className="text-red-600">TEAMS</span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">
                            {teams.length} OFFICIAL CONSTRUCTORS
                        </p>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-slate-900/50 rounded-2xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-3xl">
                        <p className="text-red-500 font-bold uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {/* Teams grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        {teams.map(team => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                driverNames={driversByTeam[team.id] || []}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && teams.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-3xl">
                        <p className="text-slate-500 font-mono font-bold uppercase tracking-[0.2em]">No constructors found</p>
                    </div>
                )}
            </main>

        </div>
    );
}
