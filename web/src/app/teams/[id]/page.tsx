'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTeam } from '@/hooks/useF1Data';
import { DriverCard } from '@/components/DriverCard';

export default function TeamProfilePage() {
    const params = useParams();
    const teamId = params?.id as string;
    const { team, drivers, car, loading, error } = useTeam(teamId);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4">Constructor Error</h1>
                    <p className="text-slate-500 font-mono mb-8 uppercase tracking-widest">{error || 'Team not found'}</p>
                    <Link href="/teams" className="px-8 py-4 bg-red-600 text-white font-black italic uppercase rounded-2xl hover:bg-red-500 transition-all">
                        ← Back to Paddock
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
                        style={{ background: `linear-gradient(180deg, ${team.color} 0%, transparent 100%)` }}
                    />

                    {/* Large background Initial */}
                    <div
                        className="absolute right-0 top-0 text-[300px] sm:text-[500px] font-black leading-none opacity-5 pointer-events-none select-none italic tracking-tighter uppercase"
                        style={{ color: team.color }}
                    >
                        {team.name.charAt(0)}
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-12 sm:gap-16">
                            {/* Team logo with aggressive frame */}
                            <div
                                className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-[2rem] flex items-center justify-center text-7xl sm:text-9xl font-black italic shadow-2xl z-10 border-2 border-white/10"
                                style={{
                                    backgroundColor: `${team.color}20`,
                                    color: team.color
                                }}
                            >
                                {team.logo_url ? (
                                    <Image
                                        src={team.logo_url}
                                        alt={team.name}
                                        width={120}
                                        height={120}
                                        className="object-contain"
                                    />
                                ) : (
                                    team.name.charAt(0)
                                )}
                            </div>

                            {/* Team info */}
                            <div className="flex-1 text-center md:text-left z-10 pb-4">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                                    <span
                                        className="w-4 h-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                        style={{ backgroundColor: team.color }}
                                    />
                                    <span className="text-slate-500 font-mono font-bold uppercase tracking-[0.3em] text-sm">
                                        CONSTRUCTOR PROFILE • {team.full_name}
                                    </span>
                                </div>

                                <h1 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-6">
                                    {team.name}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 sm:gap-24">
                        {/* Team Details and Drivers */}
                        <div className="lg:col-span-2">
                            <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-10 border-l-2 border-red-600 pl-4">
                                Constructor Assets
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
                                <InfoItem icon="📍" label="Global Headquarters" value={team.base} />
                                <InfoItem icon="👔" label="Team Principal" value={team.team_principal} />
                            </div>

                            {/* Pilot Lineup */}
                            <div className="mt-20">
                                <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-10 border-l-2 border-red-600 pl-4">
                                    Strategic Asset: Pilots
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {drivers.length > 0 ? (
                                        drivers.map(driver => (
                                            <DriverCard key={driver.id} driver={driver} />
                                        ))
                                    ) : (
                                        <p className="text-slate-600 font-mono font-bold uppercase italic tracking-widest pl-4 border-l border-white/5 py-10">Pilot data offline</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Technical Panel */}
                        <div>
                            <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-6 border-l-2 border-red-600 pl-4">
                                Technical Data: Machine
                            </h2>
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 shadow-2xl relative group overflow-hidden hover:border-red-600/30 transition-all cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                {car ? (
                                    <Link href={`/cars/${car.id}`}>
                                        <div className="text-4xl font-black italic uppercase tracking-tighter text-white mb-8 group-hover:text-red-500 transition-colors flex items-center gap-2">
                                            {car.name}
                                            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </div>

                                        <div className="space-y-6">
                                            <SpecItem label="CHASSIS DESIGN" value={car.specs?.chassis} />
                                            <SpecItem label="POWER SYSTEM" value={car.specs?.engine} />
                                            <SpecItem label="TOTAL WEIGHT" value={car.specs?.weight} />
                                        </div>

                                        <div className="mt-12 flex justify-center opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                            {car.image_url ? (
                                                <Image
                                                    src={car.image_url}
                                                    alt={car.name}
                                                    width={300}
                                                    height={150}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <span className="text-[120px] scale-150 rotate-[15deg]">🏎️</span>
                                            )}
                                        </div>
                                    </Link>
                                ) : (
                                    <p className="text-slate-600 font-mono font-bold uppercase tracking-widest text-center py-20">Machine data offline</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-xl">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-white font-black italic uppercase tracking-tight leading-none">{value || 'CLASSIFIED'}</p>
            </div>
        </div>
    );
}

function SpecItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 border-l border-white/10 pl-4 py-1">
            <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-[0.3em]">{label}</span>
            <span className="text-white font-black italic uppercase tracking-tight">{value || 'CLASSIFIED'}</span>
        </div>
    );
}
