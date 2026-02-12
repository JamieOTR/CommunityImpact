-- Users table for profile management
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    token_balance INTEGER DEFAULT 0,
    community_id UUID REFERENCES communities(community_id)
);

-- Communities table for organization management
CREATE TABLE communities (
    community_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    blockchain_address VARCHAR(42)
);

-- Programs table for tracking development initiatives
CREATE TABLE programs (
    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    community_id UUID REFERENCES communities(community_id),
    total_budget INTEGER,
    token_allocation INTEGER
);

-- Milestones table for achievement tracking
CREATE TABLE milestones (
    milestone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reward_amount INTEGER NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    program_id UUID REFERENCES programs(program_id),
    completion_criteria JSONB
);