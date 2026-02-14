/*
  # Enable Realtime Subscriptions for Admin Queues

  1. Changes
    - Enable realtime for achievements table
    - Enable realtime for rewards table
    
  2. Purpose
    - Allow admin dashboard to receive live updates when:
      - New achievement submissions arrive
      - Achievement verification status changes
      - New rewards are created
      - Reward distribution status changes
    
  3. Security
    - Realtime follows existing RLS policies
    - Only authenticated admins in the same community will receive updates
*/

-- Enable realtime for achievements table
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;

-- Enable realtime for rewards table
ALTER PUBLICATION supabase_realtime ADD TABLE rewards;
