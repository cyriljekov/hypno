'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { BreathingVisualizer } from '@/components/visualizations/BreathingVisualizer';
import { AudioWaveform } from '@/components/visualizations/AudioWaveform';
import { SessionControls } from '@/components/controls/SessionControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Moon, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { getSessionDuration } from '@/lib/realtime/state';

export default function Home() {
  const {
    sessionState,
    isConnected,
    isMuted,
    audioLevel,
    error,
    startTime,
    connect,
    disconnect,
    interrupt,
    toggleMute,
  } = useRealtimeSession();

  const [showWelcome, setShowWelcome] = useState(true);

  // Handle session state changes
  useEffect(() => {
    if (sessionState === 'in_session') {
      setShowWelcome(false);
    }
  }, [sessionState]);

  const handleStart = async () => {
    setShowWelcome(false);
    await connect();
  };

  const handleStop = async () => {
    await disconnect();
    setShowWelcome(true);
  };

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <h2 className="text-xl font-medium text-gray-100">Connection Error</h2>
            <p className="text-gray-300">{error.message}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render welcome screen
  if (showWelcome && sessionState === 'idle') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="max-w-xl w-full p-10 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <div className="text-center space-y-8">
              {/* Simple Logo */}
              <div className="flex justify-center">
                <Brain className="h-12 w-12 text-purple-400" />
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-light text-gray-100 mb-2">TranceGuide</h1>
                <p className="text-sm text-gray-400">AI Hypnotherapy</p>
              </div>

              {/* Minimalist Features */}
              <div className="flex justify-center gap-8 my-8">
                <div className="text-center">
                  <Heart className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-300">Relax</span>
                </div>
                <div className="text-center">
                  <Moon className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-300">Sleep</span>
                </div>
                <div className="text-center">
                  <Sparkles className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-300">Focus</span>
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/50 px-8 py-3 text-sm font-light transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                Begin Session
              </Button>

              {/* Instructions */}
              <p className="text-xs text-gray-400">
                Quiet space with headphones recommended
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Render loading states
  if (sessionState === 'requesting_permissions') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center space-y-4">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <h2 className="text-lg font-light text-gray-100">Requesting Permissions</h2>
            <p className="text-sm text-gray-400">Please allow microphone access</p>
          </div>
        </Card>
      </div>
    );
  }

  if (sessionState === 'generating_token' || sessionState === 'connecting') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center space-y-4">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <h2 className="text-lg font-light text-gray-100">
              {sessionState === 'generating_token' ? 'Preparing' : 'Connecting'}
            </h2>
            <p className="text-sm text-gray-400">Setting up session</p>
          </div>
        </Card>
      </div>
    );
  }

  // Render main session interface
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Session timer at top */}
        {startTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-center mb-4"
          >
            <p className="text-xs text-gray-400">{getSessionDuration(startTime)}</p>
          </motion.div>
        )}

        {/* Single centered card */}
        <Card className="p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <div className="space-y-8">
            {/* Breathing Visualizer */}
            <div className="flex justify-center py-8">
              <BreathingVisualizer isActive={sessionState === 'in_session'} />
            </div>

            {/* Audio Waveform */}
            <AudioWaveform
              audioLevel={audioLevel}
              isActive={sessionState === 'in_session'}
            />

            {/* Controls */}
            <SessionControls
              isConnected={isConnected}
              isMuted={isMuted}
              isSessionActive={sessionState === 'in_session'}
              onStart={handleStart}
              onStop={handleStop}
              onToggleMute={toggleMute}
              onInterrupt={interrupt}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
