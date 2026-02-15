/*
  # Auto-Create User Profile on Auth Signup

  1. Overview
    - Creates a trigger to automatically insert a row in public.users when a new auth.users row is created
    - Ensures every authenticated user has a corresponding profile in public.users
    - Prevents login failures due to missing user profile rows

  2. New Components
    - `handle_new_user()` function - Creates user profile row from auth.users data
    - Trigger on auth.users INSERT that calls handle_new_user()

  3. Security
    - Function uses SECURITY DEFINER to bypass RLS when creating user profile
    - Row security is disabled within function scope to avoid recursion
    - Ensures new users can immediately access their profile after signup

  4. Default Values
    - name: Extracted from email (part before @) or raw_user_meta_data
    - token_balance: 0
    - total_impact_score: 0
    - role: 'member' (default role for new users)
*/

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  -- Insert new user profile when auth.users row is created
  insert into public.users (
    auth_user_id,
    email,
    name,
    token_balance,
    total_impact_score,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    0,
    0,
    'member',
    now(),
    now()
  );
  
  return new;
exception
  when others then
    -- Log error but don't fail auth signup
    raise warning 'Failed to create user profile for %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Drop trigger if it exists (to ensure clean recreation)
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger on auth.users INSERT
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Ensure the trigger function can be executed by the service role
grant execute on function public.handle_new_user() to service_role;