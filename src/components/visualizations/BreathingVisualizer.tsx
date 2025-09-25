'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BreathingVisualizerProps {
  isActive: boolean;
  className?: string;
}

export function BreathingVisualizer({ isActive, className = '' }: BreathingVisualizerProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');

  useEffect(() => {
    if (!isActive) return;

    const breathingCycle = () => {
      const sequence = [
        { phase: 'inhale', duration: 4000 },
        { phase: 'hold', duration: 1000 },
        { phase: 'exhale', duration: 4000 },
        { phase: 'pause', duration: 1000 },
      ];

      let currentIndex = 0;

      const runPhase = () => {
        const current = sequence[currentIndex];
        setPhase(current.phase as any);

        setTimeout(() => {
          currentIndex = (currentIndex + 1) % sequence.length;
          runPhase();
        }, current.duration);
      };

      runPhase();
    };

    const timer = breathingCycle();
    return () => clearTimeout(timer as any);
  }, [isActive]);

  const getScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1;
      case 'pause':
        return 1;
      default:
        return 1;
    }
  };

  const getOpacity = () => {
    switch (phase) {
      case 'inhale':
        return 0.8;
      case 'hold':
        return 0.9;
      case 'exhale':
        return 0.6;
      case 'pause':
        return 0.5;
      default:
        return 0.6;
    }
  };

  if (!isActive) return null;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Single breathing circle with glow */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-purple-500/10 border-2 border-purple-500/40"
        animate={{
          scale: getScale(),
          opacity: getOpacity() * 0.8,
        }}
        transition={{
          duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 4 : 1,
          ease: 'easeInOut',
        }}
        style={{
          boxShadow: '0 0 60px rgba(168, 85, 247, 0.3)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Center pulse */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-purple-400/70"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Minimalist breathing text */}
      <motion.div
        className="absolute -bottom-8 text-center"
        animate={{ opacity: [0, 0.6, 0.6, 0] }}
        transition={{ duration: 1.5 }}
        key={phase}
      >
        <p className="text-xs text-gray-400 font-light lowercase">
          {phase === 'hold' ? 'hold' : phase === 'pause' ? 'pause' : phase}
        </p>
      </motion.div>
    </div>
  );
}