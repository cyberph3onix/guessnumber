'use client';

import Lottie from 'lottie-react';
import loadingOrb from '@/assets/lottie/loading-orb.json';
import walletOrb from '@/assets/lottie/wallet-orb.json';
import successOrb from '@/assets/lottie/success-orb.json';

type LottieVariant = 'loading' | 'wallet' | 'success';

const animationMap = {
  loading: loadingOrb,
  wallet: walletOrb,
  success: successOrb,
};

interface LottieStateProps {
  variant: LottieVariant;
  className?: string;
  loop?: boolean;
}

export default function LottieState({
  variant,
  className = 'w-20 h-20',
  loop = true,
}: LottieStateProps) {
  return (
    <div className={className} aria-hidden="true">
      <Lottie animationData={animationMap[variant]} loop={loop} />
    </div>
  );
}
