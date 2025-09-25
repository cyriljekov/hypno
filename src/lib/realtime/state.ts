import { create } from 'zustand';
import { SessionState, TechniqueType, TranscriptEntry, SessionContext } from '@/types/realtime';

interface SessionStore extends SessionContext {
  // State updates
  setState: (state: SessionState) => void;
  setTechnique: (technique: TechniqueType) => void;
  setError: (error: Error | null) => void;
  setConnected: (connected: boolean) => void;
  setMuted: (muted: boolean) => void;
  setAudioLevel: (level: number) => void;

  // Session management
  setSession: (session: any) => void;
  setAgent: (agent: any) => void;
  startSession: () => void;
  endSession: () => void;

  // Transcript management
  addTranscript: (entry: TranscriptEntry) => void;
  clearTranscript: () => void;

  // Reset everything
  reset: () => void;
}

const initialState: SessionContext = {
  state: 'idle',
  session: null,
  agent: null,
  startTime: null,
  technique: null,
  transcript: [],
  error: null,
  isConnected: false,
  isMuted: false,
  audioLevel: 0,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  // State updates
  setState: (state) => set({ state }),
  setTechnique: (technique) => set({ technique }),
  setError: (error) => set({ error, state: error ? 'error' : 'idle' }),
  setConnected: (isConnected) => set({ isConnected }),
  setMuted: (isMuted) => set({ isMuted }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),

  // Session management
  setSession: (session) => set({ session }),
  setAgent: (agent) => set({ agent }),

  startSession: () =>
    set({
      state: 'in_session',
      startTime: Date.now(),
      transcript: [],
      error: null,
    }),

  endSession: () =>
    set({
      state: 'ending',
      startTime: null,
    }),

  // Transcript management
  addTranscript: (entry) =>
    set((state) => ({
      transcript: [...state.transcript, entry],
    })),

  clearTranscript: () => set({ transcript: [] }),

  // Reset everything
  reset: () => set(initialState),
}));

// Technique detection helper
export function detectTechnique(userInput: string): TechniqueType {
  const input = userInput.toLowerCase();

  if (input.includes('stress') || input.includes('relax') || input.includes('tension')) {
    return 'stress';
  }
  if (input.includes('sleep') || input.includes('insomnia') || input.includes('tired')) {
    return 'sleep';
  }
  if (input.includes('anxiety') || input.includes('panic') || input.includes('worried')) {
    return 'anxiety';
  }
  if (input.includes('focus') || input.includes('concentrate') || input.includes('performance')) {
    return 'focus';
  }
  return 'general';
}

// Session duration helper
export function getSessionDuration(startTime: number | null): string {
  if (!startTime) return '0:00';

  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}