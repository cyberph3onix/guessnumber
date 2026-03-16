'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import NumberInputPanel from '@/components/NumberInputPanel';
import GuessHistory from '@/components/GuessHistory';
import GameHUD from '@/components/GameHUD';
import RefractionGlassPanel from '@/components/RefractionGlassPanel';
import LottieState from '@/components/LottieState';
import { useGameStore } from '@/stores/gameStore';
import { useWalletStore } from '@/stores/walletStore';
import { startGame, submitGuess } from '@/lib/api';
import { useLeaderboardStore } from '@/stores/leaderboardStore';

export default function PlayPage() {
    const wallet = useWalletStore();
    const game = useGameStore();
    const refreshLeaderboard = useLeaderboardStore((s) => s.fetchLeaderboard);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isWrong, setIsWrong] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [refractionIntensity, setRefractionIntensity] = useState(0.3);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const pulseRefraction = useCallback((intensity: number) => {
        setRefractionIntensity(intensity);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => setRefractionIntensity(0.3), 450);
    }, []);

    const handleStartGame = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            let walletAddress = wallet.address;

            if (!wallet.connected) {
                await wallet.connect();
                // Read fresh store state after async connect to avoid stale closure data.
                walletAddress = useWalletStore.getState().address;
            }

            const snapshot = await startGame(walletAddress, 10);
            game.startGame(snapshot.game_id, snapshot.max_attempts);
            game.hydrateFromSnapshot(snapshot);
            pulseRefraction(0.85);
        } catch (err) {
            const message =
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to start game session. Make sure backend API is running.';
            setError(message);
        }
        setLoading(false);
    }, [wallet, game, pulseRefraction]);

    const handleGuess = useCallback(
        async (num: number) => {
            setIsWrong(false);
            setIsCorrect(false);
            pulseRefraction(0.95);

            try {
                if (!game.gameId) {
                    return;
                }
                const snapshot = await submitGuess(game.gameId, num);
                game.hydrateFromSnapshot(snapshot);

                if (snapshot.hint === 'correct') {
                    setIsCorrect(true);
                    refreshLeaderboard();
                } else if (snapshot.hint === 'gameover') {
                    refreshLeaderboard();
                } else {
                    setIsWrong(true);
                    setTimeout(() => setIsWrong(false), 500);
                }
            } catch {
                setError('Failed to submit guess. Please try again.');
            }
        },
        [game, pulseRefraction, refreshLeaderboard]
    );

    const playAgain = () => {
        game.resetGame();
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-xl">
                <AnimatePresence mode="wait">
                    {game.status === 'idle' ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center"
                        >
                            <GlassCard className="p-12 relative overflow-hidden">
                                {/* Refraction effect layer */}
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                                    style={{
                                        background: `radial-gradient(circle at 50% 50%, rgba(34,211,238,${refractionIntensity * 0.1
                                            }), transparent 70%)`,
                                    }}
                                />

                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <h2 className="text-4xl font-light tracking-wider mb-4 bg-gradient-to-r from-glow-cyan to-glow-violet bg-clip-text text-transparent">
                                        Ready to Play?
                                    </h2>
                                </motion.div>

                                <div className="flex items-center justify-center mb-4">
                                    <LottieState
                                        variant={wallet.connected ? 'loading' : 'wallet'}
                                        className="w-20 h-20"
                                    />
                                </div>

                                <p className="text-white/30 font-light mb-8 tracking-wider">
                                    Guess the secret number between 1 and 100.
                                    <br />
                                    Every guess is verified on the Stellar blockchain.
                                </p>

                                <motion.button
                                    onClick={handleStartGame}
                                    disabled={loading}
                                    className="glass-button px-12 py-4 text-lg tracking-[0.15em]"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 0 50px rgba(34,211,238,0.3)',
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(139,92,246,0.2))',
                                    }}
                                >
                                    {loading ? (
                                        <motion.span
                                            animate={{ opacity: [1, 0.4, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            Initializing...
                                        </motion.span>
                                    ) : (
                                        '⚡ Start Game'
                                    )}
                                </motion.button>

                                {!wallet.connected && (
                                    <p className="text-xs text-white/15 mt-4 tracking-wider">
                                        Wallet will be connected automatically
                                    </p>
                                )}

                                {error && (
                                    <p className="text-xs text-red-300/80 mt-4 tracking-wider">
                                        {error}
                                    </p>
                                )}
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <RefractionGlassPanel
                                className="p-8 relative overflow-hidden"
                                intensity={refractionIntensity}
                            >
                                {/* Refraction glow */}
                                <div
                                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                                    style={{
                                        background: `radial-gradient(circle at 50% 50%, rgba(34,211,238,${refractionIntensity * 0.08
                                            }), transparent 60%)`,
                                    }}
                                />

                                <div className="relative z-10">
                                    <GameHUD
                                        round={game.round || 1}
                                        currentAttempt={game.currentAttempt}
                                        maxAttempts={game.maxAttempts}
                                        status={game.status}
                                    />

                                    {game.status === 'playing' && (
                                        <NumberInputPanel
                                            onSubmit={handleGuess}
                                            lastHint={game.lastHint}
                                            isWrong={isWrong}
                                            isCorrect={isCorrect}
                                            onTyping={pulseRefraction}
                                        />
                                    )}

                                    {(game.status === 'won' || game.status === 'lost') && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-8"
                                        >
                                            <motion.div
                                                className="text-6xl mb-4 flex items-center justify-center"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.6 }}
                                            >
                                                {game.status === 'won' ? (
                                                    <LottieState variant="success" className="w-24 h-24" />
                                                ) : (
                                                    '💀'
                                                )}
                                            </motion.div>
                                            <h3
                                                className={`text-2xl font-light tracking-wider mb-2 ${game.status === 'won'
                                                        ? 'text-glow-cyan'
                                                        : 'text-red-400'
                                                    }`}
                                            >
                                                {game.status === 'won'
                                                    ? 'You Won!'
                                                    : 'Game Over'}
                                            </h3>
                                            <p className="text-white/30 text-sm mb-6">
                                                {game.status === 'won'
                                                    ? `Found it in ${game.currentAttempt} attempts!`
                                                    : 'Better luck next time.'}
                                            </p>
                                            <motion.button
                                                onClick={playAgain}
                                                className="glass-button px-8 py-3 tracking-[0.15em]"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Play Again
                                            </motion.button>
                                        </motion.div>
                                    )}

                                    <GuessHistory guesses={game.guesses} />
                                </div>
                            </RefractionGlassPanel>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
