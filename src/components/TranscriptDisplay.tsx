'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TranscriptEntry } from '@/types/realtime';

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  maxEntries?: number;
  className?: string;
}

export function TranscriptDisplay({
  transcript,
  maxEntries = 3,
  className = '',
}: TranscriptDisplayProps) {
  // Show only the last N entries
  const visibleTranscript = transcript.slice(-maxEntries);

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="popLayout">
        {visibleTranscript.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: index === visibleTranscript.length - 1 ? 1 : 0.6,
              y: 0,
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`p-3 rounded ${
              entry.role === 'user'
                ? 'bg-gray-800/50 ml-8 text-right'
                : 'bg-gray-900/50 mr-8'
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                entry.role === 'user' ? 'text-gray-500' : 'text-purple-400/60'
              }`}
            >
              {entry.role === 'user' ? 'you' : 'guide'}
            </p>
            <p className="text-sm text-gray-300">{entry.content}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {transcript.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="text-center py-8 text-gray-600"
        >
          <p className="text-xs">waiting for session...</p>
        </motion.div>
      )}
    </div>
  );
}