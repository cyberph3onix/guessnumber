'use client';

import { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AuroraGlowLayer from '@/components/AuroraGlowLayer';
import LenisProvider from '@/components/LenisProvider';
import LottieState from '@/components/LottieState';

const ParticleGalaxyBackground = lazy(
    () => import('@/components/ParticleGalaxyBackground')
);

function LoadingFallback() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-bg">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <LottieState variant="loading" className="w-16 h-16" />
                <p className="text-sm text-white/30 tracking-[0.2em]">LOADING COSMOS</p>
            </motion.div>
        </div>
    );
}

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LenisProvider>
            {/* 3D Background */}
            <Suspense fallback={null}>
                <ParticleGalaxyBackground />
            </Suspense>

            {/* Aurora Glow */}
            <AuroraGlowLayer />

            {/* Navigation */}
            <Navbar />

            {/* Page Content */}
            <Suspense fallback={<LoadingFallback />}>
                <AnimatePresence mode="wait">
                    <motion.main
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 pt-24"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </Suspense>
        </LenisProvider>
    );
}
