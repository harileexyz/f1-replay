"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    Line,
    Text,
    Sky,
    Environment,
    ContactShadows,
    Float,
    Stars
} from '@react-three/drei';
import * as THREE from 'three';
import { RaceData, Frame, TrackBounds } from '@/types/race';

interface TrackMap3DProps {
    data: RaceData;
    currentFrame: Frame;
    bounds: TrackBounds;
    selectedDriver: string | null;
    viewMode: 'map' | 'chase' | 'cockpit';
}

function CarModel({ color, isSelected }: { color: string, isSelected: boolean }) {
    return (
        <group scale={1.5}>
            {/* Main Chassis */}
            <mesh castShadow position={[0, 0.4, 0]}>
                <boxGeometry args={[4, 0.6, 1.8]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Nose */}
            <mesh castShadow position={[2.5, 0.2, 0]}>
                <boxGeometry args={[1.5, 0.3, 0.8]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Rear Wing */}
            <mesh castShadow position={[-1.8, 1, 0]}>
                <boxGeometry args={[0.5, 0.1, 1.8]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh castShadow position={[-1.8, 0.6, 0.8]}>
                <boxGeometry args={[0.5, 0.8, 0.1]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh castShadow position={[-1.8, 0.6, -0.8]}>
                <boxGeometry args={[0.5, 0.8, 0.1]} />
                <meshStandardMaterial color="#111" />
            </mesh>

            {/* Wheels */}
            {[[-1.2, 0.9], [-1.2, -0.9], [1.5, 0.9], [1.5, -0.9]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.3, pos[1]]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.5, 16]} />
                    <meshStandardMaterial color="#111" roughness={0.8} />
                </mesh>
            ))}

            {/* Neon Underglow for visibility */}
            {isSelected && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[5, 2.5]} />
                    <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
}

