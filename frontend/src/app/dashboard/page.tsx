'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useWalletStore } from '@/stores/walletStore';
import { GameSnapshot, getGames } from '@/lib/api';

export default function DashboardPage() {
    const wallet = useWalletStore();
    const [games, setGames] = useState<GameSnapshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            try {
                const rows = await getGames(wallet.address);
                if (mounted) {
                    setGames(rows);
                }
            } catch {
                if (mounted) {
                    setGames([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, [wallet.address]);

    const stats = useMemo(() => {
        const totalGames = games.length;
        const wins = games.filter((g) => g.status === 'won').length;
        const losses = games.filter((g) => g.status === 'lost').length;
        const bestScore =
            games.filter((g) => g.status === 'won').sort((a, b) => a.guess_count - b.guess_count)[0]
                ?.guess_count ?? 0;
        const avgAttempts =
            totalGames === 0
                ? 0
                : Number((games.reduce((acc, game) => acc + game.guess_count, 0) / totalGames).toFixed(1));

        let currentStreak = 0;
        for (const game of games) {
            if (game.status === 'won') {
                currentStreak += 1;
            } else {
                break;
            }
        }

        return {
            totalGames,
            wins,
            losses,
            bestScore,
            avgAttempts,
            currentStreak,
        };
    }, [games]);

    const recentGames = games.slice(0, 8).map((g) => ({
        id: g.game_id,
        date: new Date(g.timestamp).toLocaleString(),
        attempts: g.guess_count,
        result: g.status,
    }));

    return (
        <div className="min-h-screen px-4 py-16 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-light tracking-wider mb-2 bg-gradient-to-r from-glow-cyan to-glow-violet bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-white/25 font-light tracking-wider">
                    {wallet.connected
                        ? `${wallet.address?.slice(0, 8)}...${wallet.address?.slice(-6)}`
                        : 'Connect wallet to view your stats'}
                </p>
            </motion.div>

            {loading && (
                <div className="text-center text-sm text-white/30 mb-6 tracking-wider">
                    Loading your game analytics...
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Games', value: stats.totalGames, icon: '🎮' },
                    { label: 'Wins', value: stats.wins, icon: '🏆' },
                    { label: 'Losses', value: stats.losses, icon: '💀' },
                    { label: 'Best Score', value: `${stats.bestScore || '-'} tries`, icon: '⚡' },
                    { label: 'Avg Attempts', value: stats.avgAttempts || '-', icon: '📊' },
                    { label: 'Win Streak', value: stats.currentStreak, icon: '🔥' },
                ].map((stat, i) => (
                    <GlassCard
                        key={stat.label}
                        className="p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <p className="text-2xl font-light text-white/80">{stat.value}</p>
                        <p className="text-xs text-white/20 tracking-[0.15em] mt-1 uppercase">
                            {stat.label}
                        </p>
                    </GlassCard>
                ))}
            </div>

            {/* Win Rate Bar */}
            <GlassCard className="p-6 mb-8">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-white/40 tracking-wider">Win Rate</span>
                    <span className="text-sm text-glow-cyan font-medium">
                        {stats.totalGames === 0 ? 0 : Math.round((stats.wins / stats.totalGames) * 100)}%
                    </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
                        }}
                        initial={{ width: 0 }}
                        animate={{
                            width: `${stats.totalGames === 0 ? 0 : (stats.wins / stats.totalGames) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </GlassCard>

            {/* Recent Games */}
            <GlassCard className="p-6">
                <h3 className="text-sm text-white/30 tracking-[0.2em] uppercase mb-4">
                    Recent Games
                </h3>
                <div className="space-y-3">
                    {recentGames.map((g, i) => (
                        <motion.div
                            key={g.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">
                                    {g.result === 'won' ? '✓' : '✗'}
                                </span>
                                <div>
                                    <p className="text-sm text-white/60">{g.attempts} attempts</p>
                                    <p className="text-xs text-white/20">{g.date}</p>
                                </div>
                            </div>
                            <span
                                className={`text-xs tracking-wider px-3 py-1 rounded-full ${g.result === 'won'
                                    ? 'bg-glow-cyan/10 text-glow-cyan'
                                    : 'bg-red-400/10 text-red-400'
                                    }`}
                            >
                                {g.result.toUpperCase()}
                            </span>
                        </motion.div>
                    ))}

                    {!loading && recentGames.length === 0 && (
                        <p className="text-sm text-white/25 tracking-wider py-6 text-center">
                            No games found for this wallet yet.
                        </p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
