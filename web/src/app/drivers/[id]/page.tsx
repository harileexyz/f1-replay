'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDriver, useTeam } from '@/hooks/useF1Data';

export default function DriverProfilePage() {
    const params = useParams();
    const driverId = params?.id as string;
    const { driver, loading, error } = useDriver(driverId);
    const { car } = useTeam(driver?.team_id || '');

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !driver) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4">Discovery Error</h1>
                    <p className="text-slate-500 font-mono mb-8 uppercase tracking-widest">{error || 'Pilot not found'}</p>
                    <Link href="/drivers" className="px-8 py-4 bg-red-600 text-white font-black italic uppercase rounded-2xl hover:bg-red-500 transition-all">
                        ← Back to Roster
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">

            <main className="flex-1">
                {/* Hero section */}
                <div className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
                    {/* Background glow */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{ background: `linear-gradient(180deg, ${driver.team_color} 0%, transparent 100%)` }}
                    />

                    {/* Large background number */}
                    <div
                        className="absolute right-0 top-0 text-[300px] sm:text-[500px] font-black leading-none opacity-5 pointer-events-none select-none italic tracking-tighter"
                        style={{ color: driver.team_color }}
                    >
                        {driver.driver_number}
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-12 sm:gap-16">
                            {/* Driver headshot with aggressive frame */}
                            <div className="relative w-64 sm:w-80 aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-900 border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 scale-110 md:scale-100">
                                {driver.headshot_url ? (
                                    <Image
                                        src={driver.headshot_url}
                                        alt={driver.full_name}
                                        fill
                                        className="object-cover object-top"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-8xl font-black text-slate-800 italic">
                                            {driver.code}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Driver info */}
                            <div className="flex-1 text-center md:text-left z-10 pb-4">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                                    <span
                                        className="px-4 py-2 rounded-xl text-lg font-black italic text-white shadow-xl"
                                        style={{ backgroundColor: driver.team_color }}
                                    >
                                        #{driver.driver_number}
                                    </span>
                                    <span className="text-slate-500 font-mono font-bold uppercase tracking-[0.3em] text-sm">
                                        {driver.country_code} • {driver.team_name}
                                    </span>
                                </div>

                                <h1 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-6">
                                    {driver.first_name} <br />
                                    <span className="text-red-600">{driver.last_name}</span>
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <Link
                                        href={`/teams/${driver.team_id}`}
                                        className="text-lg font-black italic text-red-500 hover:text-white transition-colors uppercase tracking-tight flex items-center gap-2"
                                    >
                                        View Constructor
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats and Content section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 sm:gap-24">
                        {/* Stats Panel */}
                        <div className="lg:col-span-2">
                            <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-10 border-l-2 border-red-600 pl-4">
                                Performance Metrics
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                <StatCard label="Championships" value={driver.stats?.championships || 0} color={driver.team_color} highlight={driver.stats?.championships > 0} />
                                <StatCard label="Race Wins" value={driver.stats?.race_wins || 0} color={driver.team_color} />
                                <StatCard label="Podiums" value={driver.stats?.podiums || 0} color={driver.team_color} />
                                <StatCard label="Pole Positions" value={driver.stats?.poles || 0} color={driver.team_color} />
                            </div>

                            {/* Bio / Timeline could go here */}
                            <div className="mt-20">
                                <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-6 border-l-2 border-red-600 pl-4">
                                    Mission Brief
                                </h2>
                                <p className="text-slate-400 text-lg sm:text-2xl font-medium leading-relaxed italic border-l border-white/5 pl-8">
                                    {driver.bio || "Data extraction for pilot biography in progress. This elite athlete continues to push the limits of modern racing engineering across global circuits."}
                                </p>
                            </div>
                        </div>

                        {/* Machine Panel */}
                        <div>
                            <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-6 border-l-2 border-red-600 pl-4">
                                Assigned Machine
                            </h2>
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden relative group hover:border-red-600/30 transition-all cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                {car ? (
                                    <Link href={`/cars/${car.id}`}>
                                        <div className="text-4xl font-black italic uppercase tracking-tighter text-white mb-8 group-hover:text-red-500 transition-colors flex items-center gap-2">
                                            {car.name}
                                            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </div>

                                        <div className="space-y-6">
                                            <MetricItem label="CHASSIS" value={car.specs?.chassis} />
                                            <MetricItem label="POWER SYSTEM" value={car.specs?.engine} />
                                            <MetricItem label="WEIGHT SPEC" value={car.specs?.weight} />
                                        </div>

                                        <div className="mt-10 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-125 origin-right">
                                            {car.image_url ? (
                                                <Image
                                                    src={car.image_url}
                                                    alt={car.name}
                                                    width={200}
                                                    height={100}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <span className="text-8xl">🏎️</span>
                                            )}
                                        </div>
                                    </Link>
                                ) : (
                                    <p className="text-slate-600 font-mono font-bold uppercase tracking-widest text-center py-10">Machine data offline</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}

function StatCard({ label, value, color, highlight = false }: { label: string; value: number; color: string; highlight?: boolean }) {
    return (
        <div className={`
            p-6 rounded-2xl border transition-all duration-300
            ${highlight ? 'bg-red-600/20 border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'bg-slate-900/50 border-white/5 hover:border-white/10'}
        `}>
            <div className={`text-4xl font-black italic mb-2 tracking-tighter ${highlight ? 'text-red-500' : 'text-white'}`}>
                {value}
            </div>
            <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                {label}
            </div>
        </div>
    );
}

function MetricItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 border-l border-white/10 pl-4 py-1">
            <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-[0.3em]">{label}</span>
            <span className="text-white font-black italic uppercase tracking-tight">{value || 'CLASSIFIED'}</span>
        </div>
    );
}
