/*
  # Complete Database Schema Setup

  1. New Tables
    - `users` - User profiles with authentication integration
    - `communities` - Community organizations
    - `programs` - Development programs within communities
    - `milestones` - Achievement milestones within programs
    - `achievements` - User milestone completions
    - `rewards` - Token rewards for achievements
    - `interactions` - AI chat interactions
    - `impact_metrics` - Community impact measurements

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Community-based access control for programs and milestones

  3. Features
    - Automatic member count updates
    - Token balance updates on reward confirmation
    - Proper foreign key relationships
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS impact_metrics CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for profile management
CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address varchar(42) UNIQUE,
  email varchar(255) UNIQUE NOT NULL,
  name varchar(100) NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  token_balance integer DEFAULT 0,
  total_impact_score integer DEFAULT 0,
  community_id uuid,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Communities table for organization management
CREATE TABLE communities (
  community_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(200) NOT NULL,
  description text,
  admin_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  blockchain_address varchar(42),
  member_count integer DEFAULT 0
);

-- Programs table for tracking development initiatives
CREATE TABLE programs (
  program_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(200) NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  community_id uuid REFERENCES communities(community_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  total_budget integer,
  token_allocation integer,
  participant_count integer DEFAULT 0,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused'))
);

-- Milestones table for achievement tracking
CREATE TABLE milestones (
  milestone_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(200) NOT NULL,
  description text,
  reward_amount integer NOT NULL,
  reward_token varchar(10) DEFAULT 'IMPACT',
  verification_type varchar(50) NOT NULL,
  program_id uuid REFERENCES programs(program_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completion_criteria jsonb,
  category varchar(50),
  difficulty varchar(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  deadline timestamptz,
  requirements text[]
);

-- Achievements table for user milestone completions
CREATE TABLE achievements (
  achievement_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(user_id),
  milestone_id uuid NOT NULL REFERENCES milestones(milestone_id),
  completed_at timestamptz DEFAULT now(),
  evidence_hash text,
  evidence_url text,
  verification_status varchar(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  transaction_hash varchar(66),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status varchar(20) DEFAULT 'available' CHECK (status IN ('available', 'in-progress', 'submitted', 'verified', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rewards table for token distribution
CREATE TABLE rewards (
  reward_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(user_id),
  achievement_id uuid REFERENCES achievements(achievement_id),
  token_amount integer NOT NULL,
  token_type varchar(10) DEFAULT 'IMPACT',
  distributed_at timestamptz DEFAULT now(),
  transaction_hash varchar(66),
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  description text
);

-- Interactions table for AI chat history
CREATE TABLE interactions (
  interaction_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(user_id),
  message text NOT NULL,
  ai_response text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  context_type varchar(50),
  session_id uuid
);

-- Impact metrics table for community measurements
CREATE TABLE impact_metrics (
  metric_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id uuid REFERENCES programs(program_id),
  community_id uuid REFERENCES communities(community_id),
  metric_name varchar(100) NOT NULL,
  metric_type varchar(50) NOT NULL,
  current_value numeric(10,2) DEFAULT 0,
  target_value numeric(10,2),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints that couldn't be added during table creation
ALTER TABLE users ADD CONSTRAINT fk_users_community 
  FOREIGN KEY (community_id) REFERENCES communities(community_id);

ALTER TABLE communities ADD CONSTRAINT communities_admin_id_fkey 
  FOREIGN KEY (admin_id) REFERENCES users(user_id);

-- Create indexes for better performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_community_id ON users(community_id);
CREATE INDEX idx_programs_community_id ON programs(community_id);
CREATE INDEX idx_milestones_program_id ON milestones(program_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_milestone_id ON achievements(milestone_id);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Create RLS policies for communities table
CREATE POLICY "Communities are viewable by members" ON communities
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Community admins can update communities" ON communities
  FOR UPDATE USING (
    admin_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for programs table
CREATE POLICY "Programs are viewable by community members" ON programs
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for milestones table
CREATE POLICY "Milestones are viewable by program participants" ON milestones
  FOR SELECT USING (
    program_id IN (
      SELECT p.program_id 
      FROM programs p 
      JOIN users u ON p.community_id = u.community_id 
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for achievements table
CREATE POLICY "Users can read own achievements" ON achievements
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own achievements" ON achievements
  FOR UPDATE USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for rewards table
CREATE POLICY "Users can read own rewards" ON rewards
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for interactions table
CREATE POLICY "Users can read own interactions" ON interactions
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own interactions" ON interactions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for impact_metrics table
CREATE POLICY "Impact metrics are viewable by community members" ON impact_metrics
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM users WHERE auth_user_id = auth.uid()
    ) OR program_id IN (
      SELECT p.program_id 
      FROM programs p 
      JOIN users u ON p.community_id = u.community_id 
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Create trigger functions
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.community_id IS NOT NULL THEN
      UPDATE communities 
      SET member_count = member_count + 1 
      WHERE community_id = NEW.community_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.community_id IS NOT NULL THEN
      UPDATE communities 
      SET member_count = member_count - 1 
      WHERE community_id = OLD.community_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.community_id IS DISTINCT FROM NEW.community_id THEN
      IF OLD.community_id IS NOT NULL THEN
        UPDATE communities 
        SET member_count = member_count - 1 
        WHERE community_id = OLD.community_id;
      END IF;
      IF NEW.community_id IS NOT NULL THEN
        UPDATE communities 
        SET member_count = member_count + 1 
        WHERE community_id = NEW.community_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_token_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE users 
    SET token_balance = token_balance + NEW.token_amount 
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_community_member_count
  AFTER INSERT OR DELETE OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

CREATE TRIGGER trigger_update_user_token_balance
  AFTER UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_user_token_balance();