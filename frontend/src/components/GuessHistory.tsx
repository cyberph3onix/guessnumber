'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Guess } from '@/stores/gameStore';

interface GuessHistoryProps {
    guesses: Guess[];
}

export default function GuessHistory({ guesses }: GuessHistoryProps) {
    return (
        <div className="w-full max-w-md mx-auto mt-6">
            <h3 className="text-sm font-light tracking-[0.2em] text-white/30 uppercase mb-4">
                Guess History
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                    {guesses
                        .slice()
                        .reverse()
                        .map((guess, index) => (
                            <motion.div
                                key={`${guess.timestamp}-${guess.number}-${index}`}
                                layout
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="flex items-center justify-between px-4 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-white/20 text-xs font-mono w-6">
                                        #{guesses.length - index}
                                    </span>
                                    <span className="text-xl font-light tracking-wider text-white/80">
                                        {guess.number}
                                    </span>
                                </div>

                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`text-xs font-medium tracking-wider px-3 py-1 rounded-full ${guess.hint === 'correct'
                                            ? 'bg-glow-cyan/20 text-glow-cyan'
                                            : guess.hint === 'higher'
                                                ? 'bg-orange-400/20 text-orange-400'
                                                : guess.hint === 'lower'
                                                    ? 'bg-blue-400/20 text-blue-400'
                                                    : 'bg-red-400/20 text-red-400'
                                        }`}
                                >
                                    {guess.hint === 'correct'
                                        ? '✓ CORRECT'
                                        : guess.hint === 'higher'
                                            ? '↑ HIGHER'
                                            : guess.hint === 'lower'
                                                ? '↓ LOWER'
                                                : '✗ GAME OVER'}
                                </motion.span>
                            </motion.div>
                        ))}
                </AnimatePresence>

                {guesses.length === 0 && (
                    <div className="text-center py-8 text-white/15 text-sm tracking-wider">
                        No guesses yet — make your first move
                    </div>
                )}
            </div>
        </div>
    );
}
