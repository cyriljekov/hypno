import { HYPNOTHERAPIST_INSTRUCTIONS } from './instructions';

// Since @openai/agents-realtime types may not be available yet,
// we'll create a compatible interface structure
interface RealtimeAgentConfig {
  name: string;
  instructions: string;
  voice?: 'verse' | 'cedar' | 'marin';
  temperature?: number;
}

export class TranceGuideAgent {
  private config: RealtimeAgentConfig;

  constructor() {
    this.config = {
      name: 'TranceGuide',
      instructions: HYPNOTHERAPIST_INSTRUCTIONS,
      voice: 'verse', // Most calming voice
      temperature: 0.7, // Balanced creativity
    };
  }

  getConfig(): RealtimeAgentConfig {
    return this.config;
  }

  // Create the agent instance when SDK is available
  async createAgent(): Promise<any> {
    try {
      // Dynamic import to handle SDK availability
      const { RealtimeAgent } = await import('@openai/agents-realtime');

      return new RealtimeAgent({
        name: this.config.name,
        instructions: this.config.instructions,
        // No tools required for MVP
      });
    } catch (error) {
      console.error('Failed to create RealtimeAgent:', error);
      throw new Error('RealtimeAgent SDK not available');
    }
  }
}