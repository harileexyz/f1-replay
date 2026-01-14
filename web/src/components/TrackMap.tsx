"use client";

import React, { useRef, useEffect, useMemo } from 'react';
import { RaceData, Frame, TrackBounds, RGBColor } from '@/types/race';

interface TrackMapProps {
    data: RaceData;
    currentFrame: Frame;
    bounds: TrackBounds;
    selectedDriver: string | null;
    ghostFrame?: Frame | null;
    viewMode?: 'map' | 'chase' | 'cockpit';
    onDriverClick: (driver: string) => void;
}

export function TrackMap({ data, currentFrame, bounds, selectedDriver, ghostFrame, viewMode = 'map', onDriverClick }: TrackMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Helper to convert world coords to canvas coords
    const scaleToCanvas = (x: number, y: number, canvasWidth: number, canvasHeight: number) => {
        if (viewMode === 'map' || !selectedDriver) {
            const scale = Math.min(
                canvasWidth / bounds.width,
                canvasHeight / bounds.height
            );

            const offsetX = (canvasWidth - bounds.width * scale) / 2;
            const offsetY = (canvasHeight - bounds.height * scale) / 2;

            return {
                x: offsetX + (x - bounds.minX) * scale,
                y: canvasHeight - (offsetY + (y - bounds.minY) * scale)
            };
        } else {
            // Chase Cam Mode: Center on selected driver
            const chaseDriver = currentFrame.drivers[selectedDriver];
            if (!chaseDriver) return { x: 0, y: 0 };

            // Fixed zoom level for chase cam (e.g., 500 meters wide view)
            const zoomScale = Math.min(canvasWidth, canvasHeight) / 1000;

            return {
                x: canvasWidth / 2 + (x - chaseDriver.x) * zoomScale,
                y: canvasHeight / 2 - (y - chaseDriver.y) * zoomScale
            };
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate rotation for cockpit view
        let rotation = 0;
        if (viewMode === 'cockpit' && selectedDriver) {
            const currentIdx = data.frames.findIndex(f => f.t === currentFrame.t);
            const prevFrame = data.frames[currentIdx - 1] || currentFrame;
            const d1 = currentFrame.drivers[selectedDriver];
            const d0 = prevFrame.drivers[selectedDriver];

            if (d1 && d0 && (d1.x !== d0.x || d1.y !== d0.y)) {
                // Calculate angle (heading). Notice we use world coords.
                // In F1 data, Y is often "up", but canvas is flip-Y.
                rotation = Math.atan2(d1.y - d0.y, d1.x - d0.x);
            }
        }

        ctx.save();
        if (viewMode === 'cockpit' && selectedDriver) {
            // Apply rotation around center
            ctx.translate(width / 2, height / 2);
            // Rotate so velocity vector is pointing UP (-PI/2)
            ctx.rotate(-rotation + Math.PI / 2);
            ctx.translate(-width / 2, -height / 2);
        }

        // Draw track layout
        if (data.track_layout && data.track_layout.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Brighter path
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            // Glow effect for track
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';

            data.track_layout.forEach((point, i) => {
                const pos = scaleToCanvas(point.x, point.y, width, height);
                if (i === 0) ctx.moveTo(pos.x, pos.y);
                else ctx.lineTo(pos.x, pos.y);
            });

            ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow
        }

        // Draw driver markers
        Object.entries(currentFrame.drivers).forEach(([code, telemetry]) => {
            const pos = scaleToCanvas(telemetry.x, telemetry.y, width, height);
            const color = data.driver_colors[code] || [255, 255, 255];
            const colorStr = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            const isSelected = selectedDriver === code;

            ctx.save();
            ctx.translate(pos.x, pos.y);

            // If in cockpit view, keep player label upright relative to screen?
            // Actually, let's keep it simple first.

            if (isSelected) {
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fillStyle = `${colorStr}66`;
                ctx.fill();
            }

            // Driver dot
            ctx.beginPath();
            ctx.arc(0, 0, isSelected ? 8 : 4, 0, Math.PI * 2);
            ctx.fillStyle = colorStr;
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.rotate(viewMode === 'cockpit' ? (rotation - Math.PI / 2) : 0);
            ctx.font = isSelected ? 'bold 12px Inter' : '10px Inter';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(code, 0, -15);
            ctx.restore();
        });

        // Draw ghost markers
        if (ghostFrame) {
            Object.entries(ghostFrame.drivers).forEach(([code, telemetry]) => {
                if (code !== selectedDriver) return;
                const pos = scaleToCanvas(telemetry.x, telemetry.y, width, height);
                const color = data.driver_colors[code] || [255, 255, 255];
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.4)`;
                ctx.fill();
            });
        }

        ctx.restore();
    }, [currentFrame, ghostFrame, bounds, data, selectedDriver, viewMode]);

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                style={{ touchAction: 'none' }}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                <h3 className="text-white font-bold text-lg uppercase tracking-tight">
                    {viewMode === 'chase' && selectedDriver ? `${selectedDriver} CHASE CAM` :
                        viewMode === 'cockpit' && selectedDriver ? `${selectedDriver} COCKPIT` : 'TRACK MAP'}
                </h3>
                <p className="text-slate-400 text-[10px] font-mono">LAP {currentFrame.lap}</p>
            </div>

            {viewMode === 'chase' && !selectedDriver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <p className="text-white font-black italic uppercase tracking-widest text-xs">select a driver to enable chase cam</p>
                </div>
            )}
        </div>
    );
}
