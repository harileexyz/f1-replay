'use client';

import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RaceCard } from "@/components/RaceCard";
import Link from "next/link";

interface Race {
    id: string;
    year: number;
    round: number;
    event_name: string;
    uploaded_at: any;
}

interface ScheduleRace {
    RoundNumber: number;
    EventName: string;
}

export default function RacesPage() {
    const [uploadedRaces, setUploadedRaces] = useState<Race[]>([]);
    const [fullSchedule, setFullSchedule] = useState<Record<string, ScheduleRace[]>>({});
    const [selectedYear, setSelectedYear] = useState(2025);
    const [loading, setLoading] = useState(true);

    const years = [2025, 2024, 2023, 2022, 2021, 2020];

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch uploaded races from Firestore
                const q = query(collection(db, "races"));
                const querySnapshot = await getDocs(q);
                const raceList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Race[];

                setUploadedRaces(raceList);

                // Fetch full schedules from local JSON
                const scheduleRes = await fetch('/schedules.json');
                const scheduleData = await scheduleRes.json();
                setFullSchedule(scheduleData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const currentYearRaces = fullSchedule[selectedYear] || [];

    // Cross-reference schedule with uploaded races
    const processedRaces = currentYearRaces
        .filter(r => r.RoundNumber > 0) // Skip testing
        .map(scheduled => {
            const uploaded = uploadedRaces.find(
                u => u.year === selectedYear && u.round === scheduled.RoundNumber
            );
            return {
                ...scheduled,
                isUploaded: !!uploaded,
                id: uploaded?.id || `${selectedYear}_${scheduled.RoundNumber}`
            };
        });

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-24 sm:py-32">

                {/* Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 sm:mb-20 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest">
                                Race Archive
                            </span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">
                            Race Replays
                        </h1>
                    </div>
                </div>

                {/* Year Selector */}
                <div className="flex flex-col mb-8 sm:mb-16">
                    <h2 className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-6 border-l-2 border-red-600 pl-4">
                        Select Season
                    </h2>
                    <div className="flex gap-3 sm:gap-6 overflow-x-auto py-4 sm:py-8 px-2 sm:px-4 scrollbar-hide items-center -mx-4 sm:mx-0">
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black italic text-base sm:text-xl transition-all duration-300 border-2 shrink-0 ${selectedYear === year
                                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] -translate-y-1 z-10'
                                    : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-12 gap-2">
                    <div>
                        <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
                            {selectedYear} Gallery
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm mt-2 sm:mt-3 font-medium">
                            {processedRaces.filter(r => r.isUploaded).length} <span className="text-slate-400">of</span> {processedRaces.length} <span className="text-slate-400">races available for replay</span>
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-40 sm:h-48 bg-slate-900/50 rounded-2xl sm:rounded-3xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10">
                        {processedRaces.map((race) => (
                            <div key={race.id} className="relative group">
                                {race.isUploaded ? (
                                    <Link href={`/race/${selectedYear}/${race.RoundNumber}`}>
                                        <RaceCard
                                            race={{
                                                year: selectedYear,
                                                round: race.RoundNumber,
                                                event_name: race.EventName,
                                                uploaded_at: null
                                            }}
                                            onClick={() => { }}
                                        />
                                    </Link>
                                ) : (
                                    <div className="opacity-60 saturate-0 grayscale-[0.5] hover:opacity-100 hover:saturate-100 hover:grayscale-0 transition-all duration-500">
                                        <div className="bg-slate-900/20 border border-white/5 rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 h-full flex flex-col justify-between group-hover:bg-slate-900/40 group-hover:border-red-600/20 transition-all">
                                            <div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <span className="bg-slate-800/80 text-white/50 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">Round {race.RoundNumber}</span>
                                                    <span className="text-red-600/50 text-[10px] font-bold uppercase italic tracking-widest">No Data</span>
                                                </div>
                                                <h4 className="text-lg sm:text-2xl font-black text-white italic uppercase leading-[0.9] mb-4">
                                                    {race.EventName}
                                                </h4>
                                            </div>

                                            <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-white/5">
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-4">Import Instructions:</p>
                                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 group-hover:border-red-600/10 transition-colors">
                                                    <code className="block text-[10px] text-red-500 font-mono break-all leading-relaxed whitespace-pre-wrap">
                                                        python scripts/upload_race.py --year {selectedYear} --round {race.RoundNumber}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
