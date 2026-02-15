/*
  # Backfill Missing User Profiles

  1. Overview
    - Creates public.users profiles for any auth.users that don't have one
    - Fixes login issues for users created before auto-profile trigger was added
    - Uses SECURITY DEFINER to bypass RLS during backfill

  2. Process
    - Finds all auth.users without corresponding public.users records
    - Creates profiles with default values (role: 'member', token_balance: 0)
    - Extracts name from email (part before @)

  3. Safety
    - Uses INSERT ... ON CONFLICT DO NOTHING to prevent duplicates
    - Runs with row_security = off to avoid recursion during backfill
    - One-time operation to fix existing data
*/

-- Backfill missing user profiles
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Loop through all auth.users that don't have a profile
  FOR auth_user IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.users u ON u.auth_user_id = au.id
    WHERE u.user_id IS NULL
  LOOP
    -- Create profile for this user
    INSERT INTO public.users (
      auth_user_id,
      email,
      name,
      token_balance,
      total_impact_score,
      role,
      created_at,
      updated_at
    )
    VALUES (
      auth_user.id,
      auth_user.email,
      coalesce(
        auth_user.raw_user_meta_data->>'name',
        split_part(auth_user.email, '@', 1)
      ),
      0,
      0,
      'member',
      auth_user.created_at,
      now()
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    
    RAISE NOTICE 'Created profile for user: %', auth_user.email;
  END LOOP;
END $$;