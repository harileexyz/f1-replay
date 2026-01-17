"use client";

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, PerspectiveCamera, Line, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RaceData, Frame, TrackBounds, DriverData } from '@/types/race';

interface RacingViewProps {
    data: RaceData;
    currentFrame: Frame;
    bounds: TrackBounds;
    selectedDriver: string | null;
    onDriverClick: (driver: string) => void;
}

// Convert 2D track coordinates to 3D points
function createTrackPoints(trackLayout: { x: number; y: number }[], bounds: TrackBounds): THREE.Vector3[] {
    const scale = 0.02; // Scale for larger track
    return trackLayout.map(p => new THREE.Vector3(
        (p.x - bounds.minX - bounds.width / 2) * scale,
        0, // Y is up in Three.js, ground level
        (p.y - bounds.minY - bounds.height / 2) * scale
    ));
}

// Track Road Component - flat 2D road lying on the ground
function TrackRoad({ points }: { points: THREE.Vector3[] }) {
    const trackWidth = 3.0; // Wider track for bigger scale

    // Create a flat ribbon geometry
    const roadGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const indices: number[] = [];

        // Generate ribbon vertices
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const next = points[(i + 1) % points.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);

            // Left and right edge points at ground level
            const left = p.clone().add(perpendicular.clone().multiplyScalar(trackWidth));
            const right = p.clone().add(perpendicular.clone().multiplyScalar(-trackWidth));

            vertices.push(left.x, 0.01, left.z);   // Left edge
            vertices.push(right.x, 0.01, right.z); // Right edge
        }

        // Generate triangles
        for (let i = 0; i < points.length; i++) {
            const next = (i + 1) % points.length;
            const i0 = i * 2;
            const i1 = i * 2 + 1;
            const i2 = next * 2;
            const i3 = next * 2 + 1;

            indices.push(i0, i2, i1);
            indices.push(i1, i2, i3);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }, [points]);

    return (
        <mesh geometry={roadGeometry}>
            <meshStandardMaterial color="#3a3a3a" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
    );
}

