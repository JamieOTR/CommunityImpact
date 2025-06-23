/*
  # Initial Database Schema for AI-Powered Community Impact Tracker

  1. New Tables
    - `users` - User profiles and authentication data
    - `communities` - Community organizations and groups
    - `programs` - Community development programs
    - `milestones` - Achievement milestones within programs
    - `achievements` - User milestone completions
    - `rewards` - Token rewards for achievements
    - `interactions` - AI chat interactions
    - `impact_metrics` - Program impact measurements

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for community admins to manage their communities
    - Add policies for public read access where appropriate

  3. Functions
    - Update user token balance on reward distribution
    - Calculate impact metrics
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for profile management
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    token_balance INTEGER DEFAULT 0,
    total_impact_score INTEGER DEFAULT 0,
    community_id UUID,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Communities table for organization management
CREATE TABLE IF NOT EXISTS communities (
    community_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blockchain_address VARCHAR(42),
    member_count INTEGER DEFAULT 0
);

-- Programs table for tracking development initiatives
CREATE TABLE IF NOT EXISTS programs (
    program_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    community_id UUID REFERENCES communities(community_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_budget INTEGER,
    token_allocation INTEGER,
    participant_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused'))
);

-- Milestones table for achievement tracking
CREATE TABLE IF NOT EXISTS milestones (
    milestone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reward_amount INTEGER NOT NULL,
    reward_token VARCHAR(10) DEFAULT 'IMPACT',
    verification_type VARCHAR(50) NOT NULL,
    program_id UUID REFERENCES programs(program_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_criteria JSONB,
    category VARCHAR(50),
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    deadline TIMESTAMP WITH TIME ZONE,
    requirements TEXT[]
);

-- Achievements table for tracking user completions
CREATE TABLE IF NOT EXISTS achievements (
    achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) NOT NULL,
    milestone_id UUID REFERENCES milestones(milestone_id) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evidence_hash TEXT,
    evidence_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    transaction_hash VARCHAR(66),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in-progress', 'submitted', 'verified', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards table for token distribution tracking
CREATE TABLE IF NOT EXISTS rewards (
    reward_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) NOT NULL,
    achievement_id UUID REFERENCES achievements(achievement_id),
    token_amount INTEGER NOT NULL,
    token_type VARCHAR(10) DEFAULT 'IMPACT',
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    description TEXT
);

-- Interactions table for AI chat history
CREATE TABLE IF NOT EXISTS interactions (
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) NOT NULL,
    message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context_type VARCHAR(50),
    session_id UUID
);

-- Impact metrics table for program measurement
CREATE TABLE IF NOT EXISTS impact_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(program_id),
    community_id UUID REFERENCES communities(community_id),
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    target_value DECIMAL(10,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for community_id in users table
ALTER TABLE users ADD CONSTRAINT fk_users_community 
    FOREIGN KEY (community_id) REFERENCES communities(community_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- RLS Policies for communities table
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

-- RLS Policies for programs table
CREATE POLICY "Programs are viewable by community members" ON programs
    FOR SELECT USING (
        community_id IN (
            SELECT community_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- RLS Policies for milestones table
CREATE POLICY "Milestones are viewable by program participants" ON milestones
    FOR SELECT USING (
        program_id IN (
            SELECT p.program_id FROM programs p
            JOIN users u ON p.community_id = u.community_id
            WHERE u.auth_user_id = auth.uid()
        )
    );

-- RLS Policies for achievements table
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

-- RLS Policies for rewards table
CREATE POLICY "Users can read own rewards" ON rewards
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- RLS Policies for interactions table
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

-- RLS Policies for impact_metrics table
CREATE POLICY "Impact metrics are viewable by community members" ON impact_metrics
    FOR SELECT USING (
        community_id IN (
            SELECT community_id FROM users WHERE auth_user_id = auth.uid()
        ) OR
        program_id IN (
            SELECT p.program_id FROM programs p
            JOIN users u ON p.community_id = u.community_id
            WHERE u.auth_user_id = auth.uid()
        )
    );

-- Functions for updating user stats
CREATE OR REPLACE FUNCTION update_user_token_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE users 
        SET token_balance = token_balance + NEW.token_amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating user token balance
CREATE TRIGGER trigger_update_user_token_balance
    AFTER UPDATE ON rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_user_token_balance();

-- Function to update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.community_id IS NOT NULL THEN
        UPDATE communities 
        SET member_count = member_count + 1
        WHERE community_id = NEW.community_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.community_id != NEW.community_id THEN
        -- User changed communities
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
    ELSIF TG_OP = 'DELETE' AND OLD.community_id IS NOT NULL THEN
        UPDATE communities 
        SET member_count = member_count - 1
        WHERE community_id = OLD.community_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating community member count
CREATE TRIGGER trigger_update_community_member_count
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_count();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_community_id ON users(community_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_milestone_id ON achievements(milestone_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_program_id ON milestones(program_id);
CREATE INDEX IF NOT EXISTS idx_programs_community_id ON programs(community_id);