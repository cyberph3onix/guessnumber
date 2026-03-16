'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface GameHUDProps {
    round: number;
    currentAttempt: number;
    maxAttempts: number;
    status: 'idle' | 'playing' | 'won' | 'lost';
}

export default function GameHUD({
    round,
    currentAttempt,
    maxAttempts,
    status,
}: GameHUDProps) {
    const scoreRef = useRef<HTMLSpanElement>(null);
    const attemptRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (scoreRef.current) {
            gsap.to(scoreRef.current, {
                textContent: round,
                duration: 0.8,
                snap: { textContent: 1 },
                ease: 'power2.out',
            });
        }
    }, [round]);

    useEffect(() => {
        if (attemptRef.current) {
            gsap.to(attemptRef.current, {
                textContent: currentAttempt,
                duration: 0.5,
                snap: { textContent: 1 },
                ease: 'power2.out',
            });
        }
    }, [currentAttempt]);

    const statusConfig = {
        idle: { label: 'Ready', color: 'text-white/40', dot: 'bg-white/30' },
        playing: { label: 'In Progress', color: 'text-glow-cyan', dot: 'bg-glow-cyan' },
        won: { label: 'Victory!', color: 'text-green-400', dot: 'bg-green-400' },
        lost: { label: 'Defeated', color: 'text-red-400', dot: 'bg-red-400' },
    };

    const s = statusConfig[status];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between w-full max-w-md mx-auto mb-8"
        >
            {/* Round */}
            <div className="text-center">
                <p className="text-[10px] font-light tracking-[0.3em] text-white/25 uppercase mb-1">
                    Round
                </p>
                <span
                    ref={scoreRef}
                    className="text-2xl font-light text-white/80"
                >
                    {round}
                </span>
            </div>

            {/* Status */}
            <div className="text-center">
                <div className="flex items-center gap-2">
                    <motion.div
                        className={`w-2 h-2 rounded-full ${s.dot}`}
                        animate={
                            status === 'playing'
                                ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }
                                : {}
                        }
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className={`text-sm font-medium tracking-wider ${s.color}`}>
                        {s.label}
                    </span>
                </div>
            </div>

            {/* Attempts */}
            <div className="text-center">
                <p className="text-[10px] font-light tracking-[0.3em] text-white/25 uppercase mb-1">
                    Attempts
                </p>
                <div className="text-2xl font-light text-white/80">
                    <span ref={attemptRef}>{currentAttempt}</span>
                    <span className="text-white/20 mx-1">/</span>
                    <span className="text-white/40">{maxAttempts}</span>
                </div>
            </div>
        </motion.div>
    );
}
