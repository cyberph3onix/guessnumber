'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import LeaderboardTable from '@/components/LeaderboardTable';

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen px-4 py-16 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl sm:text-5xl font-light tracking-wider mb-4 bg-gradient-to-r from-glow-cyan via-glow-pink to-glow-violet bg-clip-text text-transparent">
                    Leaderboard
                </h1>
                <p className="text-white/25 font-light tracking-wider">
                    Top players verified on the Stellar blockchain
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <GlassCard className="p-6">
                    <LeaderboardTable />
                </GlassCard>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-4 mt-8"
            >
                {[
                    { label: 'Total Games', value: '10,247' },
                    { label: 'Active Players', value: '2,531' },
                    { label: 'Avg Attempts', value: '4.2' },
                ].map((stat) => (
                    <GlassCard key={stat.label} className="p-6 text-center">
                        <p className="text-2xl font-light text-glow-cyan">{stat.value}</p>
                        <p className="text-xs text-white/20 tracking-[0.15em] mt-1 uppercase">
                            {stat.label}
                        </p>
                    </GlassCard>
                ))}
            </motion.div>
        </div>
    );
}
