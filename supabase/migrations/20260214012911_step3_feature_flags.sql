/*
  # STEP 3 - Feature Flags

  Creates feature_flags table to control deferred modules.
  Enables controlled activation of optional platform features.

  Flags initialized:
  - Enabled now: audit_logs, program_members, notifications_in_app
  - Disabled (deferred): files, comments, badges, analytics_events, notifications_email, notifications_sms
*/

-- ============================================================
-- FEATURE FLAGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  flag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key VARCHAR(100) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false NOT NULL,
  environment VARCHAR(50) DEFAULT 'prod',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Super admins can view and manage feature flags
CREATE POLICY "Super admins can view feature flags" ON feature_flags
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can manage feature flags" ON feature_flags
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- All authenticated users can read flags (needed for app logic)
CREATE POLICY "Users can read feature flags" ON feature_flags
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled) WHERE enabled = true;

-- ============================================================
-- INITIALIZE DEFAULT FLAGS
-- ============================================================

-- Insert default flags (using ON CONFLICT to make migration idempotent)
INSERT INTO feature_flags (flag_key, enabled, environment, description) VALUES
  ('enable_audit_logs', true, 'prod', 'Enable audit logging for core operations'),
  ('enable_program_members', true, 'prod', 'Enable explicit program membership tracking'),
  ('enable_notifications_in_app', true, 'prod', 'Enable in-app notifications'),
  ('enable_files', false, 'prod', 'Enable file upload and management'),
  ('enable_comments', false, 'prod', 'Enable commenting system'),
  ('enable_badges', false, 'prod', 'Enable gamification badges'),
  ('enable_user_badges', false, 'prod', 'Enable user badge achievements'),
  ('enable_analytics_events', false, 'prod', 'Enable detailed analytics event tracking'),
  ('enable_notifications_email', false, 'prod', 'Enable email notifications'),
  ('enable_notifications_sms', false, 'prod', 'Enable SMS notifications')
ON CONFLICT (flag_key) DO UPDATE SET
  updated_at = now();

-- ============================================================
-- HELPER FUNCTION TO CHECK FEATURE FLAGS
-- ============================================================

CREATE OR REPLACE FUNCTION is_feature_enabled(flag_name VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT enabled
    FROM feature_flags
    WHERE flag_key = flag_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
