export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  walletAddress?: string;
  totalImpactScore: number;
  badges: Badge[];
  joinedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardAmount: number;
  rewardToken: string;
  progress: number;
  status: 'available' | 'in-progress' | 'submitted' | 'verified' | 'completed';
  deadline?: Date;
  requirements: string[];
  evidenceSubmitted?: Evidence[];
}

export interface Evidence {
  id: string;
  type: 'image' | 'document' | 'video' | 'link';
  url: string;
  description: string;
  submittedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'reward' | 'penalty' | 'transfer';
  amount: number;
  token: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  description: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  organization: string;
  category: string;
  totalReward: number;
  participantCount: number;
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  status: 'draft' | 'active' | 'completed' | 'paused';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'action';
  actions?: ChatAction[];
}

export interface ChatAction {
  id: string;
  label: string;
  action: string;
  data?: any;
}

export interface ImpactMetrics {
  totalScore: number;
  milestonesCompleted: number;
  tokensEarned: number;
  communityRank: number;
  thisMonth: {
    score: number;
    milestones: number;
    tokens: number;
  };
  growth: {
    score: number;
    milestones: number;
    tokens: number;
  };
}