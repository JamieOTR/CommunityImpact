/**
 * Tavus.io API Service
 * Handles video generation and avatar creation
 */

export interface TavusVideoRequest {
  script: string;
  avatar_id?: string;
  voice_id?: string;
  background?: string;
  video_name?: string;
}

export interface TavusVideoResponse {
  video_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  created_at: string;
  estimated_completion_time?: string;
}

export interface TavusAvatar {
  avatar_id: string;
  name: string;
  preview_url: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export class TavusService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVUS_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_TAVUS_BASE_URL || 'https://tavusapi.com';
    
    if (!this.apiKey) {
      console.warn('Tavus API key not found. Video generation features will be disabled.');
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Tavus API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate a video with AI avatar
   */
  async generateVideo(request: TavusVideoRequest): Promise<TavusVideoResponse> {
    try {
      return await this.makeRequest<TavusVideoResponse>('/v2/videos', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Failed to generate video:', error);
      throw error;
    }
  }

  /**
   * Get video status and details
   */
  async getVideo(videoId: string): Promise<TavusVideoResponse> {
    try {
      return await this.makeRequest<TavusVideoResponse>(`/v2/videos/${videoId}`);
    } catch (error) {
      console.error('Failed to get video:', error);
      throw error;
    }
  }

  /**
   * Get list of available avatars
   */
  async getAvatars(): Promise<TavusAvatar[]> {
    try {
      const response = await this.makeRequest<{ avatars: TavusAvatar[] }>('/v2/avatars');
      return response.avatars;
    } catch (error) {
      console.error('Failed to get avatars:', error);
      throw error;
    }
  }

  /**
   * Generate milestone completion video
   */
  async generateMilestoneVideo(
    userName: string,
    milestoneTitle: string,
    rewardAmount: number,
    avatarId?: string
  ): Promise<TavusVideoResponse> {
    const script = `Congratulations ${userName}! You have successfully completed the "${milestoneTitle}" milestone. You've earned ${rewardAmount} IMPACT tokens for your amazing contribution to the community. Keep up the great work making a positive difference!`;

    return this.generateVideo({
      script,
      avatar_id: avatarId || 'default',
      video_name: `${userName}_${milestoneTitle}_completion`,
      background: 'community_celebration'
    });
  }

  /**
   * Generate community update video
   */
  async generateCommunityUpdateVideo(
    communityName: string,
    updateMessage: string,
    avatarId?: string
  ): Promise<TavusVideoResponse> {
    const script = `Hello ${communityName} community! ${updateMessage} Thank you for your continued dedication to making a positive impact in our community.`;

    return this.generateVideo({
      script,
      avatar_id: avatarId || 'default',
      video_name: `${communityName}_community_update`,
      background: 'community_announcement'
    });
  }

  /**
   * Check if Tavus service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

export const tavusService = new TavusService();