/*
  # Add Admin Role Support to Users Table

  1. Changes
    - Add `is_admin` boolean column to users table
    - Default value is false for all users
    - Add policies for admin users to manage programs, milestones, and achievements

  2. Security
    - Admin users can view all data in their community
    - Admin users can create/update programs and milestones
    - Admin users can verify achievements
    - Regular users maintain existing permissions
*/

-- Add is_admin column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add RLS policies for admin users to create programs
CREATE POLICY "Community admins can create programs" ON programs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN communities c ON c.community_id = programs.community_id
      WHERE u.auth_user_id = auth.uid() 
      AND (u.is_admin = true OR c.admin_id = u.user_id)
    )
  );

CREATE POLICY "Community admins can update programs" ON programs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN communities c ON c.community_id = programs.community_id
      WHERE u.auth_user_id = auth.uid() 
      AND (u.is_admin = true OR c.admin_id = u.user_id)
    )
  );

-- Add RLS policies for admin users to create milestones
CREATE POLICY "Community admins can create milestones" ON milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN programs p ON p.program_id = milestones.program_id
      JOIN communities c ON c.community_id = p.community_id
      WHERE u.auth_user_id = auth.uid() 
      AND (u.is_admin = true OR c.admin_id = u.user_id)
    )
  );

CREATE POLICY "Community admins can update milestones" ON milestones
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN programs p ON p.program_id = milestones.program_id
      JOIN communities c ON c.community_id = p.community_id
      WHERE u.auth_user_id = auth.uid() 
      AND (u.is_admin = true OR c.admin_id = u.user_id)
    )
  );

-- Add RLS policies for admin users to view and verify all achievements in their community
CREATE POLICY "Community admins can view all achievements" ON achievements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      JOIN users achievement_user ON achievement_user.user_id = achievements.user_id
      WHERE admin_user.auth_user_id = auth.uid() 
      AND admin_user.community_id = achievement_user.community_id
      AND admin_user.is_admin = true
    )
  );

CREATE POLICY "Community admins can update achievement verification" ON achievements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      JOIN users achievement_user ON achievement_user.user_id = achievements.user_id
      WHERE admin_user.auth_user_id = auth.uid() 
      AND admin_user.community_id = achievement_user.community_id
      AND admin_user.is_admin = true
    )
  );

-- Add RLS policy for admin users to create rewards
CREATE POLICY "Community admins can create rewards" ON rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      JOIN users reward_user ON reward_user.user_id = rewards.user_id
      WHERE admin_user.auth_user_id = auth.uid() 
      AND admin_user.community_id = reward_user.community_id
      AND admin_user.is_admin = true
    )
  );

-- Add RLS policy for admin users to view all rewards in their community
CREATE POLICY "Community admins can view all rewards" ON rewards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      JOIN users reward_user ON reward_user.user_id = rewards.user_id
      WHERE admin_user.auth_user_id = auth.uid() 
      AND admin_user.community_id = reward_user.community_id
      AND admin_user.is_admin = true
    )
  );

-- Add RLS policy for admin users to view all community members
CREATE POLICY "Community admins can view all members" ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.auth_user_id = auth.uid()
      AND admin_user.community_id = users.community_id
      AND admin_user.is_admin = true
    )
  );

-- Add RLS policy for admin users to view impact metrics
CREATE POLICY "Community admins can manage impact metrics" ON impact_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.auth_user_id = auth.uid()
      AND admin_user.community_id = impact_metrics.community_id
      AND admin_user.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.auth_user_id = auth.uid()
      AND admin_user.community_id = impact_metrics.community_id
      AND admin_user.is_admin = true
    )
  );