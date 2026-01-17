'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTeam } from '@/hooks/useF1Data';

export default function CarDetailsPage() {
    const params = useParams();
    const carId = params?.id as string;

    // We don't have a direct useCar(id) hook yet, but we can fetch it via the team
    // or we can add a specific hook. For now, let's assume we can get it from the team hook
    // if we pass the team ID. But wait, we have carId. 
    // Let's implement a simple fetch for now or rely on useTeam if we knew the team ID.
    // Actually, looking at useTeam hook, it fetches the car for that team.
    // But here we are navigating to /cars/[id]. 
    // Let's assume we need to fetch the car directly.

    // Since we don't have useCar(id), let's create a temporary one inline or update hooks later.
    // For now, I'll update useF1Data to include useCar(id) in the next step.
    // I'll assume it exists for this file.

    // REVISION: I will use a direct firestore fetch here for simplicity or 
    // better yet, I'll update the hooks file first.
    // But since I can't update hooks in this tool call, I'll write the component 
    // assuming I'll update the hook immediately after.

    return (
        <CarView carId={carId} />
    );
}

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Car, Team } from '@/types/f1';

function CarView({ carId }: { carId: string }) {
    const [car, setCar] = useState<Car | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCar() {
            if (!carId) return;
            try {
                const carRef = doc(db, 'cars', carId);
                const carSnap = await getDoc(carRef);

                if (carSnap.exists()) {
                    const carData = carSnap.data() as Car;
                    setCar(carData);

                    // Fetch team color for styling
                    if (carData.team_id) {
                        const teamRef = doc(db, 'teams', carData.team_id);
                        const teamSnap = await getDoc(teamRef);
                        if (teamSnap.exists()) {
                            setTeam(teamSnap.data() as Team);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCar();
    }, [carId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4">Machine Error</h1>
                <p className="text-slate-500 font-mono mb-8 uppercase tracking-widest">Technical schema not found</p>
                <Link href="/" className="px-8 py-4 bg-red-600 text-white font-black italic uppercase rounded-2xl hover:bg-red-500 transition-all">
                    ← Return to Grid
                </Link>
            </div>
        );
    }

    const themeColor = team?.color || '#ef4444';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">
            <main className="flex-1">
                {/* Hero section */}
                <div className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
                    {/* Background glow */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{ background: `linear-gradient(180deg, ${themeColor} 0%, transparent 100%)` }}
                    />

                    {/* Background Tech Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-8">
                        <div className="flex flex-col items-center gap-12 sm:gap-16">

                            {/* Title Block */}
                            <div className="text-center z-10">
                                <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-slate-900/50 text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 backdrop-blur-md">
                                    Technical Specification • {car.season} Season
                                </span>
                                <h1 className="text-6xl sm:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-4">
                                    {car.name}
                                </h1>
                                <p className="text-xl sm:text-2xl font-black italic uppercase tracking-tight" style={{ color: themeColor }}>
                                    {car.team_name}
                                </p>
                            </div>

                            {/* Car Image - Hero */}
                            <div className="relative w-full max-w-5xl aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center z-10">
                                {/* Glow behind car */}
                                <div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 blur-[100px] rounded-full opacity-20"
                                    style={{ backgroundColor: themeColor }}
                                />

                                {car.image_url ? (
                                    <div className="relative w-full h-full animate-in fade-in zoom-in duration-700">
                                        <Image
                                            src={car.image_url}
                                            alt={car.name}
                                            fill
                                            className="object-contain drop-shadow-2xl"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center opacity-20">
                                        <span className="text-9xl">🏎️</span>
                                        <p className="font-mono uppercase tracking-widest mt-4">Blueprint Offline</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specs Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-24">

                        {/* Technical Details */}
                        <div>
                            <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-10 border-l-2 pl-4" style={{ borderColor: themeColor }}>
                                Engineering Data
                            </h2>
                            <div className="space-y-6">
                                <SpecRow label="Power Unit" value={car.specs.power_unit} />
                                <SpecRow label="Chassis Construction" value={car.specs.chassis} />
                                <SpecRow label="Transmission" value={car.specs.transmission || '8-Speed Seamless Shift'} />
                                <SpecRow label="Weight" value={car.specs.weight} />
                                <SpecRow label="Suspension System" value={car.specs.suspension || 'Push-rod / Pull-rod Activated'} />
                                <SpecRow label="Braking System" value={car.specs.brakes || 'Carbon Industries'} />
                            </div>
                        </div>

                        {/* Aero / Design Philosophy (Placeholder content for immersion) */}
                        <div>
                            <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mb-10 border-l-2 pl-4" style={{ borderColor: themeColor }}>
                                Aero Philosophy
                            </h2>
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                                <p className="text-slate-400 leading-relaxed font-light text-lg mb-6">
                                    The {car.name} represents a significant evolution in ground-effect aerodynamics.
                                    Featuring aggressive sidepod geometry and a refined floor edge architecture designed
                                    to maximize downforce while managing tyre wake turbulence.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">Drag Coefficient</div>
                                        <div className="text-2xl text-white font-black italic">LOW-MED</div>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">Cornering Load</div>
                                        <div className="text-2xl text-white font-black italic">5.5G+</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <Link
                                    href={`/teams/${car.team_id}`}
                                    className="flex-1 py-4 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-white font-bold uppercase tracking-widest text-xs text-center transition-all hover:bg-slate-800"
                                >
                                    View Constructor
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

function SpecRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between py-4 border-b border-white/5 hover:bg-white/[0.02] px-4 -mx-4 rounded-lg transition-colors group">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{label}</span>
            <span className="text-lg sm:text-xl font-bold italic text-white uppercase tracking-tight text-right mt-1 sm:mt-0">{value}</span>
        </div>
    );
}
