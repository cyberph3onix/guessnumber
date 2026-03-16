'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const count = 800;
    const { viewport } = useThree();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 30;
            const y = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 20 - 5;
            const speed = Math.random() * 0.002 + 0.001;
            const size = Math.random() * 0.04 + 0.01;
            const phase = Math.random() * Math.PI * 2;
            temp.push({ x, y, z, speed, size, phase, ox: x, oy: y, oz: z });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const colors = useMemo(() => {
        const c = new Float32Array(count * 3);
        const palette = [
            new THREE.Color('#22d3ee'),
            new THREE.Color('#ec4899'),
            new THREE.Color('#8b5cf6'),
            new THREE.Color('#6366f1'),
            new THREE.Color('#14b8a6'),
        ];
        for (let i = 0; i < count; i++) {
            const color = palette[Math.floor(Math.random() * palette.length)];
            c[i * 3] = color.r;
            c[i * 3 + 1] = color.g;
            c[i * 3 + 2] = color.b;
        }
        return c;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;

        const pointer = state.pointer;
        mouseRef.current.x += (pointer.x * viewport.width * 0.3 - mouseRef.current.x) * 0.02;
        mouseRef.current.y += (pointer.y * viewport.height * 0.3 - mouseRef.current.y) * 0.02;

        for (let i = 0; i < count; i++) {
            const p = particles[i];
            const floatX = Math.sin(time * p.speed * 50 + p.phase) * 0.5;
            const floatY = Math.cos(time * p.speed * 40 + p.phase * 1.3) * 0.5;
            const floatZ = Math.sin(time * p.speed * 30 + p.phase * 0.7) * 0.3;

            const parallaxFactor = (p.oz + 15) / 35;
            dummy.position.set(
                p.ox + floatX + mouseRef.current.x * parallaxFactor * 0.15,
                p.oy + floatY + mouseRef.current.y * parallaxFactor * 0.15,
                p.oz + floatZ
            );
            dummy.scale.setScalar(p.size * (0.8 + Math.sin(time + p.phase) * 0.2));
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial transparent opacity={0.6} toneMapped={false} />
            <instancedBufferAttribute
                attach="geometry-attributes-color"
                args={[colors, 3]}
            />
        </instancedMesh>
    );
}

function GlowLights() {
    return (
        <>
            <pointLight position={[5, 5, 5]} intensity={0.5} color="#22d3ee" />
            <pointLight position={[-5, -5, 3]} intensity={0.3} color="#ec4899" />
            <pointLight position={[0, 0, -5]} intensity={0.2} color="#8b5cf6" />
            <ambientLight intensity={0.1} />
        </>
    );
}

export default function ParticleGalaxyBackground() {
    return (
        <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                dpr={[1, 1.5]}
                style={{ pointerEvents: 'auto' }}
                gl={{ antialias: false, alpha: true }}
            >
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 15, 35]} />
                <Particles />
                <GlowLights />
            </Canvas>
        </div>
    );
}
