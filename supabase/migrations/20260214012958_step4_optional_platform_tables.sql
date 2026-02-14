/*
  # STEP 4 - Optional Platform Tables

  Creates supporting tables for future features:
  1. audit_logs - Track system changes (ACTIVATED)
  2. notifications - User notification system (IN-APP ACTIVATED)
  3. program_members - Explicit program enrollment (ACTIVATED)
  4. files - File upload management (DORMANT)
  5. badges - Gamification badge definitions (DORMANT)
  6. user_badges - User badge achievements (DORMANT)
  7. analytics_events - User behavior tracking (DORMANT)
  8. comments - Social commenting system (DORMANT)

  All tables have RLS enabled and proper indexes.
  Activation controlled by feature flags.
*/

-- ============================================================
-- 1. AUDIT_LOGS TABLE (ACTIVATED)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  community_id UUID REFERENCES communities(community_id) ON DELETE CASCADE,
  before_json JSONB,
  after_json JSONB,
  request_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_community_id ON audit_logs(community_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community admins can view community audit logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 2. NOTIFICATIONS TABLE (IN-APP ACTIVATED)
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(community_id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_community_id ON notifications(community_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
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

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 3. PROGRAM_MEMBERS TABLE (ACTIVATED)
-- ============================================================

CREATE TABLE IF NOT EXISTS program_members (
  member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_program_members_program_id ON program_members(program_id);
CREATE INDEX IF NOT EXISTS idx_program_members_user_id ON program_members(user_id);
CREATE INDEX IF NOT EXISTS idx_program_members_status ON program_members(status);
CREATE INDEX IF NOT EXISTS idx_program_members_role ON program_members(role);

ALTER TABLE program_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view program members" ON program_members
  FOR SELECT
  TO authenticated
  USING (
    program_id IN (
      SELECT program_id FROM programs WHERE community_id = get_user_community_id()
    )
  );

CREATE POLICY "Users can join programs" ON program_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own membership" ON program_members
  FOR UPDATE
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

CREATE POLICY "Community admins can manage program members" ON program_members
  FOR ALL
  TO authenticated
  USING (
    is_community_admin() AND
    program_id IN (
      SELECT program_id FROM programs WHERE community_id = get_user_community_id()
    )
  );

-- ============================================================
-- 4. FILES TABLE (DORMANT)
-- ============================================================

CREATE TABLE IF NOT EXISTS files (
  file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(community_id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_community_id ON files(community_id);
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at DESC);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON files
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Community admins can view community files" ON files
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

CREATE POLICY "Users can upload files" ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own files" ON files
  FOR ALL
  TO authenticated
  USING (
    uploaded_by IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. BADGES TABLE (DORMANT)
-- ============================================================

CREATE TABLE IF NOT EXISTS badges (
  badge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(community_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
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
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(community_id, name)
);

CREATE INDEX IF NOT EXISTS idx_badges_community_id ON badges(community_id);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_is_active ON badges(is_active) WHERE is_active = true;

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view community badges" ON badges
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    community_id = get_user_community_id()
  );

CREATE POLICY "Community admins can manage badges" ON badges
  FOR ALL
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  )
  WITH CHECK (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

-- ============================================================
-- 6. USER_BADGES TABLE (DORMANT)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_badges (
  user_badge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_displayed BOOLEAN DEFAULT true NOT NULL,
  progress JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all earned badges" ON user_badges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own badge display" ON user_badges
  FOR UPDATE
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
-- 7. ANALYTICS_EVENTS TABLE (DORMANT)
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  community_id UUID REFERENCES communities(community_id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_community_id ON analytics_events(community_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Community admins can view community analytics" ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

CREATE POLICY "System can log analytics events" ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 8. COMMENTS TABLE (DORMANT)
-- ============================================================

CREATE TABLE IF NOT EXISTS comments (
  comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(community_id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_community_id ON comments(community_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view community comments" ON comments
  FOR SELECT
  TO authenticated
  USING (
    is_deleted = false AND
    community_id = get_user_community_id()
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE
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

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_program_members_updated_at ON program_members;
CREATE TRIGGER update_program_members_updated_at
  BEFORE UPDATE ON program_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_badges_updated_at ON badges;
CREATE TRIGGER update_badges_updated_at
  BEFORE UPDATE ON badges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-populate community_id in notifications
CREATE OR REPLACE FUNCTION set_notification_community_id()
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

DROP TRIGGER IF EXISTS trigger_set_notification_community_id ON notifications;
CREATE TRIGGER trigger_set_notification_community_id
  BEFORE INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_notification_community_id();

-- Auto-populate community_id in files
CREATE OR REPLACE FUNCTION set_file_community_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.community_id IS NULL THEN
    NEW.community_id := (
      SELECT u.community_id
      FROM users u
      WHERE u.user_id = NEW.uploaded_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_file_community_id ON files;
CREATE TRIGGER trigger_set_file_community_id
  BEFORE INSERT ON files
  FOR EACH ROW
  EXECUTE FUNCTION set_file_community_id();

-- Auto-populate community_id in comments
CREATE OR REPLACE FUNCTION set_comment_community_id()
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

DROP TRIGGER IF EXISTS trigger_set_comment_community_id ON comments;
CREATE TRIGGER trigger_set_comment_community_id
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION set_comment_community_id();

-- Auto-populate community_id in analytics_events
CREATE OR REPLACE FUNCTION set_analytics_event_community_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.community_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.community_id := (
      SELECT u.community_id
      FROM users u
      WHERE u.user_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_analytics_event_community_id ON analytics_events;
CREATE TRIGGER trigger_set_analytics_event_community_id
  BEFORE INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION set_analytics_event_community_id();
