import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '@/lib/realtime/state';
import { RealtimeSessionManager } from '@/lib/realtime/session';
import { TranceGuideAgent } from '@/lib/realtime/agent';
import { EventManager } from '@/lib/realtime/events';
import { detectTechnique } from '@/lib/realtime/state';

export function useRealtimeSession() {
  const sessionManagerRef = useRef<RealtimeSessionManager | null>(null);
  const agentRef = useRef<TranceGuideAgent | null>(null);
  const eventManagerRef = useRef<EventManager | null>(null);

  const {
    state,
    setState,
    setTechnique,
    setError,
    setConnected,
    setMuted,
    setAudioLevel,
    setSession,
    setAgent,
    startSession,
    endSession,
    addTranscript,
    reset,
  } = useSessionStore();

  // Initialize managers
  useEffect(() => {
    sessionManagerRef.current = new RealtimeSessionManager();
    agentRef.current = new TranceGuideAgent();
    eventManagerRef.current = new EventManager();

    return () => {
      disconnect();
    };
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    const eventManager = eventManagerRef.current;
    if (!eventManager) return;

    eventManager.on('session.ready', () => {
      setState('connected');
      setConnected(true);
    });

    eventManager.on('session.error', (error: Error) => {
      setError(error);
      setState('error');
    });

    eventManager.on('session.disconnected', () => {
      setConnected(false);
      setState('idle');
    });

    eventManager.on('transcript.updated', (transcript: any) => {
      addTranscript(transcript);

      // Auto-detect technique from user's first message
      if (transcript.role === 'user' && !useSessionStore.getState().technique) {
        const technique = detectTechnique(transcript.content);
        setTechnique(technique);
      }
    });

    eventManager.on('speech.started', () => {
      // User is speaking
    });

    eventManager.on('speech.stopped', () => {
      // User stopped speaking
    });

    eventManager.on('audio.level', (level: number) => {
      setAudioLevel(level);
    });
  }, [setState, setError, setConnected, addTranscript, setTechnique, setAudioLevel]);

  // Connect to session
  const connect = useCallback(async () => {
    try {
      setState('requesting_permissions');

      const sessionManager = sessionManagerRef.current;
      const agent = agentRef.current;
      const eventManager = eventManagerRef.current;

      if (!sessionManager || !agent || !eventManager) {
        throw new Error('Session components not initialized');
      }

      // Request microphone permission
      await sessionManager.requestMicrophonePermission();

      setState('generating_token');

      // Create agent instance
      const agentInstance = await agent.createAgent();
      setAgent(agentInstance);

      setState('connecting');

      // Connect with retry logic
      await sessionManager.connectWithRetry(agentInstance);

      // Attach event manager
      const session = sessionManager.getSession();
      const transport = sessionManager.getTransport();
      eventManager.attachToSession(session, transport);

      // Setup event listeners
      setupEventListeners();

      setSession(session);
      setState('connected');
      setConnected(true);

      // Start the session
      startSession();
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(error);
      setState('error');
    }
  }, [setState, setAgent, setSession, setConnected, setError, startSession, setupEventListeners]);

  // Disconnect from session
  const disconnect = useCallback(async () => {
    try {
      setState('ending');

      const sessionManager = sessionManagerRef.current;
      const eventManager = eventManagerRef.current;

      if (sessionManager) {
        await sessionManager.disconnect();
      }

      if (eventManager) {
        eventManager.removeAllListeners();
      }

      reset();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [setState, reset]);

  // Interrupt the current response
  const interrupt = useCallback(() => {
    const sessionManager = sessionManagerRef.current;
    if (sessionManager) {
      sessionManager.interrupt();
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const sessionManager = sessionManagerRef.current;
    const newMutedState = !useSessionStore.getState().isMuted;

    if (sessionManager) {
      sessionManager.mute(newMutedState);
      setMuted(newMutedState);
    }
  }, [setMuted]);

  // Send audio data
  const sendAudio = useCallback((audioData: ArrayBuffer, commit?: boolean) => {
    const sessionManager = sessionManagerRef.current;
    if (sessionManager) {
      sessionManager.sendAudio(audioData, { commit });
    }
  }, []);

  // Trigger a custom response
  const triggerResponse = useCallback((instructions?: string) => {
    const eventManager = eventManagerRef.current;
    if (eventManager) {
      eventManager.triggerResponse(instructions);
    }
  }, []);

  return {
    // State
    sessionState: state,
    isConnected: useSessionStore((state) => state.isConnected),
    isMuted: useSessionStore((state) => state.isMuted),
    audioLevel: useSessionStore((state) => state.audioLevel),
    transcript: useSessionStore((state) => state.transcript),
    technique: useSessionStore((state) => state.technique),
    error: useSessionStore((state) => state.error),
    startTime: useSessionStore((state) => state.startTime),

    // Actions
    connect,
    disconnect,
    interrupt,
    toggleMute,
    sendAudio,
    triggerResponse,
  };
}