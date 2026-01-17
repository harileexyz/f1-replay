"use client";

import React, { useRef, useEffect } from 'react';
import { RaceData, Frame, TrackBounds, DriverData } from '@/types/race';

interface IsometricViewProps {
    data: RaceData;
    currentFrame: Frame;
    bounds: TrackBounds;
    selectedDriver: string | null;
    onDriverClick: (driver: string) => void;
}

export function IsometricTrackView({
    data,
    currentFrame,
    bounds,
    selectedDriver,
    onDriverClick
}: IsometricViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = React.useState(1.4);
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [lastMousePos, setLastMousePos] = React.useState({ x: 0, y: 0 });
    const [cameraMode, setCameraMode] = React.useState<'overview' | 'chase'>('overview');

    // Isometric projection helpers
    const ISO_ANGLE = Math.PI / 6;
    const ISO_SCALE = 0.8;

    const toIsometric = (x: number, y: number, z: number = 0) => {
        const isoX = (x - y) * Math.cos(ISO_ANGLE);
        const isoY = (x + y) * Math.sin(ISO_ANGLE) - z;
        return { x: isoX, y: isoY };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        const maxDimension = Math.max(bounds.width, bounds.height);
        const effectiveZoom = cameraMode === 'chase' ? Math.max(zoom, 2.5) : zoom;
        const baseScale = (Math.min(width, height) / maxDimension) * effectiveZoom;

        let centerX = width / 2 + offset.x;
        let centerY = height / 2 + offset.y;

        const selectedTelemetry: DriverData | null = selectedDriver ? currentFrame.drivers[selectedDriver] : null;

        // Isometric transform function
        const worldToCanvas = (wx: number, wy: number, wz: number = 0): { x: number; y: number; scale: number } => {
            const nx = (wx - bounds.minX - bounds.width / 2) * baseScale;
            const ny = (wy - bounds.minY - bounds.height / 2) * baseScale;
            const iso = toIsometric(nx * ISO_SCALE, ny * ISO_SCALE, wz);
            return {
                x: centerX + iso.x,
                y: centerY + iso.y,
                scale: 1
            };
        };

        // Chase mode: center on selected driver with higher zoom
        if (cameraMode === 'chase' && selectedTelemetry) {
            const nx = (selectedTelemetry.x - bounds.minX - bounds.width / 2) * baseScale;
            const ny = (selectedTelemetry.y - bounds.minY - bounds.height / 2) * baseScale;
            const iso = toIsometric(nx * ISO_SCALE, ny * ISO_SCALE, 0);
            centerX = width / 2 - iso.x;
            centerY = height / 2 - iso.y;
        }

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (cameraMode === 'chase') {
            gradient.addColorStop(0, '#1a1f3a');
            gradient.addColorStop(0.4, '#0f172a');
            gradient.addColorStop(1, '#020617');
        } else {
            gradient.addColorStop(0, '#0a111a');
            gradient.addColorStop(1, '#111827');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw horizon line in chase mode
        if (cameraMode === 'chase') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, height * 0.5);
            ctx.lineTo(width, height * 0.5);
            ctx.stroke();
        }

        // Grid (overview only)
        if (cameraMode !== 'chase') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 1;
            const gridSize = 100 * (zoom / 2);
            for (let i = -width * 2; i < width * 2; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(i + offset.x % gridSize, 0);
                ctx.lineTo(i + offset.x % gridSize, height);
                ctx.stroke();
            }
        }

        if (!data.track_layout || data.track_layout.length === 0) return;

        // Draw track
        const totalPoints = data.track_layout.length;
        const sectorPoints = [
            data.track_layout.slice(0, Math.floor(totalPoints / 3) + 1),
            data.track_layout.slice(Math.floor(totalPoints / 3), Math.floor(totalPoints * 2 / 3) + 1),
            data.track_layout.slice(Math.floor(totalPoints * 2 / 3))
        ];

        // Track shadow
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 24 * (effectiveZoom / 1.5);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        data.track_layout.forEach((p: { x: number; y: number }, i: number) => {
            const pos = worldToCanvas(p.x, p.y, -10 * effectiveZoom);
            if (i === 0) ctx.moveTo(pos.x + 5, pos.y + 5);
            else ctx.lineTo(pos.x + 5, pos.y + 5);
        });
        ctx.stroke();

        // Track base
        ctx.beginPath();
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 22 * (effectiveZoom / 1.5);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        data.track_layout.forEach((p: { x: number; y: number }, i: number) => {
            const pos = worldToCanvas(p.x, p.y);
            if (i === 0) ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        });
        ctx.stroke();

        // Sector edge lines (outer edge)
        const sectorEdgeColors = ['rgba(239, 68, 68, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(234, 179, 8, 0.4)'];
        sectorPoints.forEach((points, sIndex) => {
            ctx.beginPath();
            ctx.strokeStyle = sectorEdgeColors[sIndex];
            ctx.lineWidth = 20 * (effectiveZoom / 1.5);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            points.forEach((p: { x: number; y: number }, i: number) => {
                const pos = worldToCanvas(p.x, p.y);
                if (i === 0) ctx.moveTo(pos.x, pos.y);
                else ctx.lineTo(pos.x, pos.y);
            });
            ctx.stroke();
        });

        // Track surface
        ctx.beginPath();
        ctx.strokeStyle = '#3d424d';
        ctx.lineWidth = 14 * (effectiveZoom / 1.5);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        data.track_layout.forEach((p: { x: number; y: number }, i: number) => {
            const pos = worldToCanvas(p.x, p.y);
            if (i === 0) ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        });
        ctx.stroke();

        // Racing line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([10 * effectiveZoom, 5 * effectiveZoom]);
        data.track_layout.forEach((p: { x: number; y: number }, i: number) => {
            const pos = worldToCanvas(p.x, p.y);
            if (i === 0) ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Sort drivers by depth for proper rendering
        const sortedDrivers = Object.entries(currentFrame.drivers)
            .sort(([, a], [, b]) => ((a as DriverData).y || 0) - ((b as DriverData).y || 0));

        // Draw cars
        sortedDrivers.forEach(([code, telemetry]) => {
            const tel = telemetry as DriverData;
            const color = data.driver_colors[code] || [255, 255, 255];
            const colorStr = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            const isSelected = selectedDriver === code;

            const pos = worldToCanvas(tel.x, tel.y);

            const elevation = (isSelected ? 6 : 2) * effectiveZoom;
            const elevatedPos = worldToCanvas(tel.x, tel.y, elevation);

            // Shadow
            ctx.beginPath();
            ctx.ellipse(pos.x + 2, pos.y + 2, 10 * effectiveZoom, 5 * effectiveZoom, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fill();

            // Car diamond
            const carW = (isSelected ? 14 : 10) * effectiveZoom;
            const carH = (isSelected ? 6 : 4) * effectiveZoom;

            ctx.beginPath();
            ctx.moveTo(elevatedPos.x - carW / 2, elevatedPos.y);
            ctx.lineTo(elevatedPos.x, elevatedPos.y + carH);
            ctx.lineTo(elevatedPos.x + carW / 2, elevatedPos.y);
            ctx.lineTo(elevatedPos.x, elevatedPos.y - carH);
            ctx.closePath();

            const grad = ctx.createLinearGradient(elevatedPos.x - carW / 2, elevatedPos.y - carH, elevatedPos.x + carW / 2, elevatedPos.y + carH);
            grad.addColorStop(0, colorStr);
            grad.addColorStop(1, `rgba(${color[0] * 0.5},${color[1] * 0.5},${color[2] * 0.5},1)`);
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.4)';
            ctx.lineWidth = isSelected ? 2.5 : 1;
            ctx.stroke();

            // DRS indicator
            if (tel.drs >= 10) {
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.arc(elevatedPos.x + carW / 2 + 4, elevatedPos.y - carH, 3 * effectiveZoom, 0, Math.PI * 2);
                ctx.fill();
            }

            // Label
            const labelY = elevatedPos.y - carH - 12 * effectiveZoom;
            ctx.font = `${isSelected ? 'bold 12px' : '10px'} Inter, sans-serif`;
            const tw = ctx.measureText(code).width;

            ctx.fillStyle = isSelected ? colorStr : 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.roundRect(elevatedPos.x - tw / 2 - 5, labelY - 8, tw + 10, 16, 4);
            ctx.fill();

            ctx.fillStyle = isSelected ? '#000' : '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(code, elevatedPos.x, labelY);
        });

    }, [currentFrame, bounds, data, selectedDriver, zoom, offset, cameraMode]);

    const handleWheel = (e: React.WheelEvent) => {
        if (cameraMode !== 'chase') {
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(z => Math.max(0.5, Math.min(5, z * delta)));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (cameraMode !== 'chase') {
            setIsDragging(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || cameraMode === 'chase') return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
            <canvas
                ref={canvasRef}
                className={`w-full h-full ${cameraMode === 'chase' ? 'cursor-default' : (isDragging ? 'cursor-grabbing' : 'cursor-grab')}`}
                style={{ touchAction: 'none' }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Legend */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                <div className="flex flex-col gap-1">
                    <h3 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                        <span className="w-2 h-6 bg-red-600 rounded-full" />
                        {cameraMode === 'chase' ? 'Chase Cam' : 'Isometric 2.5D'}
                    </h3>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-400 text-xs font-mono bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">
                            Lap {currentFrame.lap}
                        </p>
                        {cameraMode !== 'chase' && (
                            <p className="text-slate-400 text-xs font-mono bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">
                                Zoom {zoom.toFixed(1)}x
                            </p>
                        )}
                    </div>
                </div>

                {/* Sectors Legend */}
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-red-500/30">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] text-red-400 font-bold uppercase">S1</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-blue-500/30">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] text-blue-400 font-bold uppercase">S2</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-yellow-500/30">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-[10px] text-yellow-400 font-bold uppercase">S3</span>
                    </div>
                </div>
            </div>

            {/* Selected Driver Info */}
            {selectedDriver && currentFrame.drivers[selectedDriver] && (
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner"
                                    style={{
                                        backgroundColor: data.driver_colors[selectedDriver]
                                            ? `rgb(${data.driver_colors[selectedDriver].join(',')})`
                                            : '#fff'
                                    }}
                                >
                                    {selectedDriver}
                                </div>
                                <div>
                                    <div className="text-white font-bold text-base leading-none">POS {currentFrame.drivers[selectedDriver].position}</div>
                                    <div className="text-slate-500 text-[10px] uppercase font-bold mt-1">Active Highlight</div>
                                </div>
                            </div>
                            {currentFrame.drivers[selectedDriver].drs >= 10 && (
                                <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/30">DRS</div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-2 rounded-lg">
                                <div className="text-slate-500 text-[9px] uppercase font-bold mb-1">Speed</div>
                                <div className="text-white font-mono text-lg">{Math.round(currentFrame.drivers[selectedDriver].speed)} <span className="text-[10px] text-slate-400">KM/H</span></div>
                            </div>
                            <div className="bg-white/5 p-2 rounded-lg">
                                <div className="text-slate-500 text-[9px] uppercase font-bold mb-1">RPM</div>
                                <div className="text-white font-mono text-lg">{currentFrame.drivers[selectedDriver].rpm}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <button
                    onClick={() => {
                        if (cameraMode === 'chase') {
                            setCameraMode('overview');
                        } else if (selectedDriver) {
                            setCameraMode('chase');
                        }
                    }}
                    className={`w-10 h-10 backdrop-blur-sm border rounded-full flex items-center justify-center text-white transition-all shadow-xl ${cameraMode === 'chase'
                        ? 'bg-blue-600 hover:bg-blue-500 border-blue-500/50'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-white/10'
                        } ${!selectedDriver && cameraMode !== 'chase' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={cameraMode === 'chase' ? 'Switch to Overview' : 'Chase Cam (select a driver first)'}
                    disabled={!selectedDriver && cameraMode !== 'chase'}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
                {cameraMode !== 'chase' && (
                    <>
                        <button
                            onClick={() => setZoom(z => Math.min(5, z + 0.2))}
                            className="w-10 h-10 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <button
                            onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
                            className="w-10 h-10 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                    </>
                )}
                <button
                    onClick={() => { setZoom(1.4); setOffset({ x: 0, y: 0 }); setCameraMode('overview'); }}
                    className="w-10 h-10 bg-red-600 hover:bg-red-500 backdrop-blur-sm border border-red-500/50 rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                    title="Recenter"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" /></svg>
                </button>
            </div>

            {/* Chase cam indicator */}
            {cameraMode === 'chase' && selectedDriver && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className="bg-blue-600/90 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/50 flex items-center gap-2 shadow-xl">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-white text-xs font-bold uppercase tracking-wide">Following: {selectedDriver}</span>
                    </div>
                </div>
            )}

            <div className="absolute bottom-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
                    {cameraMode === 'chase' ? 'Racing game view - Camera follows driver' : 'Drag to move • Scroll to zoom'}
                </p>
            </div>
        </div>
    );
}
