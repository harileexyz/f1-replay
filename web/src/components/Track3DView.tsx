"use client";

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { RaceData, Frame } from '@/types/race';

interface Track3DViewProps {
    data: RaceData;
    currentFrame: Frame | null;
    selectedDriver: string | null;
    onDriverClick?: (code: string) => void;
}

// Calculate bounds and scaling from track data
function useTrackBounds(trackLayout: { x: number; y: number }[] | undefined) {
    return useMemo(() => {
        if (!trackLayout || trackLayout.length === 0) {
            return { centerX: 0, centerY: 0, scale: 1, width: 100, height: 100 };
        }

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        trackLayout.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Scale to fit in a reasonable 3D space (target: ~200 units wide)
        const targetSize = 200;
        const scale = targetSize / Math.max(width, height);

        return { centerX, centerY, scale, width, height, minX, maxX, minY, maxY };
    }, [trackLayout]);
}

// Car component - colored box representing a car
function Car({
    position,
    color,
    code,
    isSelected,
    onClick
}: {
    position: [number, number, number];
    color: string;
    code: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <group position={position} onClick={onClick}>
            {/* Car body */}
            <mesh castShadow>
                <boxGeometry args={[3, 0.6, 1.5]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.7}
                    roughness={0.3}
                    emissive={isSelected ? color : '#000'}
                    emissiveIntensity={isSelected ? 0.5 : 0}
                />
            </mesh>

            {/* Front wing */}
            <mesh position={[1.8, 0, 0]} castShadow>
                <boxGeometry args={[0.4, 0.15, 1.8]} />
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Rear wing */}
            <mesh position={[-1.3, 0.5, 0]} castShadow>
                <boxGeometry args={[0.2, 0.5, 1.3]} />
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Driver code label */}
            <Html position={[0, 3, 0]} center distanceFactor={15}>
                <div
                    className={`px-2 py-0.5 rounded text-xs font-black whitespace-nowrap shadow-lg ${isSelected ? 'bg-white text-black scale-125' : 'bg-black/80 text-white'
                        }`}
                    style={{ transform: 'translateY(-50%)' }}
                >
                    {code}
                </div>
            </Html>
        </group>
    );
}

// Track surface component
function TrackSurface({
    trackLayout,
    bounds
}: {
    trackLayout: { x: number; y: number }[];
    bounds: ReturnType<typeof useTrackBounds>;
}) {
    const linePoints = useMemo(() => {
        if (!trackLayout || trackLayout.length < 2) return [];

        return trackLayout.map(p => {
            const x = (p.x - bounds.centerX) * bounds.scale;
            const z = (p.y - bounds.centerY) * bounds.scale;
            return [x, 0.1, z] as [number, number, number];
        });
    }, [trackLayout, bounds]);

    if (linePoints.length < 2) return null;

    return (
        <group>
            {/* Track surface - thick line */}
            <Line
                points={[...linePoints, linePoints[0]]}
                color="#333333"
                lineWidth={15}
            />

            {/* Racing line (white center line) */}
            <Line
                points={[...linePoints, linePoints[0]]}
                color="white"
                lineWidth={1}
                dashed
                dashSize={2}
                gapSize={1}
            />

            {/* Kerb markers (red/white at corners) */}
            <Line
                points={[...linePoints, linePoints[0]]}
                color="#ff4444"
                lineWidth={18}
                opacity={0.3}
                transparent
            />
        </group>
    );
}

// Camera controller that follows selected driver
function CameraController({
    targetPosition,
    cameraMode,
    selectedDriver,
    trackCenter
}: {
    targetPosition: THREE.Vector3 | null;
    cameraMode: 'orbit' | 'chase' | 'top';
    selectedDriver: string | null;
    trackCenter: [number, number, number];
}) {
    const { camera } = useThree();
    const targetRef = useRef(new THREE.Vector3(...trackCenter));

    useFrame(() => {
        if (cameraMode === 'chase' && targetPosition && selectedDriver) {
            // Smoothly follow the selected car
            targetRef.current.lerp(targetPosition, 0.08);

            const offset = new THREE.Vector3(-25, 12, 8);
            const desiredPosition = targetRef.current.clone().add(offset);

            camera.position.lerp(desiredPosition, 0.08);
            camera.lookAt(targetRef.current);
        } else if (cameraMode === 'top') {
            // Fixed top-down view centered on track
            camera.position.set(trackCenter[0], 150, trackCenter[2]);
            camera.lookAt(trackCenter[0], 0, trackCenter[2]);
        }
    });

    return null;
}

