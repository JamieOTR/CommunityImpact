import { supabase } from './supabase';

export interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: Array<{
    type: 'milestone' | 'progress' | 'wallet' | 'community';
    data?: any;
  }>;
}

export class AIService {
  private sessionId: string;

  constructor() {
    this.sessionId = crypto.randomUUID();
  }

  async processMessage(userId: string, message: string, context?: any): Promise<AIResponse> {
    try {
      // Get user context for personalized responses
      const userContext = await this.getUserContext(userId);
      
      // Process the message and generate response
      const response = await this.generateResponse(message, userContext, context);
      
      // Log the interaction
      await this.logInteraction(userId, message, response.message);
      
      return response;
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        suggestions: ["Try asking about available milestones", "Check your progress", "Connect your wallet"]
      };
    }
  }

  private async getUserContext(userId: string) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select(`
          *,
          communities (name, description),
          achievements (
            *,
            milestones (title, category, reward_amount)
          )
        `)
        .eq('user_id', userId)
        .single();

      return user;
    } catch (error) {
      console.error('Failed to get user context:', error);
      return null;
    }
  }

  private async generateResponse(message: string, userContext: any, context?: any): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase();
    
    // Voice milestone submission detection
    if (this.isVoiceMilestoneSubmission(lowerMessage)) {
      return this.handleVoiceMilestoneSubmission(message, userContext);
    }
    
    // Milestone-related queries
    if (lowerMessage.includes('milestone') || lowerMessage.includes('goal') || lowerMessage.includes('task')) {
      return this.handleMilestoneQuery(userContext);
    }
    
    // Progress queries
    if (lowerMessage.includes('progress') || lowerMessage.includes('status') || lowerMessage.includes('achievement')) {
      return this.handleProgressQuery(userContext);
    }
    
    // Wallet queries
    if (lowerMessage.includes('wallet') || lowerMessage.includes('connect') || lowerMessage.includes('token')) {
      return this.handleWalletQuery(userContext);
    }
    
    // Community queries
    if (lowerMessage.includes('community') || lowerMessage.includes('member') || lowerMessage.includes('join')) {
      return this.handleCommunityQuery(userContext);
    }
    
    // Reward queries
    if (lowerMessage.includes('reward') || lowerMessage.includes('earn') || lowerMessage.includes('impact')) {
      return this.handleRewardQuery(userContext);
    }
    
    // Default helpful response
    return this.getDefaultResponse(userContext);
  }

  private isVoiceMilestoneSubmission(message: string): boolean {
    const voiceIndicators = [
      'i completed', 'i finished', 'i did', 'just completed', 'just finished',
      'submit milestone', 'milestone complete', 'done with', 'finished the'
    ];
    return voiceIndicators.some(indicator => message.includes(indicator));
  }

  private handleVoiceMilestoneSubmission(message: string, userContext: any): AIResponse {
    const timestamp = new Date().toLocaleString();
    
    return {
      message: `I heard you say: "${message}". I've logged your milestone submission at ${timestamp}. Please provide any evidence or additional details, and I'll help you submit it for verification. Would you like me to guide you through the submission process?`,
      suggestions: [
        "Yes, help me submit evidence",
        "Show me submission requirements",
        "Check my progress"
      ],
      actions: [
        {
          type: 'milestone',
          data: {
            action: 'voice_submission',
            message: message,
            timestamp: timestamp
          }
        }
      ]
    };
  }

  private handleMilestoneQuery(userContext: any): AIResponse {
    const completedCount = userContext?.achievements?.length || 0;
    const communityName = userContext?.communities?.name || 'your community';
    
    return {
      message: `I found several available milestones for you in ${communityName}! You've already completed ${completedCount} milestones. Here are some recommendations based on your interests and location.`,
      suggestions: [
        "Show environmental milestones",
        "Find education opportunities", 
        "View community service options",
        "See quick wins (easy milestones)"
      ],
      actions: [
        {
          type: 'milestone',
          data: { action: 'browse_available' }
        }
      ]
    };
  }

  private handleProgressQuery(userContext: any): AIResponse {
    const totalScore = userContext?.total_impact_score || 0;
    const tokenBalance = userContext?.token_balance || 0;
    const completedMilestones = userContext?.achievements?.length || 0;
    
    return {
      message: `You're doing amazing! Here's your current progress: ${totalScore.toLocaleString()} impact points, ${tokenBalance} IMPACT tokens earned, and ${completedMilestones} milestones completed. You're making a real difference in your community!`,
      suggestions: [
        "View detailed progress",
        "See leaderboard position",
        "Find next milestone",
        "Check pending rewards"
      ],
      actions: [
        {
          type: 'progress',
          data: { 
            score: totalScore,
            tokens: tokenBalance,
            milestones: completedMilestones
          }
        }
      ]
    };
  }

  private handleWalletQuery(userContext: any): AIResponse {
    const hasWallet = userContext?.wallet_address;
    
    if (hasWallet) {
      return {
        message: `Your wallet is connected! Address: ${userContext.wallet_address.slice(0, 6)}...${userContext.wallet_address.slice(-4)}. Your current balance is ${userContext.token_balance || 0} IMPACT tokens.`,
        suggestions: [
          "View transaction history",
          "Check pending rewards",
          "Disconnect wallet",
          "View wallet on blockchain"
        ]
      };
    } else {
      return {
        message: "To receive your IMPACT token rewards automatically, you'll need to connect your wallet. Click the wallet icon in the header and follow the prompts to connect MetaMask or another Web3 wallet.",
        suggestions: [
          "Connect MetaMask",
          "Learn about Web3 wallets",
          "View rewards without wallet",
          "Get help with setup"
        ],
        actions: [
          {
            type: 'wallet',
            data: { action: 'connect' }
          }
        ]
      };
    }
  }

  private handleCommunityQuery(userContext: any): AIResponse {
    const communityName = userContext?.communities?.name;
    
    if (communityName) {
      return {
        message: `You're part of the ${communityName} community! This is a great place to collaborate on impactful projects and earn rewards together. Your community has been working on amazing initiatives.`,
        suggestions: [
          "View community programs",
          "See member leaderboard", 
          "Find collaboration opportunities",
          "Check community impact"
        ]
      };
    } else {
      return {
        message: "It looks like you're not part of a community yet. Joining a community gives you access to exclusive programs, collaborative projects, and local impact opportunities!",
        suggestions: [
          "Browse communities",
          "Create new community",
          "Learn about benefits",
          "Get invitation code"
        ]
      };
    }
  }

  private handleRewardQuery(userContext: any): AIResponse {
    const tokenBalance = userContext?.token_balance || 0;
    const recentAchievements = userContext?.achievements?.slice(0, 3) || [];
    
    return {
      message: `You've earned ${tokenBalance} IMPACT tokens so far! These tokens are automatically sent to your connected wallet when milestones are verified. Your recent achievements have been making a real impact.`,
      suggestions: [
        "View earning history",
        "Check pending rewards",
        "Learn about token value",
        "Find high-reward milestones"
      ],
      actions: [
        {
          type: 'milestone',
          data: { 
            action: 'high_reward_milestones',
            current_balance: tokenBalance
          }
        }
      ]
    };
  }

  private getDefaultResponse(userContext: any): AIResponse {
    const name = userContext?.name?.split(' ')[0] || 'there';
    
    return {
      message: `Hi ${name}! I'm here to help with your community impact journey. You can ask me about finding milestones, checking your progress, connecting your wallet, or understanding how rewards work. What would you like to explore?`,
      suggestions: [
        "Find new milestones",
        "Check my progress", 
        "Connect wallet",
        "Learn about rewards"
      ]
    };
  }

  private async logInteraction(userId: string, message: string, response: string): Promise<void> {
    try {
      await supabase
        .from('interactions')
        .insert({
          user_id: userId,
          message: message,
          ai_response: response,
          session_id: this.sessionId,
          context_type: 'chat'
        });
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }

  // Voice processing methods
  async processVoiceInput(audioBlob: Blob, userId: string): Promise<AIResponse> {
    try {
      // Mock speech-to-text conversion
      const transcription = await this.mockSpeechToText(audioBlob);
      
      // Process the transcribed text
      const response = await this.processMessage(userId, transcription);
      
      // Add voice-specific context
      return {
        ...response,
        message: `I heard: "${transcription}". ${response.message}`
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      return {
        message: "I'm sorry, I couldn't process your voice input. Please try speaking again or type your message."
      };
    }
  }

  private async mockSpeechToText(audioBlob: Blob): Promise<string> {
    // Mock implementation - in production, integrate with speech-to-text service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockTranscriptions = [
      "I completed the community clean-up milestone",
      "I finished organizing the food bank volunteer event",
      "I just completed the digital literacy workshop",
      "I want to check my progress",
      "How many tokens have I earned?",
      "What milestones are available?"
    ];
    
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  }

  async generateSpeechResponse(text: string): Promise<void> {
    try {
      // Mock text-to-speech - in production, integrate with TTS service
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }
}

export const aiService = new AIService();