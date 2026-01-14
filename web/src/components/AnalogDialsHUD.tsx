"use client";

import React, { useMemo } from 'react';
import { DriverData } from '@/types/race';
import { SpeedometerDial } from './SpeedometerDial';

interface AnalogDialsHUDProps {
    driverData: DriverData;
}

export function AnalogDialsHUD({ driverData }: AnalogDialsHUDProps) {
    const simulatedRPM = useMemo(() => {
        if (driverData.rpm) return driverData.rpm;
        const base = 4000;
        return Math.min(12000, base + (driverData.speed * (10 / (driverData.gear || 1))));
    }, [driverData.speed, driverData.gear, driverData.rpm]);

    return (
        <div className="flex gap-4 p-4 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl pointer-events-none">
            <SpeedometerDial
                value={driverData.speed}
                maxValue={350}
                label="Speed"
                unit="KM/H"
                color="rgb(239, 68, 68)"
                size={90}
            />
            <div className="w-[1px] self-stretch bg-white/10 my-2" />
            <SpeedometerDial
                value={simulatedRPM}
                maxValue={12000}
                label="Engine"
                unit="RPM"
                color="rgb(34, 197, 94)"
                size={90}
            />
        </div>
    );
}
