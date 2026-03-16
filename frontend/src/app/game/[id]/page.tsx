'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { GameSnapshot, getGame } from '@/lib/api';

export default function GameDetailPage() {
    const params = useParams();
    const gameId = params.id as string;
    const [gameData, setGameData] = useState<GameSnapshot | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadGame = async () => {
            setLoading(true);
            try {
                const snapshot = await getGame(gameId);
                if (mounted) {
                    setGameData(snapshot);
                }
            } catch {
                if (mounted) {
                    setGameData(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        if (gameId) {
            loadGame();
        }

        return () => {
            mounted = false;
        };
    }, [gameId]);

    return (
        <div className="min-h-screen px-4 py-16 max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <p className="text-xs text-white/20 tracking-[0.2em] uppercase mb-2">
                    Game Detail
                </p>
                <h1 className="text-3xl font-light tracking-wider text-white/70">
                    Game #{gameId?.slice(0, 8)}
                </h1>
            </motion.div>

            {loading && (
                <div className="text-center text-sm text-white/25 tracking-wider mb-6">
                    Loading game detail...
                </div>
            )}

            {!loading && !gameData && (
                <GlassCard className="p-6 mb-6">
                    <p className="text-sm text-white/35 tracking-wider">
                        Game not found or API unavailable.
                    </p>
                </GlassCard>
            )}

            {gameData && (
                <>

                    {/* Game Info */}
                    <GlassCard className="p-6 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Status', value: gameData.status.toUpperCase() },
                                { label: 'Hash', value: gameData.secret_number_hash.slice(0, 10) + '...' },
                                {
                                    label: 'Attempts',
                                    value: `${gameData.guess_count}/${gameData.max_attempts}`,
                                },
                                {
                                    label: 'Player',
                                    value: `${gameData.player_wallet.slice(0, 8)}...${gameData.player_wallet.slice(-4)}`,
                                },
                            ].map((item) => (
                                <div key={item.label}>
                                    <p className="text-[10px] text-white/20 tracking-[0.25em] uppercase mb-1">
                                        {item.label}
                                    </p>
                                    <p
                                        className={`text-lg font-light ${item.label === 'Status'
                                            ? gameData.status === 'won'
                                                ? 'text-glow-cyan'
                                                : gameData.status === 'lost'
                                                    ? 'text-red-400'
                                                    : 'text-white/50'
                                            : 'text-white/60'
                                            }`}
                                    >
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Guess Timeline */}
                    <GlassCard className="p-6">
                        <h3 className="text-sm text-white/30 tracking-[0.2em] uppercase mb-6">
                            Guess Timeline
                        </h3>
                        <div className="space-y-4">
                            {gameData.guesses.map((guess, i) => (
                                <motion.div
                                    key={`${guess.timestamp}-${i}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-4"
                                >
                                    {/* Timeline dot */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-3 h-3 rounded-full ${guess.hint === 'correct'
                                                ? 'bg-glow-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                                : 'bg-white/20'
                                                }`}
                                        />
                                        {i < gameData.guesses.length - 1 && (
                                            <div className="w-px h-8 bg-white/5" />
                                        )}
                                    </div>

                                    {/* Guess info */}
                                    <div className="flex items-center justify-between flex-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-white/20 font-mono">#{i + 1}</span>
                                            <span className="text-xl font-light text-white/70">
                                                {guess.number}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-xs tracking-wider px-3 py-1 rounded-full ${guess.hint === 'correct'
                                                ? 'bg-glow-cyan/15 text-glow-cyan'
                                                : guess.hint === 'higher'
                                                    ? 'bg-orange-400/15 text-orange-400'
                                                    : guess.hint === 'lower'
                                                        ? 'bg-blue-400/15 text-blue-400'
                                                        : 'bg-red-400/15 text-red-300'
                                                }`}
                                        >
                                            {guess.hint === 'correct'
                                                ? '✓ CORRECT'
                                                : guess.hint === 'higher'
                                                    ? '↑ HIGHER'
                                                    : guess.hint === 'lower'
                                                        ? '↓ LOWER'
                                                        : '✗ GAME OVER'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {gameData.guesses.length === 0 && (
                                <p className="text-sm text-white/20 tracking-wider">
                                    No guesses submitted yet.
                                </p>
                            )}
                        </div>
                    </GlassCard>

                    {/* On-chain verification */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-center"
                    >
                        <p className="text-xs text-white/15 tracking-wider">
                            Game hash committed: {gameData.secret_number_hash}
                        </p>
                    </motion.div>
                </>
            )}
        </div>
    );
}
