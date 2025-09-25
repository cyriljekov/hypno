'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
  className?: string;
}

export function AudioWaveform({ audioLevel, isActive, className = '' }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const waveDataRef = useRef<number[]>(new Array(64).fill(0));

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update wave data with smooth transition
      waveDataRef.current = waveDataRef.current.map((val) => {
        const target = Math.random() * audioLevel * 50 + 10;
        return val + (target - val) * 0.1;
      });

      // Draw waveform
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; // More visible purple
      ctx.lineWidth = 2;
      ctx.beginPath();

      const barWidth = canvas.width / waveDataRef.current.length;
      const centerY = canvas.height / 2;

      for (let i = 0; i < waveDataRef.current.length; i++) {
        const x = i * barWidth;
        const height = waveDataRef.current[i];

        // Draw symmetrical waveform
        ctx.moveTo(x, centerY - height);
        ctx.lineTo(x, centerY + height);
      }

      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive]);

  if (!isActive) return null;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-20 rounded bg-gray-900/20 border border-purple-500/20"
      />

      {/* Minimal audio level indicator */}
      <div className="absolute top-2 right-2 flex items-center space-x-0.5">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-2 bg-purple-400 rounded-full"
            animate={{
              height: audioLevel > i * 0.3 ? 8 : 2,
              opacity: audioLevel > i * 0.3 ? 0.8 : 0.2,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>
    </motion.div>
  );
}