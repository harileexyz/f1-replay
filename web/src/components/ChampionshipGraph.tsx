'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartDataPoint {
    round: string;
    [key: string]: number | string;
}

interface ChampionshipGraphProps {
    data: ChartDataPoint[];
}

export function ChampionshipGraph({ data }: ChampionshipGraphProps) {
    return (
        <div className="w-full h-[300px] sm:h-[400px] bg-slate-900/50 rounded-2xl border border-white/5 p-4 sm:p-8">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="round"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        fontFamily="monospace"
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 'auto']}
                        fontFamily="monospace"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                        cursor={{ stroke: '#ffffff20' }}
                    />

                    {/* Max Verstappen */}
                    <Line type="monotone" dataKey="VER" stroke="#3671C6" strokeWidth={3} dot={{ r: 4, fill: '#3671C6', strokeWidth: 0 }} activeDot={{ r: 6 }} />

                    {/* Charles Leclerc */}
                    <Line type="monotone" dataKey="LEC" stroke="#E8002D" strokeWidth={3} dot={{ r: 4, fill: '#E8002D', strokeWidth: 0 }} activeDot={{ r: 6 }} />

                    {/* Lando Norris */}
                    <Line type="monotone" dataKey="NOR" stroke="#FF8700" strokeWidth={3} dot={{ r: 4, fill: '#FF8700', strokeWidth: 0 }} activeDot={{ r: 6 }} />

                    {/* Lewis Hamilton */}
                    <Line type="monotone" dataKey="HAM" stroke="#00D2BE" strokeWidth={3} dot={{ r: 4, fill: '#00D2BE', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
