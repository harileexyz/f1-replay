'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StandingItem, ConstructorStandingItem } from '@/data/standings';

export function DriverStandingsTable({ data }: { data: StandingItem[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                        <th className="py-4 pl-4">Pos</th>
                        <th className="py-4">Pilot</th>
                        <th className="py-4 hidden sm:table-cell">Constructor</th>
                        <th className="py-4 text-center">Wins</th>
                        <th className="py-4 text-center hidden sm:table-cell">Podiums</th>
                        <th className="py-4 pr-4 text-right">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((driver) => (
                        <tr key={driver.driverId} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pl-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-black italic w-6 text-center ${driver.position <= 3 ? 'text-white' : 'text-slate-500'}`}>
                                        {driver.position}
                                    </span>
                                    {driver.trend !== 'SAME' && (
                                        <span className={`text-[10px] font-bold ${driver.trend === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                                            {driver.trend === 'UP' ? '▲' : '▼'} {driver.trendPos || 1}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="py-4">
                                <Link href={`/drivers/${driver.driverId}`} className="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative bg-slate-800">
                                        <Image src={driver.avatarUrl} alt={driver.name} fill className="object-cover object-top" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-sm sm:text-base group-hover:text-red-500 transition-colors">
                                            {driver.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono uppercase sm:hidden" style={{ color: driver.teamColor }}>
                                            {driver.team}
                                        </span>
                                    </div>
                                </Link>
                            </td>
                            <td className="py-4 hidden sm:table-cell">
                                <Link href={`/teams/${driver.constructorId}`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: driver.teamColor }} />
                                    {driver.team}
                                </Link>
                            </td>
                            <td className="py-4 text-center text-slate-300 font-mono text-sm">{driver.wins}</td>
                            <td className="py-4 text-center text-slate-500 font-mono text-sm hidden sm:table-cell">{driver.podiums}</td>
                            <td className="py-4 pr-4 text-right">
                                <span className="inline-block px-3 py-1 rounded-md bg-slate-800 border border-white/10 font-mono font-bold text-white text-sm">
                                    {driver.points} PTS
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ConstructorStandingsTable({ data }: { data: ConstructorStandingItem[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                        <th className="py-4 pl-4">Pos</th>
                        <th className="py-4">Constructor</th>
                        <th className="py-4 text-center">Wins</th>
                        <th className="py-4 text-center hidden sm:table-cell">Podiums</th>
                        <th className="py-4 pr-4 text-right">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((team) => (
                        <tr key={team.constructorId} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pl-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-black italic w-6 text-center ${team.position <= 3 ? 'text-white' : 'text-slate-500'}`}>
                                        {team.position}
                                    </span>
                                </div>
                            </td>
                            <td className="py-4">
                                <Link href={`/teams/${team.constructorId}`} className="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
                                    <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10" style={{ borderLeft: `3px solid ${team.teamColor}` }}>
                                        {team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-white text-sm sm:text-base group-hover:text-red-500 transition-colors">
                                        {team.name}
                                    </span>
                                </Link>
                            </td>
                            <td className="py-4 text-center text-slate-300 font-mono text-sm">{team.wins}</td>
                            <td className="py-4 text-center text-slate-500 font-mono text-sm hidden sm:table-cell">{team.podiums}</td>
                            <td className="py-4 pr-4 text-right">
                                <span className="inline-block px-3 py-1 rounded-md bg-slate-800 border border-white/10 font-mono font-bold text-white text-sm">
                                    {team.points} PTS
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
