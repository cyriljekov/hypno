import { TranscriptEntry } from '@/types/realtime';

type EventCallback = (...args: unknown[]) => void;

export class EventManager {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private session: unknown;
  private transport: unknown;

  constructor() {
    this.listeners = new Map();
  }

  attachToSession(session: unknown, transport: unknown) {
    this.session = session;
    this.transport = transport;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.session) return;

    // Audio streaming events
    (this.session as any).on('audio', (event: any) => {
      this.emit('audio', event.data);
      this.updateVisualization(event.data);
    });

    // Conversation tracking
    (this.session as any).on('conversation.item.created', (event: any) => {
      if (event.item.role === 'user' || event.item.role === 'assistant') {
        const transcript: TranscriptEntry = {
          id: event.item.id || Date.now().toString(),
          role: event.item.role,
          content: event.item.formatted?.transcript || '',
          timestamp: Date.now(),
        };
        this.emit('transcript.updated', transcript);
      }
    });

    // Session lifecycle events
    (this.session as any).on('session.created', () => {
      this.emit('session.ready');
    });

    (this.session as any).on('session.updated', (event: unknown) => {
      this.emit('session.updated', event);
    });

    (this.session as any).on('error', (error: unknown) => {
      console.error('Session error:', error);
      this.emit('session.error', error);
    });

    (this.session as any).on('disconnect', () => {
      this.emit('session.disconnected');
    });

    // Transport layer events for advanced control
    if (this.transport) {
      (this.transport as any).on('*', (event: any) => {
        // Handle all raw OpenAI Realtime API events
        switch (event.type) {
          case 'input_audio_buffer.speech_started':
            this.emit('speech.started');
            break;
          case 'input_audio_buffer.speech_stopped':
            this.emit('speech.stopped');
            break;
          case 'response.created':
            this.emit('response.created', event);
            break;
          case 'response.done':
            this.emit('response.done', event);
            break;
        }
      });
    }
  }

  private updateVisualization(audioData: ArrayBuffer) {
    // Convert PCM16 audio to visualization data
    const dataArray = new Int16Array(audioData);
    const amplitude = this.calculateAmplitude(dataArray);

    this.emit('audio.level', amplitude);
    this.emit('audio.visualization', {
      waveform: Array.from(dataArray.slice(0, 256)),
      amplitude,
    });
  }

  private calculateAmplitude(dataArray: Int16Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i]);
    }
    // Normalize to 0-1 range
    return Math.min(1, sum / (dataArray.length * 32768));
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: unknown[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners() {
    this.listeners.clear();
  }

  // Helper methods for common operations
  triggerResponse(instructions?: string) {
    if (this.transport) {
      (this.transport as any).sendEvent({
        type: 'response.create',
        response: {
          modalities: ['audio'],
          instructions: instructions || 'Continue the hypnotherapy session',
        },
      });
    }
  }

  cancelResponse() {
    if (this.transport) {
      (this.transport as any).sendEvent({
        type: 'response.cancel',
      });
    }
  }
}