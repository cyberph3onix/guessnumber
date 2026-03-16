'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    className?: string;
    glow?: boolean;
    glowColor?: string;
}

export default function GlassCard({
    children,
    className = '',
    glow = true,
    glowColor = 'rgba(34,211,238,0.15)',
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            className={`glass-panel glass-panel-hover relative ${className}`}
            whileHover={
                glow
                    ? {
                        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 60px ${glowColor}`,
                    }
                    : undefined
            }
            transition={{ duration: 0.3 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
