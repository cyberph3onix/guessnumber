'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import WalletConnect from './WalletConnect';

const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/play', label: 'Play' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 left-0 right-0 z-50"
        >
            <div
                className="mx-4 mt-4 px-6 py-3 rounded-2xl flex items-center justify-between"
                style={{
                    background: 'rgba(2, 6, 23, 0.6)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {/* Logo */}
                <Link href="/home" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-glow-cyan/30 to-glow-violet/30 flex items-center justify-center border border-white/10">
                        <span className="text-sm">✦</span>
                    </div>
                    <span className="text-sm font-medium tracking-[0.1em] text-white/70 group-hover:text-white/90 transition-colors hidden sm:inline">
                        GuessNumber
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative px-4 py-2 text-sm"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background: 'rgba(34,211,238,0.08)',
                                            border: '1px solid rgba(34,211,238,0.15)',
                                        }}
                                        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                                    />
                                )}
                                <span
                                    className={`relative z-10 tracking-wider font-light transition-colors ${isActive ? 'text-glow-cyan' : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Wallet */}
                <WalletConnect />
            </div>
        </motion.nav>
    );
}
