'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import gsap from 'gsap';
import GlassCard from '@/components/GlassCard';

export default function HomePage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.char');
      tl.fromTo(
        chars,
        { y: 80, opacity: 0, rotateX: -90 },
        { y: 0, opacity: 1, rotateX: 0, stagger: 0.04, duration: 1 }
      );
    }

    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.4'
      );
    }
  }, []);

  const titleText = 'GuessNumber Stellar';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        {/* Animated Title */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-7xl md:text-8xl font-light tracking-tight mb-6"
          style={{ perspective: '1000px' }}
        >
          {titleText.split('').map((char, i) => (
            <span
              key={i}
              className="char inline-block"
              style={{
                background:
                  char === ' '
                    ? 'transparent'
                    : 'linear-gradient(135deg, #22d3ee, #ec4899, #8b5cf6)',
                WebkitBackgroundClip: char === ' ' ? undefined : 'text',
                WebkitTextFillColor: char === ' ' ? undefined : 'transparent',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl text-white/30 font-light tracking-wider mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          A cosmic number guessing game powered by Stellar Soroban smart
          contracts. Connect your wallet. Trust the chain.
        </p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/play">
            <motion.button
              className="glass-button px-10 py-4 text-base tracking-[0.15em] font-medium"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 40px rgba(34,211,238,0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                background:
                  'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(139,92,246,0.2))',
              }}
            >
              ⚡ Start Playing
            </motion.button>
          </Link>
          <Link href="/leaderboard">
            <motion.button
              className="glass-button px-10 py-4 text-base tracking-[0.15em] font-light"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🏆 Leaderboard
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full px-4"
      >
        {[
          {
            icon: '🔗',
            title: 'On-Chain Verified',
            desc: 'Every guess is validated by Soroban smart contracts on the Stellar blockchain.',
          },
          {
            icon: '🎮',
            title: 'Immersive Gameplay',
            desc: 'Cinematic animations and a cosmic particle environment for a premium feel.',
          },
          {
            icon: '🏆',
            title: 'Global Leaderboard',
            desc: 'Compete globally. Your scores are stored on-chain and verifiable by anyone.',
          },
        ].map((card, i) => (
          <GlassCard
            key={card.title}
            className="p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 + i * 0.15 }}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-lg font-medium tracking-wider text-white/70 mb-3">
              {card.title}
            </h3>
            <p className="text-sm text-white/30 font-light leading-relaxed">
              {card.desc}
            </p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="flex gap-12 mt-20 mb-16"
      >
        {[
          { value: '10K+', label: 'Games Played' },
          { value: '2.5K', label: 'Players' },
          { value: '99.9%', label: 'Uptime' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-light text-glow-cyan text-glow-cyan">
              {stat.value}
            </p>
            <p className="text-xs text-white/20 tracking-[0.2em] mt-1 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