// Main scene component (inside Canvas)
function Scene({
    data,
    currentFrame,
    selectedDriver,
    cameraMode,
    onDriverClick
}: Track3DViewProps & { cameraMode: 'orbit' | 'chase' | 'top' }) {
    const bounds = useTrackBounds(data.track_layout);

    const trackCenter: [number, number, number] = [0, 0, 0];

    const selectedPosition = useMemo(() => {
        if (!selectedDriver || !currentFrame?.drivers[selectedDriver]) return null;
        const driver = currentFrame.drivers[selectedDriver];
        const x = (driver.x - bounds.centerX) * bounds.scale;
        const z = (driver.y - bounds.centerY) * bounds.scale;
        return new THREE.Vector3(x, 1, z);
    }, [selectedDriver, currentFrame, bounds]);

    // Get all car positions - scaled and centered
    const cars = useMemo(() => {
        if (!currentFrame) return [];

        return Object.entries(currentFrame.drivers).map(([code, driver]) => {
            const colors = data.driver_colors[code] || [150, 150, 150];
            const color = `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;

            // Transform coordinates to 3D space
            const x = (driver.x - bounds.centerX) * bounds.scale;
            const z = (driver.y - bounds.centerY) * bounds.scale;

            return {
                code,
                position: [x, 1, z] as [number, number, number],
                color,
                isSelected: code === selectedDriver
            };
        });
    }, [currentFrame, data.driver_colors, selectedDriver, bounds]);

    return (
        <>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 80, 120]} fov={50} />

            {/* Camera controller */}
            <CameraController
                targetPosition={selectedPosition}
                cameraMode={cameraMode}
                selectedDriver={selectedDriver}
                trackCenter={trackCenter}
            />

            {/* Orbit controls (only active in orbit mode) */}
            {cameraMode === 'orbit' && (
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    target={trackCenter}
                    maxDistance={300}
                    minDistance={10}
                />
            )}

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[50, 80, 30]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-30, 40, -30]} intensity={0.4} />
            <hemisphereLight args={['#87ceeb', '#1a472a', 0.3]} />

            {/* Ground plane - sized to track */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[400, 400]} />
                <meshStandardMaterial color="#1a472a" roughness={1} />
            </mesh>

            {/* Runway/asphalt area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[250, 250]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
            </mesh>

            {/* Track */}
            <TrackSurface trackLayout={data.track_layout || []} bounds={bounds} />

            {/* Cars */}
            {cars.map(car => (
                <Car
                    key={car.code}
                    position={car.position}
                    color={car.color}
                    code={car.code}
                    isSelected={car.isSelected}
                    onClick={() => onDriverClick?.(car.code)}
                />
            ))}

            {/* Grid helper for reference */}
            <gridHelper args={[200, 20, '#333', '#222']} position={[0, 0.05, 0]} />
        </>
    );
}

// Main exported component
export function Track3DView({ data, currentFrame, selectedDriver, onDriverClick }: Track3DViewProps) {
    const [cameraMode, setCameraMode] = useState<'orbit' | 'chase' | 'top'>('orbit');

    return (
        <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden">
            {/* Camera mode selector */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                {(['orbit', 'chase', 'top'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setCameraMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${cameraMode === mode
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        {mode === 'orbit' ? '🎮 Free' : mode === 'chase' ? '🏎️ Chase' : '🚁 Top'}
                    </button>
                ))}
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 z-10 text-slate-500 text-xs bg-black/50 px-2 py-1 rounded">
                {cameraMode === 'orbit' && 'Drag to rotate • Scroll to zoom • Right-click to pan'}
                {cameraMode === 'chase' && selectedDriver
                    ? `Following ${selectedDriver}`
                    : cameraMode === 'chase'
                        ? 'Select a driver to follow'
                        : 'Top-down view'
                }
            </div>

            {/* Car count indicator */}
            {currentFrame && (
                <div className="absolute top-4 right-4 z-10 bg-black/50 px-3 py-1 rounded text-white text-xs">
                    {Object.keys(currentFrame.drivers).length} cars on track
                </div>
            )}

            {/* 3D Canvas */}
            <Canvas shadows>
                <Scene
                    data={data}
                    currentFrame={currentFrame}
                    selectedDriver={selectedDriver}
                    cameraMode={cameraMode}
                    onDriverClick={onDriverClick}
                />
            </Canvas>
        </div>
    );
}