function Car({
    code,
    telemetry,
    color,
    isSelected,
    viewMode
}: {
    code: string,
    telemetry: any,
    color: [number, number, number],
    isSelected: boolean,
    viewMode: string
}) {
    const groupRef = useRef<THREE.Group>(null);
    const colorStr = `rgb(${color.join(',')})`;

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const targetX = telemetry.x;
        const targetZ = -telemetry.y;

        // Find current position for heading calculation
        const currentPos = groupRef.current.position;
        const dx = targetX - currentPos.x;
        const dz = targetZ - currentPos.z;

        // Update position with smoothing
        groupRef.current.position.lerp(new THREE.Vector3(targetX, 0, targetZ), 0.15);

        // Rotation towards heading
        if (Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1) {
            const angle = Math.atan2(-dz, dx);
            const targetRotation = new THREE.Euler(0, angle, 0);
            groupRef.current.quaternion.slerp(new THREE.Quaternion().setFromEuler(targetRotation), 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            <CarModel color={colorStr} isSelected={isSelected} />

            <Text
                position={[0, 5, 0]}
                fontSize={isSelected ? 6 : 4}
                color="white"
                outlineWidth={0.5}
                outlineColor="black"
            >
                {code}
            </Text>

            {isSelected && (
                <pointLight color={colorStr} intensity={4} distance={40} position={[0, 2, 0]} />
            )}
        </group>
    );
}

function Track({ layout }: { layout: { x: number, y: number }[] }) {
    const trackMesh = useMemo(() => {
        const points = layout.map(p => new THREE.Vector3(p.x, 0.1, -p.y));
        // Create a shape for a wide track
        const trackWidth = 15;
        const curve = new THREE.CatmullRomCurve3(points, true);

        // This is a simpler way to make a ribbon: use a tube with low segments and scale it
        // Or better yet, just many planes. Let's use a wide flat line for now but with better visibility.
        return { points };
    }, [layout]);

    return (
        <group>
            {/* Main Track Surface - Real Mesh for depth */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <meshStandardMaterial color="#2d3748" roughness={0.6} metalness={0.2} side={THREE.DoubleSide} />
            </mesh>

            {/* The actual Pavement - Thicker lines for Sim feel */}
            <Line
                points={trackMesh.points}
                color="#1a202c"
                lineWidth={80} // Much thicker for 3D space
                opacity={1}
            />

            {/* Painted Edges */}
            <Line
                points={trackMesh.points}
                color="#ffffff"
                lineWidth={85}
                opacity={0.3}
                transparent
            />

            {/* Red/White Curbs (Subtle Line) */}
            <Line
                points={trackMesh.points}
                color="#e53e3e"
                lineWidth={10}
                opacity={0.5}
                transparent
            />
        </group>
    );
}

function CameraRig({ selectedDriver, currentFrame, viewMode }: { selectedDriver: string | null, currentFrame: Frame, viewMode: string }) {
    const { camera } = useThree();
    const targetPos = useRef(new THREE.Vector3());
    const lastPos = useRef(new THREE.Vector3());
    const heading = useRef(new THREE.Vector3(1, 0, 0));

    useFrame((state, delta) => {
        if (!selectedDriver) return;

        const driverData = currentFrame.drivers[selectedDriver];
        if (!driverData) return;

        const x = driverData.x;
        const z = -driverData.y;

        const pCam = camera as THREE.PerspectiveCamera;

        // Calculate dynamic heading/velocity
        const currentPos = new THREE.Vector3(x, 0, z);
        const diff = currentPos.clone().sub(lastPos.current);
        if (diff.length() > 0.1) {
            heading.current.copy(diff).normalize();
        }
        lastPos.current.copy(currentPos);

        if (viewMode === 'chase') {
            // "Flight Sim" Chase: Offset relative to heading
            const offsetDist = 120;
            const height = 60;

            // Camera position: behind the car relative to heading
            const idealCameraPos = new THREE.Vector3(
                x - heading.current.x * offsetDist,
                height,
                z - heading.current.z * offsetDist
            );

            camera.position.lerp(idealCameraPos, 0.1);
            camera.lookAt(x, 5, z);

            if (pCam.isPerspectiveCamera) {
                const speedFactor = Math.min(driverData.speed / 320, 1);
                pCam.fov = THREE.MathUtils.lerp(pCam.fov, 50 + speedFactor * 15, 0.1);
                pCam.updateProjectionMatrix();
            }
        } else if (viewMode === 'cockpit') {
            // Cockpit: On the car, looking exactly where the car is heading
            camera.position.set(x, 4.5, z);

            // Look 200 units ahead in the heading direction
            const lookAtPoint = new THREE.Vector3(
                x + heading.current.x * 200,
                3.5,
                z + heading.current.z * 200
            );
            camera.lookAt(lookAtPoint);
        }
    });

    return null;
}

export function TrackMap3D({ data, currentFrame, bounds, selectedDriver, viewMode }: TrackMap3DProps) {
    const center = useMemo(() => ({
        x: (bounds.minX + bounds.maxX) / 2,
        z: -(bounds.minY + bounds.maxY) / 2
    }), [bounds]);

    return (
        <div className="w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-white/5 relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
            <Canvas shadows gl={{ antialias: true, logarithmicDepthBuffer: true }}>
                {/* Environment & Atmosphere - Brighter for Sim Feel */}
                <Sky sunPosition={[100, 50, 100]} inclination={0.1} azimuth={0.25} />
                <Stars radius={300} depth={60} count={1000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="dawn" />
                {/* Remove fog for better clarity */}

                {/* Lights - Stronger Directional Light (Sun) */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[200, 500, 200]}
                    intensity={2}
                    castShadow
                    shadow-mapSize={[4096, 4096]}
                />
                <pointLight position={[center.x, 1000, center.z]} intensity={1} color="#ffffff" />

                {/* The Circuit */}
                {data.track_layout && <Track layout={data.track_layout} />}

                {/* Ground Plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[center.x, -0.1, center.z]}>
                    <planeGeometry args={[20000, 20000]} />
                    <meshStandardMaterial color="#020617" roughness={1} metalness={0} />
                </mesh>
                <gridHelper args={[20000, 100, '#1e293b', '#0f172a']} position={[center.x, 0, center.z]} />

                {/* Drivers */}
                {Object.entries(currentFrame.drivers).map(([code, telemetry]) => (
                    <Car
                        key={code}
                        code={code}
                        telemetry={telemetry}
                        color={data.driver_colors[code] || [255, 255, 255]}
                        isSelected={selectedDriver === code}
                        viewMode={viewMode}
                    />
                ))}

                {/* Ground Shadows */}
                <ContactShadows resolution={1024} scale={2000} blur={2} opacity={0.5} far={10} color="#000" />

                {/* Camera Control Logic */}
                {viewMode === 'map' ? (
                    <>
                        <OrbitControls
                            makeDefault
                            maxPolarAngle={Math.PI / 2.2}
                            enableDamping={true}
                            dampingFactor={0.05}
                            target={[center.x, 0, center.z]}
                        />
                        <PerspectiveCamera
                            makeDefault
                            position={[center.x, 1500, center.z + 1500]}
                            fov={45}
                        />
                    </>
                ) : (
                    <CameraRig
                        selectedDriver={selectedDriver}
                        currentFrame={currentFrame}
                        viewMode={viewMode}
                    />
                )}
            </Canvas>

            {/* Flight Sim Style HUD Overlay */}
            <div className="absolute top-6 left-6 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-white font-black italic uppercase tracking-tighter text-lg">PRO METRIC ENGINE</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Render Mode: {viewMode.toUpperCase()}</span>
                        <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Spatial Resolution: 1:1 Scale</span>
                    </div>
                </div>
            </div>

            {/* Virtual Compass / Horizon */}
            <div className="absolute bottom-6 left-6 pointer-events-none opacity-50">
                <div className="w-32 h-32 border-2 border-white/10 rounded-full flex items-center justify-center relative">
                    <div className="absolute w-full h-[1px] bg-white/20" />
                    <div className="absolute h-full w-[1px] bg-white/20" />
                    <span className="absolute top-1 text-[8px] text-white font-mono">N</span>
                </div>
            </div>
        </div>
    );
}
