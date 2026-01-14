"use client";

import React from 'react';
import { PlaybackState } from '@/types/race';

interface RaceControlsProps {
    playback: PlaybackState;
    onTogglePlay: () => void;
    onSetSpeed: (speed: number) => void;
    onSeek: (index: number) => void;
    totalFrames: number;
}

export function RaceControls({ playback, onTogglePlay, onSetSpeed, onSeek, totalFrames }: RaceControlsProps) {
    const speeds = [0.5, 1, 2, 5, 10];

    return (
        <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-4">
                <button
                    onClick={onTogglePlay}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                >
                    {playback.isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                    <input
                        type="range"
                        min={0}
                        max={totalFrames - 1}
                        value={playback.currentFrameIndex}
                        onChange={(e) => onSeek(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>{Math.floor(playback.currentTime / 60)}:{(playback.currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                        <span>FRAME {playback.currentFrameIndex} / {totalFrames}</span>
                    </div>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-1">
                    {speeds.map(s => (
                        <button
                            key={s}
                            onClick={() => onSetSpeed(s)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${playback.playbackSpeed === s
                                    ? 'bg-red-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
