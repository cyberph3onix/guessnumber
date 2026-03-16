'use client';

import { motion } from 'framer-motion';

export default function AuroraGlowLayer() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Cyan blob */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
                    left: '10%',
                    top: '15%',
                    filter: 'blur(80px)',
                }}
                animate={{
                    x: [0, 50, -30, 0],
                    y: [0, -40, 20, 0],
                    scale: [1, 1.1, 0.95, 1],
                    opacity: [0.5, 0.7, 0.4, 0.5],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Pink blob */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)',
                    right: '10%',
                    bottom: '20%',
                    filter: 'blur(80px)',
                }}
                animate={{
                    x: [0, -40, 30, 0],
                    y: [0, 30, -50, 0],
                    scale: [1, 0.95, 1.08, 1],
                    opacity: [0.4, 0.6, 0.35, 0.4],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Violet blob */}
            <motion.div
                className="absolute w-[700px] h-[700px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                    left: '40%',
                    top: '40%',
                    filter: 'blur(100px)',
                }}
                animate={{
                    x: [0, 30, -20, 0],
                    y: [0, -20, 40, 0],
                    scale: [1, 1.05, 0.98, 1],
                    opacity: [0.3, 0.5, 0.25, 0.3],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
}
