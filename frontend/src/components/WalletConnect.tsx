'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/stores/walletStore';
import LottieState from './LottieState';

export default function WalletConnect() {
    const { connected, address, balance, connecting, error, connect, disconnect } =
        useWalletStore();

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                {!connected ? (
                    <motion.button
                        key="connect"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => {
                            connect().catch(() => {
                                // Error state is already captured in the wallet store.
                            });
                        }}
                        disabled={connecting}
                        className="glass-button flex items-center gap-3 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {connecting ? (
                            <>
                                <LottieState variant="wallet" className="w-6 h-6" />
                                <span className="tracking-wider">Connecting...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                                    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                                </svg>
                                <span className="tracking-wider">Connect Wallet</span>
                            </>
                        )}
                    </motion.button>
                ) : (
                    <motion.div
                        key="connected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-3"
                    >
                        <div className="glass-panel px-4 py-2 flex items-center gap-3 !rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <div>
                                <p className="text-xs text-white/40 tracking-wider">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </p>
                                <p className="text-xs text-glow-cyan font-medium">
                                    {balance.toLocaleString()} XLM
                                </p>
                            </div>
                        </div>
                        <motion.button
                            onClick={disconnect}
                            className="text-white/30 hover:text-white/60 transition-colors text-xs tracking-wider"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ✕
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!connected && error && (
                <p className="mt-2 text-[11px] text-red-300/85 tracking-wide max-w-[280px]">
                    {error}
                </p>
            )}
        </div>
    );
}