// Track Edges - yellow lines on track edges
function TrackEdges({ points }: { points: THREE.Vector3[] }) {
    const edgeOffset = 3.0; // Match track width

    const leftEdge = useMemo(() => {
        return points.map((p, i) => {
            const next = points[(i + 1) % points.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);
            return p.clone().add(perpendicular.multiplyScalar(edgeOffset)).setY(0.02);
        });
    }, [points]);

    const rightEdge = useMemo(() => {
        return points.map((p, i) => {
            const next = points[(i + 1) % points.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perpendicular = new THREE.Vector3(dir.z, 0, -dir.x);
            return p.clone().add(perpendicular.multiplyScalar(edgeOffset)).setY(0.02);
        });
    }, [points]);

    return (
        <>
            <Line points={leftEdge} color="#fbbf24" lineWidth={3} />
            <Line points={rightEdge} color="#fbbf24" lineWidth={3} />
        </>
    );
}

// White Center Divider Line (dashed)
function CenterDivider({ points }: { points: THREE.Vector3[] }) {
    const centerPoints = points.map(p => new THREE.Vector3(p.x, 0.02, p.z));
    return <Line points={centerPoints} color="white" lineWidth={2} dashed dashSize={1.5} gapSize={0.8} />;
}

// Track Barriers - red/white TECPRO barriers along the track
function TrackBarriers({ points }: { points: THREE.Vector3[] }) {
    const barriers = useMemo(() => {
        const barrierPositions: { pos: THREE.Vector3; rotation: number }[] = [];
        const barrierOffset = 4.5; // Outside track edge
        const spacing = 8; // Place barrier every N points

        for (let i = 0; i < points.length; i += spacing) {
            const p = points[i];
            const next = points[(i + 1) % points.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);
            const rotation = Math.atan2(dir.z, dir.x);

            // Left side barrier
            const leftPos = p.clone().add(perpendicular.clone().multiplyScalar(barrierOffset));
            leftPos.y = 0.3;
            barrierPositions.push({ pos: leftPos, rotation });

            // Right side barrier (occasionally)
            if (i % (spacing * 2) === 0) {
                const rightPerp = new THREE.Vector3(dir.z, 0, -dir.x);
                const rightPos = p.clone().add(rightPerp.clone().multiplyScalar(barrierOffset));
                rightPos.y = 0.3;
                barrierPositions.push({ pos: rightPos, rotation });
            }
        }
        return barrierPositions;
    }, [points]);

    return (
        <>
            {barriers.map((barrier, i) => (
                <group key={i} position={barrier.pos} rotation={[0, barrier.rotation, 0]}>
                    {/* TECPRO style barrier */}
                    <mesh castShadow>
                        <boxGeometry args={[2.0, 0.6, 0.4]} />
                        <meshStandardMaterial color={i % 2 === 0 ? "#dc2626" : "#ffffff"} />
                    </mesh>
                </group>
            ))}
        </>
    );
}

// Grandstand - placed at specific locations
function Grandstand({ position, rotation = 0 }: { position: THREE.Vector3; rotation?: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Main structure */}
            <mesh position={[0, 2, 0]}>
                <boxGeometry args={[8, 4, 3]} />
                <meshStandardMaterial color="#4a5568" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 4.5, 0]}>
                <boxGeometry args={[9, 0.5, 4]} />
                <meshStandardMaterial color="#1a202c" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Seating rows */}
            {[0, 1, 2].map(row => (
                <mesh key={row} position={[0, 0.5 + row * 1.2, -0.5 + row * 0.3]}>
                    <boxGeometry args={[7.5, 0.3, 0.6]} />
                    <meshStandardMaterial color="#2d3748" />
                </mesh>
            ))}
            {/* People (colored blocks) */}
            {Array.from({ length: 20 }).map((_, i) => (
                <mesh key={i} position={[(i % 10) - 4.5, 1 + Math.floor(i / 10) * 1.2, -0.3 + Math.floor(i / 10) * 0.3]}>
                    <boxGeometry args={[0.3, 0.5, 0.2]} />
                    <meshStandardMaterial color={['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ffffff'][i % 5]} />
                </mesh>
            ))}
        </group>
    );
}

// Pit Lane Building
function PitBuilding({ position, rotation = 0 }: { position: THREE.Vector3; rotation?: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Main pit building */}
            <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[12, 3, 4]} />
                <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Garage doors */}
            {[-4, -2, 0, 2, 4].map((x, i) => (
                <mesh key={i} position={[x, 0.75, 2.01]}>
                    <boxGeometry args={[1.5, 1.5, 0.05]} />
                    <meshStandardMaterial color="#1f2937" />
                </mesh>
            ))}
            {/* Team logos (colored strips) */}
            {[-4, -2, 0, 2, 4].map((x, i) => (
                <mesh key={`logo-${i}`} position={[x, 2.5, 2.01]}>
                    <boxGeometry args={[1.8, 0.4, 0.02]} />
                    <meshStandardMaterial color={['#dc2626', '#3b82f6', '#22c55e', '#f97316', '#06b6d4'][i]} />
                </mesh>
            ))}
            {/* Control tower */}
            <mesh position={[0, 4.5, 0]}>
                <boxGeometry args={[4, 3, 3]} />
                <meshStandardMaterial color="#1e3a5f" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Windows */}
            <mesh position={[0, 4.5, 1.51]}>
                <boxGeometry args={[3.5, 2, 0.02]} />
                <meshStandardMaterial color="#60a5fa" metalness={0.8} roughness={0.1} />
            </mesh>
        </group>
    );
}

