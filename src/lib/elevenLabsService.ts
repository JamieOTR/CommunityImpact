/**
 * ElevenLabs API Service
 * Handles text-to-speech and voice generation
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers: string[];
}

export interface ElevenLabsGenerateRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsGenerateResponse {
  audio_url: string;
  audio_base64?: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string;
  private defaultVoiceId: string = 'EXAVITQu4vr4xnSDxMaL'; // Default voice ID

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io';
    
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. Voice generation features will be disabled.');
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorData.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await this.makeRequest<{ voices: ElevenLabsVoice[] }>('/v1/voices');
      return response.voices;
    } catch (error) {
      console.error('Failed to get voices:', error);
      throw error;
    }
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(request: ElevenLabsGenerateRequest): Promise<Blob> {
    try {
      const voiceId = request.voice_id || this.defaultVoiceId;
      const url = `${this.baseUrl}/v1/text-to-speech/${voiceId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.model_id || 'eleven_monolingual_v1',
          voice_settings: request.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Failed to generate speech:', error);
      throw error;
    }
  }

  /**
   * Play generated speech
   */
  async playText(text: string, voiceId?: string): Promise<void> {
    try {
      const audioBlob = await this.generateSpeech({
        text,
        voice_id: voiceId
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Failed to play audio'));
        };
        audio.play();
      });
    } catch (error) {
      console.error('Failed to play text:', error);
      throw error;
    }
  }

  /**
   * Generate milestone completion announcement
   */
  async generateMilestoneAnnouncement(
    userName: string,
    milestoneTitle: string,
    rewardAmount: number,
    voiceId?: string
  ): Promise<Blob> {
    const text = `Congratulations ${userName}! You have successfully completed the ${milestoneTitle} milestone and earned ${rewardAmount} IMPACT tokens. Your contribution is making a real difference in the community!`;

    return this.generateSpeech({
      text,
      voice_id: voiceId,
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    });
  }

  /**
   * Generate AI assistant response with voice
   */
  async generateAIResponse(responseText: string, voiceId?: string): Promise<Blob> {
    return this.generateSpeech({
      text: responseText,
      voice_id: voiceId,
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.7,
        style: 0.1,
        use_speaker_boost: true
      }
    });
  }

  /**
   * Generate community update announcement
   */
  async generateCommunityUpdate(
    communityName: string,
    updateMessage: string,
    voiceId?: string
  ): Promise<Blob> {
    const text = `Hello ${communityName} community! ${updateMessage}`;

    return this.generateSpeech({
      text,
      voice_id: voiceId,
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.6,
        style: 0.0,
        use_speaker_boost: true
      }
    });
  }

  /**
   * Check if ElevenLabs service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

export const elevenLabsService = new ElevenLabsService();