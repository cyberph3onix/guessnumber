'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NumberInputPanelProps {
    onSubmit: (num: number) => void;
    disabled?: boolean;
    lastHint?: 'higher' | 'lower' | 'correct' | 'gameover' | 'none' | null;
    isCorrect?: boolean;
    isWrong?: boolean;
    onTyping?: (intensity: number) => void;
}

export default function NumberInputPanel({
    onSubmit,
    disabled = false,
    lastHint,
    isCorrect = false,
    isWrong = false,
    onTyping,
}: NumberInputPanelProps) {
    const [value, setValue] = useState('');
    const [ripples, setRipples] = useState<{ id: number; x: number }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const rippleId = useRef(0);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            onTyping?.(0.9);
            if (e.key === 'Enter' && value.trim()) {
                const num = parseInt(value, 10);
                if (!isNaN(num) && num >= 1 && num <= 100) {
                    onSubmit(num);
                    setValue('');
                }
            }
            // Add ripple effect on keypress
            const newRipple = { id: rippleId.current++, x: Math.random() * 100 };
            setRipples((prev) => [...prev, newRipple]);
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
            }, 600);
        },
        [value, onSubmit, onTyping]
    );

    const handleSubmitClick = () => {
        if (value.trim()) {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 1 && num <= 100) {
                onTyping?.(1);
                onSubmit(num);
                setValue('');
            }
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Hint display */}
            <AnimatePresence mode="wait">
                {lastHint && lastHint !== 'none' && (
                    <motion.div
                        key={lastHint}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="text-center mb-6"
                    >
                        <span
                                className={`text-2xl font-medium tracking-wider ${lastHint === 'correct'
                                    ? 'text-glow-cyan'
                                    : lastHint === 'higher'
                                        ? 'text-orange-400'
                                        : lastHint === 'lower'
                                            ? 'text-blue-400'
                                            : 'text-red-400'
                                }`}
                        >
                            {lastHint === 'correct'
                                ? '🎉 Correct!'
                                : lastHint === 'higher'
                                    ? '⬆ Go Higher'
                                    : lastHint === 'lower'
                                        ? '⬇ Go Lower'
                                        : '💀 Game Over'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input container */}
            <motion.div
                className="relative"
                animate={
                    isWrong
                        ? {
                            x: [0, -8, 8, -6, 6, -3, 3, 0],
                        }
                        : isCorrect
                            ? {
                                boxShadow: [
                                    '0 0 0px rgba(34,211,238,0)',
                                    '0 0 60px rgba(34,211,238,0.6)',
                                    '0 0 0px rgba(34,211,238,0)',
                                ],
                            }
                            : {}
                }
                transition={{ duration: 0.5 }}
            >
                {/* Ripple effects */}
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        className="absolute top-1/2 rounded-full bg-glow-cyan/10 pointer-events-none"
                        style={{ left: `${ripple.x}%` }}
                        initial={{ width: 10, height: 10, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ width: 100, height: 100, opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                ))}

                <div className="flex gap-3 items-center">
                    <motion.input
                        ref={inputRef}
                        type="number"
                        min={1}
                        max={100}
                        value={value}
                        onChange={(e) => {
                            const next = e.target.value;
                            if (next === '') {
                                setValue('');
                                onTyping?.(0.7);
                                return;
                            }

                            const numeric = Number(next);
                            if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 100) {
                                setValue(next);
                            }
                            onTyping?.(0.7);
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder="1 — 100"
                        className="glass-input text-center text-3xl font-light tracking-[0.15em] flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        whileFocus={{ scale: 1.02 }}
                    />

                    <motion.button
                        onClick={handleSubmitClick}
                        disabled={disabled || !value.trim()}
                        className="glass-button px-6 py-4 text-lg font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="relative z-10">⚡ Guess</span>
                    </motion.button>
                </div>
            </motion.div>

            <p className="text-center text-sm text-white/20 mt-4 tracking-wider">
                Enter a number between 1 and 100
            </p>
        </div>
    );
}