// Kerbs - Red/white stripes on corner apexes
function TrackKerbs({ points }: { points: THREE.Vector3[] }) {
    const kerbs = useMemo(() => {
        const kerbPositions: { pos: THREE.Vector3; rotation: number; isLeft: boolean }[] = [];
        const kerbOffset = 3.2; // Just outside track edge

        // Detect corners by checking curvature
        for (let i = 0; i < points.length; i++) {
            const prev = points[(i - 3 + points.length) % points.length];
            const curr = points[i];
            const next = points[(i + 3) % points.length];

            const dir1 = new THREE.Vector3().subVectors(curr, prev).normalize();
            const dir2 = new THREE.Vector3().subVectors(next, curr).normalize();
            const curvature = 1 - dir1.dot(dir2); // Higher = sharper corner

            if (curvature > 0.02 && i % 3 === 0) { // Only on corners
                const dir = new THREE.Vector3().subVectors(next, prev).normalize();
                const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);
                const rotation = Math.atan2(dir.z, dir.x);

                // Determine which side the corner is on
                const cross = dir1.x * dir2.z - dir1.z * dir2.x;
                const isLeft = cross > 0;

                const offset = isLeft ? kerbOffset : -kerbOffset;
                const kerbPos = curr.clone().add(perpendicular.clone().multiplyScalar(offset));
                kerbPos.y = 0.02;
                kerbPositions.push({ pos: kerbPos, rotation, isLeft });
            }
        }
        return kerbPositions;
    }, [points]);

    return (
        <>
            {kerbs.map((kerb, i) => (
                <group key={i} position={kerb.pos} rotation={[0, kerb.rotation, 0]}>
                    {/* Kerb stripes */}
                    {[0, 1, 2, 3].map(stripe => (
                        <mesh key={stripe} position={[stripe * 0.4 - 0.6, 0, 0]}>
                            <boxGeometry args={[0.35, 0.05, 0.5]} />
                            <meshStandardMaterial color={stripe % 2 === 0 ? "#dc2626" : "#ffffff"} />
                        </mesh>
                    ))}
                </group>
            ))}
        </>
    );
}

// Run-off Areas - Gravel/paved zones outside track
function RunOffAreas({ points }: { points: THREE.Vector3[] }) {
    const runoffGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const indices: number[] = [];
        const innerOffset = 3.5;
        const outerOffset = 8.0;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const next = points[(i + 1) % points.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perp = new THREE.Vector3(-dir.z, 0, dir.x);

            // Inner edge (outside track barriers)
            const inner = p.clone().add(perp.clone().multiplyScalar(innerOffset));
            // Outer edge (run-off boundary)
            const outer = p.clone().add(perp.clone().multiplyScalar(outerOffset));

            vertices.push(inner.x, -0.05, inner.z);
            vertices.push(outer.x, -0.05, outer.z);
        }

        for (let i = 0; i < points.length; i++) {
            const next = (i + 1) % points.length;
            indices.push(i * 2, next * 2, i * 2 + 1);
            indices.push(i * 2 + 1, next * 2, next * 2 + 1);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }, [points]);

    return (
        <mesh geometry={runoffGeometry}>
            <meshStandardMaterial color="#8b7355" roughness={0.95} /> {/* Gravel color */}
        </mesh>
    );
}

