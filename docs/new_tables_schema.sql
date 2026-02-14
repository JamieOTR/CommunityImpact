-- ============================================================
-- NEW TABLES SQL SCHEMA
-- ============================================================
-- This file contains CREATE TABLE statements for 8 new recommended tables
-- to enhance the Community Impact Tracker platform
-- ============================================================

-- ============================================================
-- 1. AUDIT_LOGS TABLE
-- ============================================================
-- Tracks all system changes for security, compliance, and debugging
-- Records who did what, when, and what changed

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'verify', 'approve', 'reject')),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================
-- 2. NOTIFICATIONS TABLE
-- ============================================================
-- Manages user notifications for achievements, rewards, and system messages

CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('achievement', 'reward', 'message', 'system', 'milestone', 'community', 'verification', 'reminder')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMPTZ,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================
-- 3. COMMENTS TABLE
-- ============================================================
-- Social commenting system for achievements, programs, and milestones

CREATE TABLE IF NOT EXISTS comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('achievement', 'program', 'milestone', 'community', 'user')),
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  is_edited BOOLEAN DEFAULT false NOT NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-deleted comments"
  ON comments FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 4. BADGES TABLE
-- ============================================================
-- Defines available badges for gamification

CREATE TABLE IF NOT EXISTS badges (
  badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  criteria JSONB NOT NULL,
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  points_value INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_is_active ON badges(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges"
  ON badges FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage badges"
  ON badges FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.is_admin = true
    )
  );


-- ============================================================
-- 5. USER_BADGES TABLE
-- ============================================================
-- Tracks which users have earned which badges

CREATE TABLE IF NOT EXISTS user_badges (
  user_badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_displayed BOOLEAN DEFAULT true NOT NULL,
  progress JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- RLS Policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all earned badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can award badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own badge display settings"
  ON user_badges FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 6. PROGRAM_MEMBERS TABLE
-- ============================================================
-- Explicit program membership and participation tracking

CREATE TABLE IF NOT EXISTS program_members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'participant' CHECK (role IN ('participant', 'coordinator', 'mentor', 'viewer')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'dropped', 'suspended')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  dropped_at TIMESTAMPTZ,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  milestones_completed INTEGER DEFAULT 0,
  tokens_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(program_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_program_members_program_id ON program_members(program_id);
CREATE INDEX IF NOT EXISTS idx_program_members_user_id ON program_members(user_id);
CREATE INDEX IF NOT EXISTS idx_program_members_status ON program_members(status);
CREATE INDEX IF NOT EXISTS idx_program_members_role ON program_members(role);

-- RLS Policies
ALTER TABLE program_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view program members"
  ON program_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join programs"
  ON program_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own membership"
  ON program_members FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and coordinators can manage members"
  ON program_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.is_admin = true
    )
    OR
    EXISTS (
      SELECT 1 FROM program_members pm
      JOIN users u ON u.user_id = pm.user_id
      WHERE pm.program_id = program_members.program_id
      AND u.auth_user_id = auth.uid()
      AND pm.role IN ('coordinator', 'mentor')
    )
  );


-- ============================================================
-- 7. ANALYTICS_EVENTS TABLE
-- ============================================================
-- Tracks user behavior and interactions for analytics

CREATE TABLE IF NOT EXISTS analytics_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  session_id UUID,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  event_data JSONB,
  page_url TEXT,
  referrer TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  ip_address INET,
  country VARCHAR(2),
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "System can log analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================
-- 8. FILES TABLE
-- ============================================================
-- Manages file uploads and attachments

CREATE TABLE IF NOT EXISTS files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  entity_type VARCHAR(50),
  entity_id UUID,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'quarantined')),
  virus_scanned BOOLEAN DEFAULT false,
  virus_scan_result VARCHAR(50),
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at DESC);

-- RLS Policies
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  TO authenticated
  USING (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Users can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own files"
  ON files FOR UPDATE
  TO authenticated
  USING (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  TO authenticated
  USING (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_members_updated_at BEFORE UPDATE ON program_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SUMMARY
-- ============================================================
-- Tables Created:
-- 1. audit_logs - Security and compliance tracking
-- 2. notifications - User engagement and alerts
-- 3. comments - Social features and community interaction
-- 4. badges - Gamification system definitions
-- 5. user_badges - User badge achievements
-- 6. program_members - Explicit program participation
-- 7. analytics_events - User behavior tracking
-- 8. files - File upload and management
--
-- All tables include:
-- - Proper primary keys and foreign keys
-- - Appropriate indexes for performance
-- - Row Level Security (RLS) enabled
-- - Security policies for authentication
-- - Created_at timestamps
-- - Data validation via CHECK constraints
-- ============================================================
