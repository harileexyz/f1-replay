"use client";

import { useState, useEffect } from 'react';

interface DriverProfileData {
    firstName: string;
    lastName: string;
    team: string;
    teamId: string;
    number: number;
    country: string;
    countryCode: string;
    countryFlag: string;
    teamColor: string;
}

interface DriverProfileProps {
    driverCode: string;
    isOpen: boolean;
    onClose: () => void;
    currentPosition?: number;
    currentSpeed?: number;
    driverColor?: string;
}

export function DriverProfile({ driverCode, isOpen, onClose, currentPosition, currentSpeed, driverColor }: DriverProfileProps) {
    const [profile, setProfile] = useState<DriverProfileData | null>(null);
    const [allProfiles, setAllProfiles] = useState<Record<string, DriverProfileData>>({});

    // Load profiles on mount
    useEffect(() => {
        fetch('/drivers/profiles.json')
            .then(res => res.json())
            .then(data => setAllProfiles(data))
            .catch(err => console.error('Failed to load driver profiles:', err));
    }, []);

    // Update profile when driver changes
    useEffect(() => {
        if (driverCode && allProfiles[driverCode]) {
            setProfile(allProfiles[driverCode]);
        }
    }, [driverCode, allProfiles]);

    if (!isOpen || !profile) return null;

    const teamColor = driverColor || profile.teamColor;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[100] max-w-md mx-auto pointer-events-none">
                <div
                    className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl pointer-events-auto"
                    style={{
                        boxShadow: `0 0 60px ${teamColor}20, 0 0 100px ${teamColor}10`
                    }}
                >
                    {/* Header with team color accent */}
                    <div
                        className="h-2 w-full"
                        style={{ backgroundColor: teamColor }}
                    />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Profile Content */}
                    <div className="p-6">
                        {/* Driver Number & Name */}
                        <div className="flex items-start gap-4 mb-6">
                            {/* Large Number */}
                            <div
                                className="text-6xl font-black italic opacity-20"
                                style={{ color: teamColor }}
                            >
                                {profile.number}
                            </div>

                            {/* Name & Flag */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl">{profile.countryFlag}</span>
                                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">
                                        {profile.country}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">
                                    {profile.firstName}
                                </h2>
                                <h2
                                    className="text-3xl font-black tracking-tight uppercase"
                                    style={{ color: teamColor }}
                                >
                                    {profile.lastName}
                                </h2>
                            </div>
                        </div>

                        {/* Team Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6"
                            style={{ backgroundColor: `${teamColor}15`, border: `1px solid ${teamColor}30` }}
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: teamColor }}
                            />
                            <span
                                className="font-bold text-sm tracking-wide"
                                style={{ color: teamColor }}
                            >
                                {profile.team}
                            </span>
                        </div>

                        {/* Live Stats */}
                        {(currentPosition || currentSpeed) && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {currentPosition && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                            Position
                                        </p>
                                        <p className="text-white text-3xl font-black">
                                            P{currentPosition}
                                        </p>
                                    </div>
                                )}
                                {currentSpeed && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                            Speed
                                        </p>
                                        <p className="text-white text-3xl font-black">
                                            {currentSpeed}
                                            <span className="text-sm text-slate-500 ml-1">km/h</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Driver Code Badge */}
                        <div className="flex justify-center">
                            <div
                                className="px-6 py-3 rounded-2xl font-black text-2xl tracking-widest"
                                style={{
                                    backgroundColor: teamColor,
                                    color: getContrastColor(teamColor)
                                }}
                            >
                                {driverCode}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Helper function to get contrast color (black or white) based on background
function getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Mini version for sidebar
interface DriverMiniProfileProps {
    driverCode: string;
    onClick: () => void;
    teamColor?: string;
}

export function DriverMiniProfile({ driverCode, onClick, teamColor }: DriverMiniProfileProps) {
    return (
        <button
            onClick={onClick}
            className="p-1 rounded-md hover:bg-slate-700/50 text-slate-500 hover:text-white transition-all"
            title="View Driver Profile"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    );
}