// Start/Finish Gantry - Overhead structure
function StartFinishGantry({ position, rotation = 0 }: { position: THREE.Vector3; rotation?: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Left pillar */}
            <mesh position={[-6, 4, 0]}>
                <boxGeometry args={[0.5, 8, 0.5]} />
                <meshStandardMaterial color="#2d3748" metalness={0.6} />
            </mesh>
            {/* Right pillar */}
            <mesh position={[6, 4, 0]}>
                <boxGeometry args={[0.5, 8, 0.5]} />
                <meshStandardMaterial color="#2d3748" metalness={0.6} />
            </mesh>
            {/* Main beam */}
            <mesh position={[0, 8, 0]}>
                <boxGeometry args={[13, 1, 2]} />
                <meshStandardMaterial color="#1a202c" metalness={0.5} />
            </mesh>
            {/* Lights */}
            {[-4, -2, 0, 2, 4].map((x, i) => (
                <mesh key={i} position={[x, 7.3, 0]}>
                    <boxGeometry args={[0.8, 0.4, 0.8]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
                </mesh>
            ))}
            {/* Checkered flag banner */}
            <mesh position={[0, 8.8, 0]}>
                <boxGeometry args={[8, 1.2, 0.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* F1 Logo placeholder */}
            <mesh position={[0, 8.8, 0.06]}>
                <boxGeometry args={[2, 0.8, 0.02]} />
                <meshStandardMaterial color="#e10600" />
            </mesh>
        </group>
    );
}

// Advertising Boards along straights
function AdvertisingBoards({ points }: { points: THREE.Vector3[] }) {
    const boards = useMemo(() => {
        const boardPositions: { pos: THREE.Vector3; rotation: number }[] = [];
        const boardOffset = 5.5;
        const spacing = 25;

        for (let i = 0; i < points.length; i += spacing) {
            const p = points[i];
            const next = points[(i + 3) % points.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);
            const rotation = Math.atan2(dir.z, dir.x) + Math.PI / 2;

            const boardPos = p.clone().add(perpendicular.clone().multiplyScalar(boardOffset));
            boardPos.y = 0;
            boardPositions.push({ pos: boardPos, rotation });
        }
        return boardPositions;
    }, [points]);

    const brandColors = ['#e10600', '#00d2be', '#3671c6', '#f91536', '#ff8000', '#27f4d2', '#64c4ff', '#b6babd'];

    return (
        <>
            {boards.map((board, i) => (
                <group key={i} position={board.pos} rotation={[0, board.rotation, 0]}>
                    {/* Board frame */}
                    <mesh position={[0, 0.8, 0]}>
                        <boxGeometry args={[4, 1.5, 0.1]} />
                        <meshStandardMaterial color={brandColors[i % brandColors.length]} />
                    </mesh>
                    {/* Support posts */}
                    <mesh position={[-1.8, 0.4, 0]}>
                        <boxGeometry args={[0.1, 0.8, 0.1]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>
                    <mesh position={[1.8, 0.4, 0]}>
                        <boxGeometry args={[0.1, 0.8, 0.1]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>
                </group>
            ))}
        </>
    );
}

// Tire Walls on sharp corners
function TireWalls({ points }: { points: THREE.Vector3[] }) {
    const tireWalls = useMemo(() => {
        const positions: { pos: THREE.Vector3; rotation: number }[] = [];
        const offset = 5.0;

        for (let i = 0; i < points.length; i++) {
            const prev = points[(i - 5 + points.length) % points.length];
            const curr = points[i];
            const next = points[(i + 5) % points.length];

            const dir1 = new THREE.Vector3().subVectors(curr, prev).normalize();
            const dir2 = new THREE.Vector3().subVectors(next, curr).normalize();
            const curvature = 1 - dir1.dot(dir2);

            // Only on very sharp corners
            if (curvature > 0.08 && i % 10 === 0) {
                const dir = dir2;
                const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);
                const rotation = Math.atan2(dir.z, dir.x);

                const tirePos = curr.clone().add(perpendicular.clone().multiplyScalar(offset));
                tirePos.y = 0.3;
                positions.push({ pos: tirePos, rotation });
            }
        }
        return positions;
    }, [points]);

    return (
        <>
            {tireWalls.map((wall, i) => (
                <group key={i} position={wall.pos} rotation={[0, wall.rotation, 0]}>
                    {/* Stack of tires */}
                    {[0, 1, 2].map(row => (
                        <group key={row}>
                            {[-0.6, 0, 0.6].map((x, col) => (
                                <mesh key={col} position={[x, row * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
                                    <torusGeometry args={[0.25, 0.12, 8, 12]} />
                                    <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                                </mesh>
                            ))}
                        </group>
                    ))}
                </group>
            ))}
        </>
    );
}

// Trees and vegetation around the track
function TrackVegetation({ points }: { points: THREE.Vector3[] }) {
    const trees = useMemo(() => {
        const treePositions: THREE.Vector3[] = [];
        const treeOffset = 15; // Far from track
        const spacing = 20;

        for (let i = 0; i < points.length; i += spacing) {
            const p = points[i];
            const next = points[(i + 1) % points.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);

            // Both sides with some randomization
            const offsetVariation = (Math.random() - 0.5) * 4;
            const leftTree = p.clone().add(perpendicular.clone().multiplyScalar(treeOffset + offsetVariation));
            leftTree.y = 0;
            treePositions.push(leftTree);

            if (i % (spacing * 2) === 0) {
                const rightPerp = new THREE.Vector3(dir.z, 0, -dir.x);
                const rightTree = p.clone().add(rightPerp.clone().multiplyScalar(treeOffset + offsetVariation));
                rightTree.y = 0;
                treePositions.push(rightTree);
            }
        }
        return treePositions;
    }, [points]);

    return (
        <>
            {trees.map((pos, i) => (
                <group key={i} position={pos}>
                    {/* Tree trunk */}
                    <mesh position={[0, 1.5, 0]}>
                        <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
                        <meshStandardMaterial color="#5c4033" roughness={0.9} />
                    </mesh>
                    {/* Tree foliage (cone shape) */}
                    <mesh position={[0, 4, 0]}>
                        <coneGeometry args={[1.5, 3, 8]} />
                        <meshStandardMaterial color="#228b22" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 5.5, 0]}>
                        <coneGeometry args={[1.0, 2, 8]} />
                        <meshStandardMaterial color="#2e8b2e" roughness={0.8} />
                    </mesh>
                </group>
            ))}
        </>
    );
}

// Track Surroundings - places all trackside elements
function TrackSurroundings({ trackPoints }: { trackPoints: THREE.Vector3[] }) {
    const { grandstands, pitBuilding, startFinish } = useMemo(() => {
        if (trackPoints.length < 10) return { grandstands: [], pitBuilding: null, startFinish: null };

        // Find good positions for grandstands (on straights)
        const grandstandPositions: { pos: THREE.Vector3; rotation: number }[] = [];

        // Place grandstands at intervals
        const gsSpacing = Math.floor(trackPoints.length / 4);
        for (let i = 0; i < 3; i++) {
            const idx = (i * gsSpacing + Math.floor(gsSpacing / 2)) % trackPoints.length;
            const p = trackPoints[idx];
            const next = trackPoints[(idx + 5) % trackPoints.length];
            const dir = new THREE.Vector3().subVectors(next, p).normalize();
            const perpendicular = new THREE.Vector3(-dir.z, 0, dir.x);
            const rotation = Math.atan2(dir.z, dir.x) + Math.PI / 2;

            const gsPos = p.clone().add(perpendicular.clone().multiplyScalar(14));
            gsPos.y = 0;
            grandstandPositions.push({ pos: gsPos, rotation });
        }

        // Pit building position (near start of track)
        const pitIdx = 0;
        const pitP = trackPoints[pitIdx];
        const pitNext = trackPoints[(pitIdx + 5) % trackPoints.length];
        const pitDir = new THREE.Vector3().subVectors(pitNext, pitP).normalize();
        const pitPerp = new THREE.Vector3(pitDir.z, 0, -pitDir.x);
        const pitRotation = Math.atan2(pitDir.z, pitDir.x);
        const pitPos = pitP.clone().add(pitPerp.clone().multiplyScalar(12));
        pitPos.y = 0;

        // Start/Finish gantry position
        const sfP = trackPoints[Math.floor(trackPoints.length * 0.02)];
        const sfNext = trackPoints[Math.floor(trackPoints.length * 0.02) + 3];
        const sfDir = new THREE.Vector3().subVectors(sfNext, sfP).normalize();
        const sfRotation = Math.atan2(sfDir.z, sfDir.x);
        const sfPos = sfP.clone();
        sfPos.y = 0;

        return {
            grandstands: grandstandPositions,
            pitBuilding: { pos: pitPos, rotation: pitRotation },
            startFinish: { pos: sfPos, rotation: sfRotation }
        };
    }, [trackPoints]);

    return null; // Removed all trackside elements
}

// F1 Car GLTF Model Component - loads real 3D model
function F1CarModel({
    color,
    isSelected
}: {
    color: string;
    isSelected: boolean;
}) {
    const { scene } = useGLTF('/models/f1-car.glb');

    // Clone the scene for each instance and apply detailed team colors
    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        const teamColor = new THREE.Color(color);

        // Create color variations for livery detail
        const darkerTeamColor = teamColor.clone().multiplyScalar(0.6);
        const lighterTeamColor = teamColor.clone().lerp(new THREE.Color('#ffffff'), 0.2);

        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    const mat = (mesh.material as THREE.MeshStandardMaterial).clone();

                    const origColor = mat.color;
                    const brightness = origColor ? (origColor.r + origColor.g + origColor.b) / 3 : 0;

                    // Get mesh position to vary colors
                    const meshName = mesh.name.toLowerCase();
                    const bounds = new THREE.Box3().setFromObject(mesh);
                    const meshCenter = new THREE.Vector3();
                    bounds.getCenter(meshCenter);

                    if (brightness > 0.15) {
                        // Apply team color with variation based on position/name
                        if (meshName.includes('wing') || meshName.includes('fin')) {
                            // Wings - slightly darker
                            mat.color = darkerTeamColor.clone();
                        } else if (meshName.includes('halo') || meshName.includes('cockpit')) {
                            // Cockpit area - dark carbon
                            mat.color = new THREE.Color('#1a1a1a');
                            mat.metalness = 0.8;
                            mat.roughness = 0.2;
                        } else if (meshCenter.y > 0.5) {
                            // Top surfaces - slightly darker
                            mat.color = darkerTeamColor.clone();
                        } else {
                            // Main body - team color
                            mat.color = teamColor.clone();
                        }

                        mat.emissive = new THREE.Color(isSelected ? color : '#000000');
                        mat.emissiveIntensity = isSelected ? 0.25 : 0;
                        mat.metalness = 0.5;
                        mat.roughness = 0.3;
                    } else {
                        // Wheels, rubber, carbon parts - keep dark
                        mat.color = new THREE.Color('#111111');
                        mat.metalness = 0.2;
                        mat.roughness = 0.8;
                    }

                    mesh.material = mat;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                }
            }
        });
        return clone;
    }, [scene, color, isSelected]);

    return (
        <primitive
            object={clonedScene}
            scale={0.06}
            rotation={[0, Math.PI / 2, 0]}
            position={[0, 0, 0]}
        />
    );
}

