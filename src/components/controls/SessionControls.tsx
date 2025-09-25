'use client';

import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionControlsProps {
  isConnected: boolean;
  isMuted: boolean;
  isSessionActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
}

export function SessionControls({
  isConnected,
  isMuted,
  isSessionActive,
  onStart,
  onStop,
  onToggleMute,
  onInterrupt,
}: SessionControlsProps) {

  return (
    <motion.div
      className="flex items-center justify-center space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Start/Stop Button */}
      {!isSessionActive ? (
        <Button
          onClick={onStart}
          size="lg"
          className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/50 px-6 py-2.5 text-sm font-light transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          <Play className="mr-1.5 h-4 w-4" />
          Start
        </Button>
      ) : (
        <>
          {/* Mute/Unmute Button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onToggleMute}
              variant="ghost"
              size="icon"
              className={`rounded-full h-10 w-10 ${
                isMuted
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </motion.div>

          {/* End Session Button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onStop}
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 bg-gray-700 hover:bg-gray-600 text-gray-300"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}