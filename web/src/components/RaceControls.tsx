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
        <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={onTogglePlay}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20 shrink-0"
                >
                    {playback.isPlaying ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <input
                        type="range"
                        min={0}
                        max={totalFrames - 1}
                        value={playback.currentFrameIndex}
                        onChange={(e) => onSeek(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono">
                        <span>{Math.floor(playback.currentTime / 60)}:{(playback.currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                        <span className="hidden sm:inline">FRAME {playback.currentFrameIndex} / {totalFrames}</span>
                        <span className="sm:hidden">{playback.currentFrameIndex}/{totalFrames}</span>
                    </div>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-0.5 sm:p-1 shrink-0 overflow-x-auto max-w-[120px] sm:max-w-none">
                    {speeds.map(s => (
                        <button
                            key={s}
                            onClick={() => onSetSpeed(s)}
                            className={`px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold transition-colors shrink-0 ${playback.playbackSpeed === s
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