// Simple fallback car while GLTF loads
function SimpleCar({ color, isSelected }: { color: string; isSelected: boolean }) {
    return (
        <mesh castShadow position={[0, 0.03, 0]}>
            <boxGeometry args={[0.4, 0.04, 0.15]} />
            <meshStandardMaterial
                color={color}
                emissive={isSelected ? color : '#000000'}
                emissiveIntensity={isSelected ? 0.4 : 0}
                metalness={0.6}
                roughness={0.2}
            />
        </mesh>
    );
}

// Car Component - loads real GLTF model with fallback
function Car({
    position,
    color,
    driverCode,
    isSelected,
    heading,
    onClick
}: {
    position: THREE.Vector3;
    color: string;
    driverCode: string;
    isSelected: boolean;
    heading: number;
    onClick: () => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const smoothedHeading = useRef(heading);

    // Smooth heading for car rotation - very gradual
    useFrame((_, delta) => {
        let diff = heading - smoothedHeading.current;

        // Normalize to [-PI, PI] to handle wrap-around
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        // Very strong smoothing to prevent spinning
        smoothedHeading.current += diff * Math.min(1, delta * 3);

        if (groupRef.current) {
            groupRef.current.rotation.y = smoothedHeading.current;
        }
    });

    const scale = isSelected ? 1.1 : 0.9;

    return (
        <group ref={groupRef} position={position} onClick={onClick} scale={scale}>
            {/* Load real F1 model with suspense fallback */}
            <Suspense fallback={<SimpleCar color={color} isSelected={isSelected} />}>
                <F1CarModel color={color} isSelected={isSelected} />
            </Suspense>

            {/* Driver code label */}
            <Text
                position={[0, 0.35, 0]}
                fontSize={0.15}
                color={isSelected ? '#ffffff' : '#cccccc'}
                anchorX="center"
                anchorY="middle"
            >
                {driverCode}
            </Text>

            {/* Selection ring */}
            {isSelected && (
                <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.35, 0.4, 32]} />
                    <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
}

// Preload the GLTF model
useGLTF.preload('/models/f1-car.glb');

// Chase Camera that follows the selected driver
function ChaseCamera({
    targetPosition,
    heading,
    enabled
}: {
    targetPosition: THREE.Vector3;
    heading: number;
    enabled: boolean;
}) {
    const { camera } = useThree();
    const smoothedHeading = useRef(heading);

    useFrame((_, delta) => {
        if (!enabled) return;

        // Smooth the heading to prevent jerky rotation
        const headingDiff = heading - smoothedHeading.current;
        // Handle wrap-around
        const wrappedDiff = ((headingDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
        smoothedHeading.current += wrappedDiff * Math.min(1, delta * 5);

        // Position camera behind and above the car - further back for bigger models
        const cameraDistance = 4.0;
        const cameraHeight = 1.5;

        const offsetX = -Math.cos(smoothedHeading.current) * cameraDistance;
        const offsetZ = -Math.sin(smoothedHeading.current) * cameraDistance;

        const targetCamPos = new THREE.Vector3(
            targetPosition.x + offsetX,
            targetPosition.y + cameraHeight,
            targetPosition.z + offsetZ
        );

        // Very smooth camera movement
        camera.position.lerp(targetCamPos, Math.min(1, delta * 8));

        // Look at slightly ahead of the car
        const lookAtPos = new THREE.Vector3(
            targetPosition.x + Math.cos(smoothedHeading.current) * 1.5,
            targetPosition.y + 0.15,
            targetPosition.z + Math.sin(smoothedHeading.current) * 1.5
        );
        camera.lookAt(lookAtPos);
    });

    return null;
}

// Main 3D Scene
function RacingScene({
    data,
    currentFrame,
    bounds,
    selectedDriver,
    onDriverClick,
    cameraMode
}: RacingViewProps & { cameraMode: 'overview' | 'chase' }) {
    const trackPoints = useMemo(() => {
        if (!data.track_layout) return [];
        return createTrackPoints(data.track_layout, bounds);
    }, [data.track_layout, bounds]);

    // Store previous positions for velocity-based heading
    const previousPositions = useRef<Map<string, THREE.Vector3>>(new Map());
    const smoothedHeadings = useRef<Map<string, number>>(new Map());

    // Calculate positions and headings for all cars
    const cars = useMemo(() => {
        const scale = 0.02;
        return Object.entries(currentFrame.drivers).map(([code, telemetry]) => {
            const tel = telemetry as DriverData;
            const pos = new THREE.Vector3(
                (tel.x - bounds.minX - bounds.width / 2) * scale,
                0.1,
                (tel.y - bounds.minY - bounds.height / 2) * scale
            );

            // Get previous position
            const prevPos = previousPositions.current.get(code);
            const prevHeading = smoothedHeadings.current.get(code) || 0;

            let heading = prevHeading;

            if (prevPos) {
                // Calculate heading from actual movement direction
                const dx = pos.x - prevPos.x;
                const dz = pos.z - prevPos.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                // Only update heading if car moved significantly
                if (distance > 0.001) {
                    const targetHeading = Math.atan2(dz, dx);

                    // Smooth heading with wrap-around handling
                    let diff = targetHeading - prevHeading;

                    // Normalize difference to [-PI, PI]
                    while (diff > Math.PI) diff -= 2 * Math.PI;
                    while (diff < -Math.PI) diff += 2 * Math.PI;

                    // Apply very strong smoothing (lower = smoother)
                    heading = prevHeading + diff * 0.15;
                }
            } else {
                // First frame - use track direction as initial heading
                if (trackPoints.length > 0) {
                    let closestIdx = 0;
                    let minDist = Infinity;
                    trackPoints.forEach((p, i) => {
                        const d = pos.distanceTo(new THREE.Vector3(p.x, pos.y, p.z));
                        if (d < minDist) {
                            minDist = d;
                            closestIdx = i;
                        }
                    });
                    const nextIdx = (closestIdx + 10) % trackPoints.length;
                    const curr = trackPoints[closestIdx];
                    const next = trackPoints[nextIdx];
                    heading = Math.atan2(next.z - curr.z, next.x - curr.x);
                }
            }

            // Store current position and heading for next frame
            previousPositions.current.set(code, pos.clone());
            smoothedHeadings.current.set(code, heading);

            const color = data.driver_colors[code]
                ? `rgb(${data.driver_colors[code].join(',')})`
                : '#ffffff';

            return { code, pos, heading, color, isSelected: selectedDriver === code };
        });
    }, [currentFrame.drivers, bounds, selectedDriver, data.driver_colors, data.track_layout, trackPoints]);

    const selectedCar = cars.find(c => c.isSelected);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

            {/* Sky and environment */}
            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#1a472a" roughness={0.9} />
            </mesh>

            {/* Track */}
            {trackPoints.length > 0 && (
                <>
                    <TrackRoad points={trackPoints} />
                    <TrackEdges points={trackPoints} />
                    <CenterDivider points={trackPoints} />
                    <TrackSurroundings trackPoints={trackPoints} />
                </>
            )}

            {/* Cars */}
            {cars.map(car => (
                <Car
                    key={car.code}
                    position={car.pos}
                    color={car.color}
                    driverCode={car.code}
                    isSelected={car.isSelected}
                    heading={car.heading}
                    onClick={() => onDriverClick(car.code)}
                />
            ))}

            {/* Camera controls */}
            {cameraMode === 'overview' ? (
                <>
                    <PerspectiveCamera makeDefault position={[0, 30, 30]} fov={60} />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        maxPolarAngle={Math.PI / 2.1}
                    />
                </>
            ) : selectedCar ? (
                <ChaseCamera
                    targetPosition={selectedCar.pos}
                    heading={selectedCar.heading}
                    enabled={true}
                />
            ) : (
                <>
                    <PerspectiveCamera makeDefault position={[0, 30, 30]} fov={60} />
                    <OrbitControls />
                </>
            )}
        </>
    );
}

// Main exported component
export function ThreeDRacingView({
    data,
    currentFrame,
    bounds,
    selectedDriver,
    onDriverClick
}: RacingViewProps) {
    const [cameraMode, setCameraMode] = React.useState<'overview' | 'chase'>('overview');

    return (
        <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            <Canvas shadows>
                <RacingScene
                    data={data}
                    currentFrame={currentFrame}
                    bounds={bounds}
                    selectedDriver={selectedDriver}
                    onDriverClick={onDriverClick}
                    cameraMode={cameraMode}
                />
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                <h3 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-600 rounded-full" />
                    {cameraMode === 'chase' ? '3D Chase Cam' : '3D Racing View'}
                </h3>
                <p className="text-slate-400 text-xs font-mono bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">
                    Lap {currentFrame.lap}
                </p>
            </div>

            {/* Selected Driver Info */}
            {selectedDriver && currentFrame.drivers[selectedDriver] && (
                <div className="absolute top-6 right-6">
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
                                    <div className="text-white font-bold text-base leading-none">
                                        POS {currentFrame.drivers[selectedDriver].position}
                                    </div>
                                    <div className="text-slate-500 text-[10px] uppercase font-bold mt-1">
                                        Active Highlight
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-2 rounded-lg">
                                <div className="text-slate-500 text-[9px] uppercase font-bold mb-1">Speed</div>
                                <div className="text-white font-mono text-lg">
                                    {Math.round(currentFrame.drivers[selectedDriver].speed)}
                                    <span className="text-[10px] text-slate-400"> KM/H</span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-2 rounded-lg">
                                <div className="text-slate-500 text-[9px] uppercase font-bold mb-1">RPM</div>
                                <div className="text-white font-mono text-lg">
                                    {currentFrame.drivers[selectedDriver].rpm}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Controls */}
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

            {/* Instructions */}
            <div className="absolute bottom-6 left-6 pointer-events-none">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
                    {cameraMode === 'chase' ? 'Camera follows driver' : 'Drag to rotate • Scroll to zoom • Click cars to select'}
                </p>
            </div>
        </div>
    );
}
