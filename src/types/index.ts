export interface User {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  wallet_address?: string;
  total_impact_score: number;
  token_balance: number;
  community_id?: string;
  auth_user_id?: string;
  is_admin: boolean;
  role: 'member' | 'community_admin' | 'super_admin';
  account_status: 'active' | 'suspended' | 'banned' | 'pending';
  last_login_at?: Date;
  last_active_at?: Date;
  email_verified_at?: Date;
  terms_accepted_at?: Date;
  privacy_accepted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Community {
  community_id: string;
  name: string;
  description?: string;
  admin_id?: string;
  owner_user_id?: string;
  blockchain_address?: string;
  member_count: number;
  referral_code?: string;
  status: 'active' | 'paused' | 'archived';
  logo_url?: string;
  contact_email?: string;
  privacy_level: 'public' | 'private' | 'invite_only';
  settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Program {
  program_id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  community_id?: string;
  created_by?: string;
  coordinator_id?: string;
  program_type?: string;
  eligibility_rules?: Record<string, any>;
  max_participants?: number;
  tags?: string[];
  total_budget?: number;
  token_allocation?: number;
  participant_count: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface Milestone {
  milestone_id: string;
  title: string;
  description?: string;
  reward_amount: number;
  reward_token: string;
  verification_type: string;
  program_id?: string;
  milestone_type?: string;
  evidence_type: 'text' | 'url' | 'file' | 'mixed';
  min_evidence_items: number;
  verification_mode: 'admin' | 'auto' | 'peer';
  max_submissions_per_user?: number;
  sequence_order?: number;
  weight: number;
  completion_criteria?: Record<string, any>;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  deadline?: Date;
  requirements?: string[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface Achievement {
  achievement_id: string;
  user_id: string;
  milestone_id: string;
  completed_at: Date;
  evidence_hash?: string;
  evidence_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  transaction_hash?: string;
  progress: number;
  status: 'available' | 'in-progress' | 'submitted' | 'verified' | 'completed';
  verified_by?: string;
  verified_at?: Date;
  rejection_reason?: string;
  admin_notes?: string;
  evidence_payload?: Record<string, any>;
  source: 'web' | 'mobile' | 'import';
  risk_score: number;
  community_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Reward {
  reward_id: string;
  user_id: string;
  achievement_id?: string;
  token_amount: number;
  token_type: string;
  distributed_at: Date;
  transaction_hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  description?: string;
  approved_by?: string;
  approved_at?: Date;
  paid_at?: Date;
  tx_hash?: string;
  wallet_address?: string;
  network?: string;
  error_code?: string;
  error_message?: string;
  retry_count: number;
  last_retry_at?: Date;
  payout_batch_id?: string;
  community_id?: string;
  created_at: Date;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  community_id?: string;
  type: 'achievement' | 'reward' | 'message' | 'system' | 'milestone' | 'community' | 'verification' | 'reminder';
  title: string;
  message: string;
  action_url?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  read_at?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: Date;
  expires_at?: Date;
  metadata?: Record<string, any>;
}

export interface ProgramMember {
  member_id: string;
  program_id: string;
  user_id: string;
  role: 'participant' | 'coordinator' | 'mentor' | 'viewer';
  status: 'pending' | 'active' | 'completed' | 'dropped' | 'suspended';
  joined_at: Date;
  completed_at?: Date;
  dropped_at?: Date;
  completion_percentage: number;
  milestones_completed: number;
  tokens_earned: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  audit_id: string;
  actor_user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  community_id?: string;
  before_json?: Record<string, any>;
  after_json?: Record<string, any>;
  request_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface Badge {
  badge_id: string;
  community_id?: string;
  name: string;
  description: string;
  image_url?: string;
  icon?: string;
  category?: string;
  criteria: Record<string, any>;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points_value: number;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
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