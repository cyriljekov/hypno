export type SessionState =
  | 'idle'
  | 'requesting_permissions'
  | 'generating_token'
  | 'connecting'
  | 'connected'
  | 'in_session'
  | 'ending'
  | 'error';

export type TechniqueType =
  | 'stress'
  | 'sleep'
  | 'anxiety'
  | 'focus'
  | 'general';

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SessionContext {
  state: SessionState;
  session: any; // RealtimeSession type from SDK
  agent: any; // RealtimeAgent type from SDK
  startTime: number | null;
  technique: TechniqueType | null;
  transcript: TranscriptEntry[];
  error: Error | null;
  isConnected: boolean;
  isMuted: boolean;
  audioLevel: number;
}

export interface SessionConfig {
  model: string;
  voice: 'verse' | 'cedar' | 'marin';
  temperature: number;
  turn_detection: {
    type: 'server_vad';
    threshold: number;
    silence_duration_ms: number;
    prefix_padding_ms: number;
    create_response: boolean;
  };
  output_audio_format: 'pcm16';
  input_audio_format: 'pcm16';
}

export interface AudioVisualizationData {
  waveform: number[];
  frequency: number[];
  amplitude: number;
}

export interface SessionEvents {
  'session.created': () => void;
  'session.updated': (config: Partial<SessionConfig>) => void;
  'session.error': (error: Error) => void;
  'audio': (data: ArrayBuffer) => void;
  'audio.level': (level: number) => void;
  'conversation.item.created': (item: any) => void;
  'speech.started': () => void;
  'speech.stopped': () => void;
  'disconnect': () => void;
}