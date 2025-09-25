import { SessionConfig } from '@/types/realtime';

export class RealtimeSessionManager {
  private session: unknown = null;
  private transport: unknown = null;
  private agent: unknown = null;
  private mediaStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    // Initialize audio element for output
    if (typeof window !== 'undefined') {
      this.audioElement = document.createElement('audio');
      this.audioElement.autoplay = true;
    }
  }

  async requestMicrophonePermission(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // Keep natural voice dynamics for hypnotherapy
        },
      });
      this.mediaStream = stream;
      return stream;
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        throw new Error('Microphone access is required for voice sessions');
      } else if ((error as Error).name === 'NotFoundError') {
        throw new Error('No microphone detected');
      }
      throw error;
    }
  }

  async getEphemeralToken(): Promise<string> {
    try {
      const response = await fetch('/api/realtime/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Unable to connect to server');
    }
  }

  async connect(agentInstance: unknown): Promise<void> {
    try {
      // Dynamic import to handle SDK availability
      const { RealtimeSession, OpenAIRealtimeWebRTC } = await import('@openai/agents-realtime');

      // Get ephemeral token
      const token = await this.getEphemeralToken();

      // Ensure we have microphone permission
      if (!this.mediaStream) {
        await this.requestMicrophonePermission();
      }

      // Create WebRTC transport
      this.transport = new (OpenAIRealtimeWebRTC as any)({
        mediaStream: this.mediaStream || undefined,
        audioElement: this.audioElement || undefined,
      });

      // Create session with hypnotherapy-optimized settings
      const sessionConfig: SessionConfig = {
        model: 'gpt-realtime',
        voice: 'verse',
        temperature: 0.7,
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          silence_duration_ms: 1500, // Longer for hypnotherapy pauses
          prefix_padding_ms: 500,
          create_response: true,
        },
        output_audio_format: 'pcm16',
        input_audio_format: 'pcm16',
      };

      this.session = new (RealtimeSession as any)(agentInstance, {
        transport: this.transport,
        ...sessionConfig,
      });

      // Connect with ephemeral token
      await (this.session as any).connect({ apiKey: token });

      this.agent = agentInstance;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.transport) {
        (this.transport as any).close();
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      this.session = null;
      this.transport = null;
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  async connectWithRetry(agentInstance: unknown, maxAttempts = 3): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await this.connect(agentInstance);
        return;
      } catch (error) {
        if (i === maxAttempts - 1) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  interrupt(): void {
    if (this.transport) {
      (this.transport as any).interrupt(true); // true to cancel ongoing response
    }
  }

  mute(muted: boolean): void {
    if (this.session) {
      (this.session as any).mute(muted);
    }
  }

  sendAudio(audioData: ArrayBuffer, options?: { commit?: boolean }): void {
    if (this.session) {
      (this.session as any).sendAudio(audioData, options);
    }
  }

  updateSessionConfig(config: Partial<SessionConfig>): void {
    if (this.transport) {
      (this.transport as any).updateSessionConfig(config);
    }
  }

  getSession(): unknown {
    return this.session;
  }

  getTransport(): unknown {
    return this.transport;
  }

  isConnected(): boolean {
    return this.session !== null && (this.transport as any)?.status === 'connected';
  }
}