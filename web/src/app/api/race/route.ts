import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const round = searchParams.get('round');

    // For demo purposes, returning mock data
    // In a real app, this would fetch from Firebase or local storage

    const drivers = ["VER", "HAM", "NOR", "LEC", "SAI", "PIA", "RUS", "PER", "ALO", "STR"];
    const driverColors: Record<string, [number, number, number]> = {
        "VER": [6, 0, 239],
        "HAM": [0, 210, 190],
        "NOR": [255, 128, 0],
        "LEC": [220, 0, 0],
        "SAI": [255, 0, 0],
        "PIA": [255, 140, 0],
        "RUS": [0, 163, 150],
        "PER": [0, 0, 200],
        "ALO": [0, 144, 124],
        "STR": [0, 103, 85],
    };

    const frames = [];
    const numFrames = 500;

    // Create a circular track for demo
    const radius = 5000;

    for (let i = 0; i < numFrames; i++) {
        const t = i * 0.1;
        const frameDrivers: any = {};

        drivers.forEach((code, idx) => {
            const angle = (t * 0.05) - (idx * 0.1);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            frameDrivers[code] = {
                x,
                y,
                speed: 280 + Math.random() * 20,
                throttle: 80 + Math.random() * 20,
                brake: Math.random() * 5,
                gear: 7,
                position: idx + 1,
                lap: 1 + Math.floor(i / 100),
            };
        });

        frames.push({
            t,
            lap: 1 + Math.floor(i / 100),
            drivers: frameDrivers
        });
    }

    return NextResponse.json({
        frames,
        driver_colors: driverColors,
        track_statuses: [
            { status: "1", start_time: 0, end_time: null }
        ],
        total_laps: 57,
        metadata: {
            year: parseInt(year || "2024"),
            round: parseInt(round || "1"),
            event_name: "Mock Grand Prix",
            session_type: "R",
            exported_at: new Date().toISOString()
        }
    });
}
