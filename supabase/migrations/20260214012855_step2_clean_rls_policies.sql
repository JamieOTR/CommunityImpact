/*
  # STEP 2 - Clean RLS Blueprint

  Implements maintainable Row Level Security model:
  - Community-scoped access using community_id
  - Role-based overrides (community_admin, super_admin)
  - Simple, maintainable policies
  - Preserves existing auth flows

  Security Model:
  - Default: Users can only access records in their community
  - community_admin: Manage all records in their community
  - super_admin: Bypass and manage everything
*/

-- ============================================================
-- HELPER FUNCTION FOR ROLE CHECKS
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
BEGIN
  RETURN (
    SELECT role
    FROM users
    WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_community_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT community_id
    FROM users
    WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin'
    FROM users
    WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_community_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('community_admin', 'super_admin')
    FROM users
    WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- USERS TABLE RLS (Keep existing + add admin overrides)
-- ============================================================

-- Drop existing policies to recreate cleanly
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Community admins can read users in their community
CREATE POLICY "Community admins can read community users" ON users
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

-- Super admins can read all users
CREATE POLICY "Super admins can read all users" ON users
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Community admins can update users in their community
CREATE POLICY "Community admins can update community users" ON users
  FOR UPDATE
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
-- COMMUNITIES TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Communities are viewable by members" ON communities;
DROP POLICY IF EXISTS "Community admins can update communities" ON communities;

-- Members can view their community
CREATE POLICY "Members can view own community" ON communities
  FOR SELECT
  TO authenticated
  USING (community_id = get_user_community_id());

-- Community admins can update their community
CREATE POLICY "Community admins can update own community" ON communities
  FOR UPDATE
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  )
  WITH CHECK (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

-- Super admins can manage all communities
CREATE POLICY "Super admins can manage all communities" ON communities
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Allow community creation
CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- PROGRAMS TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Programs are viewable by community members" ON programs;

-- Community members can view programs in their community
CREATE POLICY "Members can view community programs" ON programs
  FOR SELECT
  TO authenticated
  USING (community_id = get_user_community_id());

-- Super admins can view all programs
CREATE POLICY "Super admins can view all programs" ON programs
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Community admins can manage programs in their community
CREATE POLICY "Community admins can manage community programs" ON programs
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
-- MILESTONES TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Milestones are viewable by program participants" ON milestones;

-- Community members can view milestones in their community programs
CREATE POLICY "Members can view community milestones" ON milestones
  FOR SELECT
  TO authenticated
  USING (
    program_id IN (
      SELECT program_id
      FROM programs
      WHERE community_id = get_user_community_id()
    )
  );

-- Super admins can view all milestones
CREATE POLICY "Super admins can view all milestones" ON milestones
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Community admins can manage milestones in their community
CREATE POLICY "Community admins can manage community milestones" ON milestones
  FOR ALL
  TO authenticated
  USING (
    is_community_admin() AND
    program_id IN (
      SELECT program_id
      FROM programs
      WHERE community_id = get_user_community_id()
    )
  )
  WITH CHECK (
    is_community_admin() AND
    program_id IN (
      SELECT program_id
      FROM programs
      WHERE community_id = get_user_community_id()
    )
  );

-- ============================================================
-- ACHIEVEMENTS TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Users can read own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON achievements;

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Community admins can view all achievements in their community
CREATE POLICY "Community admins can view community achievements" ON achievements
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

-- Super admins can view all achievements
CREATE POLICY "Super admins can view all achievements" ON achievements
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Users can submit their own achievements
CREATE POLICY "Users can submit own achievements" ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update their own pending achievements
CREATE POLICY "Users can update own pending achievements" ON achievements
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    ) AND
    verification_status = 'pending'
  )
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Community admins can manage achievements in their community
CREATE POLICY "Community admins can manage community achievements" ON achievements
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
-- REWARDS TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Users can read own rewards" ON rewards;

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Community admins can view rewards in their community
CREATE POLICY "Community admins can view community rewards" ON rewards
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

-- Super admins can view all rewards
CREATE POLICY "Super admins can view all rewards" ON rewards
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Community admins can manage rewards in their community
CREATE POLICY "Community admins can manage community rewards" ON rewards
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
-- INTERACTIONS TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Users can read own interactions" ON interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON interactions;

-- Users can view their own interactions
CREATE POLICY "Users can view own interactions" ON interactions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Community admins can view interactions in their community
CREATE POLICY "Community admins can view community interactions" ON interactions
  FOR SELECT
  TO authenticated
  USING (
    is_community_admin() AND
    community_id = get_user_community_id()
  );

-- Users can create their own interactions
CREATE POLICY "Users can create own interactions" ON interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- IMPACT_METRICS TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Impact metrics are viewable by community members" ON impact_metrics;

-- Community members can view metrics in their community
CREATE POLICY "Members can view community metrics" ON impact_metrics
  FOR SELECT
  TO authenticated
  USING (community_id = get_user_community_id());

-- Super admins can view all metrics
CREATE POLICY "Super admins can view all metrics" ON impact_metrics
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Community admins can manage metrics in their community
CREATE POLICY "Community admins can manage community metrics" ON impact_metrics
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
