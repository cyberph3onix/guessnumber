'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLeaderboardStore, LeaderboardEntry } from '@/stores/leaderboardStore';

export default function LeaderboardTable() {
    const { entries, loading, fetchLeaderboard } = useLeaderboardStore();

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <motion.div
                    className="w-8 h-8 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5">
                        {['Rank', 'Player', 'Games Won', 'Best Score', 'Avg Attempts'].map(
                            (h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-[10px] font-light tracking-[0.25em] text-white/25 uppercase"
                                >
                                    {h}
                                </th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {entries.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-4 py-10 text-center text-sm text-white/35 tracking-wider"
                            >
                                No leaderboard data yet.
                            </td>
                        </tr>
                    )}

                    {entries.map((entry: LeaderboardEntry, i: number) => (
                        <motion.tr
                            key={`${entry.wallet}-${entry.rank}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.4 }}
                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                        >
                            <td className="px-4 py-4">
                                <span
                                    className={`text-lg font-light ${entry.rank === 1
                                            ? 'text-yellow-400'
                                            : entry.rank === 2
                                                ? 'text-gray-300'
                                                : entry.rank === 3
                                                    ? 'text-amber-600'
                                                    : 'text-white/30'
                                        }`}
                                >
                                    {entry.rank <= 3
                                        ? ['🥇', '🥈', '🥉'][entry.rank - 1]
                                        : `#${entry.rank}`}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <span className="text-sm font-mono text-white/50 group-hover:text-white/70 transition-colors">
                                    {entry.wallet}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-white/60">{entry.gamesWon}</td>
                            <td className="px-4 py-4">
                                <span className="text-sm text-glow-cyan font-medium">
                                    {entry.bestScore}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-white/50">{entry.avgAttempts}</td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
