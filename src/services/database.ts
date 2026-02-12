import { supabase } from './supabase';
import type { Database } from './supabase';

export type User = Database['public']['Tables']['users']['Row'];
export type Community = Database['public']['Tables']['communities']['Row'];
export type Program = Database['public']['Tables']['programs']['Row'];
export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type Reward = Database['public']['Tables']['rewards']['Row'];
export type Interaction = Database['public']['Tables']['interactions']['Row'];

export class DatabaseService {
  // User operations
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async createUser(userData: {
    email: string;
    name: string;
    auth_user_id: string;
    avatar_url?: string;
  }): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Community operations
  async getUserCommunity(userId: string): Promise<Community | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          community_id,
          communities (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error || !data?.communities) {
        return null;
      }

      return data.communities as Community;
    } catch (error) {
      console.error('Error fetching user community:', error);
      return null;
    }
  }

  async createCommunity(communityData: {
    name: string;
    description?: string;
    admin_id: string;
  }): Promise<Community | null> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert(communityData)
        .select()
        .single();

      if (error) {
        console.error('Error creating community:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating community:', error);
      return null;
    }
  }

  // Milestone operations
  async getMilestones(userId?: string): Promise<Milestone[]> {
    try {
      let query = supabase
        .from('milestones')
        .select(`
          *,
          programs (
            name,
            community_id,
            communities (name)
          )
        `);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching milestones:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }
  }

  async createMilestone(milestoneData: {
    title: string;
    description?: string;
    reward_amount: number;
    verification_type: string;
    program_id?: string;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    deadline?: string;
    requirements?: string[];
  }): Promise<Milestone | null> {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert(milestoneData)
        .select()
        .single();

      if (error) {
        console.error('Error creating milestone:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      return null;
    }
  }

  // Achievement operations
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          milestones (
            title,
            description,
            reward_amount,
            reward_token,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  async createAchievement(achievementData: {
    user_id: string;
    milestone_id: string;
    evidence_url?: string;
    evidence_hash?: string;
    progress?: number;
    status?: string;
  }): Promise<Achievement | null> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert(achievementData)
        .select()
        .single();

      if (error) {
        console.error('Error creating achievement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating achievement:', error);
      return null;
    }
  }

  // Reward operations
  async getUserRewards(userId: string): Promise<Reward[]> {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)
        .order('distributed_at', { ascending: false });

      if (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
  }

  async createReward(rewardData: {
    user_id: string;
    achievement_id?: string;
    token_amount: number;
    description: string;
    status?: string;
  }): Promise<Reward | null> {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert(rewardData)
        .select()
        .single();

      if (error) {
        console.error('Error creating reward:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating reward:', error);
      return null;
    }
  }

  // Interaction operations
  async logInteraction(interactionData: {
    user_id: string;
    message: string;
    ai_response: string;
    context_type?: string;
    session_id?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('interactions')
        .insert(interactionData);

      if (error) {
        console.error('Error logging interaction:', error);
      }
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  // Analytics operations
  async getCommunityStats(communityId: string) {
    try {
      const [usersResult, programsResult, achievementsResult, rewardsResult] = await Promise.all([
        supabase.from('users').select('user_id', { count: 'exact', head: true }).eq('community_id', communityId),
        supabase.from('programs').select('program_id', { count: 'exact', head: true }).eq('community_id', communityId),
        supabase.from('achievements').select('achievement_id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('rewards').select('token_amount').eq('status', 'confirmed')
      ]);

      const totalTokens = rewardsResult.data?.reduce((sum, reward) => sum + reward.token_amount, 0) || 0;

      return {
        totalMembers: usersResult.count || 0,
        activePrograms: programsResult.count || 0,
        completedMilestones: achievementsResult.count || 0,
        totalRewards: totalTokens
      };
    } catch (error) {
      console.error('Error fetching community stats:', error);
      return {
        totalMembers: 0,
        activePrograms: 0,
        completedMilestones: 0,
        totalRewards: 0
      };
    }
  }
}

export const databaseService = new DatabaseService();