/*
  # STEP 1 - Core Table Upgrades

  Adds missing high-value columns to existing 8 tables for operational trust and accountability.

  1. Users Table - Role and account status tracking
  2. Communities Table - Ownership and privacy controls
  3. Programs Table - Governance and eligibility
  4. Milestones Table - Evidence and verification controls
  5. Achievements Table - Verification accountability
  6. Rewards Table - Payment tracking
  7. Interactions Table - AI usage tracking
  8. Impact Metrics Table - Program-specific tracking
*/

-- ============================================================
-- 1. USERS TABLE UPGRADES
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('member', 'community_admin', 'super_admin'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_status_check;
ALTER TABLE users ADD CONSTRAINT users_account_status_check CHECK (account_status IN ('active', 'suspended', 'banned', 'pending'));

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status) WHERE account_status != 'active';

-- ============================================================
-- 2. COMMUNITIES TABLE UPGRADES
-- ============================================================

ALTER TABLE communities ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(user_id);
ALTER TABLE communities ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE communities ADD COLUMN IF NOT EXISTS privacy_level VARCHAR(50) DEFAULT 'public';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE communities DROP CONSTRAINT IF EXISTS communities_status_check;
ALTER TABLE communities ADD CONSTRAINT communities_status_check CHECK (status IN ('active', 'paused', 'archived'));

ALTER TABLE communities DROP CONSTRAINT IF EXISTS communities_privacy_level_check;
ALTER TABLE communities ADD CONSTRAINT communities_privacy_level_check CHECK (privacy_level IN ('public', 'private', 'invite_only'));

CREATE INDEX IF NOT EXISTS idx_communities_owner_user_id ON communities(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_communities_status ON communities(status) WHERE status = 'active';

-- ============================================================
-- 3. PROGRAMS TABLE UPGRADES
-- ============================================================

ALTER TABLE programs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(user_id);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS coordinator_id UUID REFERENCES users(user_id);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_type VARCHAR(100);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS eligibility_rules JSONB DEFAULT '{}'::jsonb;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_status_check;
ALTER TABLE programs ADD CONSTRAINT programs_status_check CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived'));

CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs(created_by);
CREATE INDEX IF NOT EXISTS idx_programs_coordinator_id ON programs(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status) WHERE status IN ('active', 'draft');
CREATE INDEX IF NOT EXISTS idx_programs_community_status ON programs(community_id, status);

-- ============================================================
-- 4. MILESTONES TABLE UPGRADES
-- ============================================================

ALTER TABLE milestones ADD COLUMN IF NOT EXISTS milestone_type VARCHAR(100);
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS evidence_type VARCHAR(50) DEFAULT 'mixed';
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS min_evidence_items INTEGER DEFAULT 1;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS verification_mode VARCHAR(50) DEFAULT 'admin';
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS max_submissions_per_user INTEGER;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS sequence_order INTEGER;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2) DEFAULT 1.0;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_evidence_type_check;
ALTER TABLE milestones ADD CONSTRAINT milestones_evidence_type_check CHECK (evidence_type IN ('text', 'url', 'file', 'mixed'));

ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_verification_mode_check;
ALTER TABLE milestones ADD CONSTRAINT milestones_verification_mode_check CHECK (verification_mode IN ('admin', 'auto', 'peer'));

ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_status_check;
ALTER TABLE milestones ADD CONSTRAINT milestones_status_check CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived'));

CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_milestones_program_status ON milestones(program_id, status);
CREATE INDEX IF NOT EXISTS idx_milestones_sequence ON milestones(program_id, sequence_order);

-- ============================================================
-- 5. ACHIEVEMENTS TABLE UPGRADES (HIGHEST PRIORITY)
-- ============================================================

ALTER TABLE achievements ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(user_id);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS evidence_payload JSONB DEFAULT '{}'::jsonb;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS risk_score NUMERIC(5,2) DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(community_id);

ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_source_check;
ALTER TABLE achievements ADD CONSTRAINT achievements_source_check CHECK (source IN ('web', 'mobile', 'import'));

CREATE INDEX IF NOT EXISTS idx_achievements_verified_by ON achievements(verified_by);
CREATE INDEX IF NOT EXISTS idx_achievements_verification_status ON achievements(verification_status) WHERE verification_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_achievements_community_id ON achievements(community_id);
CREATE INDEX IF NOT EXISTS idx_achievements_community_status ON achievements(community_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_achievements_user_milestone ON achievements(user_id, milestone_id);

-- ============================================================
-- 6. REWARDS TABLE UPGRADES (HIGHEST PRIORITY)
-- ============================================================

ALTER TABLE rewards ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(user_id);
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS tx_hash TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS network VARCHAR(50);
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS error_code VARCHAR(100);
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS payout_batch_id UUID;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(community_id);
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_rewards_approved_by ON rewards(approved_by);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON rewards(status) WHERE status IN ('pending', 'failed');
CREATE INDEX IF NOT EXISTS idx_rewards_community_id ON rewards(community_id);
CREATE INDEX IF NOT EXISTS idx_rewards_community_status ON rewards(community_id, status);
CREATE INDEX IF NOT EXISTS idx_rewards_payout_batch_id ON rewards(payout_batch_id) WHERE payout_batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rewards_achievement_id ON rewards(achievement_id);

-- ============================================================
-- 7. INTERACTIONS TABLE UPGRADES
-- ============================================================

ALTER TABLE interactions ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS tokens_in INTEGER;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS tokens_out INTEGER;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS latency_ms INTEGER;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS outcome_tag VARCHAR(100);
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(community_id);

CREATE INDEX IF NOT EXISTS idx_interactions_community_id ON interactions(community_id);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp DESC);

-- ============================================================
-- 8. IMPACT_METRICS TABLE UPGRADES
-- ============================================================

ALTER TABLE impact_metrics ADD COLUMN IF NOT EXISTS metric_category VARCHAR(100);
ALTER TABLE impact_metrics ADD COLUMN IF NOT EXISTS snapshot_version INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_impact_metrics_program_id ON impact_metrics(program_id);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_community_id ON impact_metrics(community_id);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_category ON impact_metrics(metric_category);

-- ============================================================
-- HELPER FUNCTIONS FOR AUTOMATION
-- ============================================================

CREATE OR REPLACE FUNCTION set_achievement_community_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.community_id IS NULL THEN
    NEW.community_id := (
      SELECT u.community_id
      FROM users u
      WHERE u.user_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_achievement_community_id ON achievements;
CREATE TRIGGER trigger_set_achievement_community_id
  BEFORE INSERT ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION set_achievement_community_id();

CREATE OR REPLACE FUNCTION set_reward_community_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.community_id IS NULL THEN
    NEW.community_id := (
      SELECT u.community_id
      FROM users u
      WHERE u.user_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_reward_community_id ON rewards;
CREATE TRIGGER trigger_set_reward_community_id
  BEFORE INSERT ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION set_reward_community_id();

CREATE OR REPLACE FUNCTION set_interaction_community_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.community_id IS NULL THEN
    NEW.community_id := (
      SELECT u.community_id
      FROM users u
      WHERE u.user_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_interaction_community_id ON interactions;
CREATE TRIGGER trigger_set_interaction_community_id
  BEFORE INSERT ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION set_interaction_community_id();
