'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ReactNode } from 'react';

function RefractionSphere({ intensity = 0.5 }: { intensity?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const material = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                transmission: 0.92,
                thickness: 2.8,
                roughness: 0.08,
                ior: 1.44,
                color: new THREE.Color('#88ccff'),
                transparent: true,
                opacity: 0.1,
                envMapIntensity: 0.7,
            }),
        []
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
            const scale = 1 + intensity * 0.08;
            meshRef.current.scale.setScalar(scale);
        }

        material.opacity = 0.1 + intensity * 0.14;
        material.thickness = 2.8 + intensity * 1.2;
        material.roughness = Math.max(0.03, 0.1 - intensity * 0.04);
        material.ior = 1.44 + intensity * 0.08;
    });

    return (
        <mesh ref={meshRef} material={material}>
            <sphereGeometry args={[2, 64, 64]} />
        </mesh>
    );
}

function BackgroundParticles() {
    const pointsRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(300 * 3);
        for (let i = 0; i < 300; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial size={0.05} color="#22d3ee" transparent opacity={0.5} />
        </points>
    );
}

interface RefractionGlassPanelProps {
    className?: string;
    intensity?: number;
    children?: ReactNode;
}

export default function RefractionGlassPanel({
    className = '',
    intensity = 0.5,
    children,
}: RefractionGlassPanelProps) {
    return (
        <div className={`relative overflow-hidden rounded-2xl glass-panel ${className}`}>
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    dpr={[1, 1.5]}
                    gl={{ antialias: true, alpha: true }}
                >
                    <ambientLight intensity={0.3} />
                    <pointLight position={[5, 5, 5]} intensity={0.5} color="#22d3ee" />
                    <pointLight position={[-5, -3, 3]} intensity={0.3} color="#ec4899" />
                    <BackgroundParticles />
                    <RefractionSphere intensity={intensity} />
                </Canvas>
            </div>

            <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background:
                        'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.01) 100%)',
                }}
            />

            <div className="relative z-[2]">{children}</div>
        </div>
    );
}
