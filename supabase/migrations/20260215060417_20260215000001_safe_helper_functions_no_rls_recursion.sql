/*
  # Safe Helper Functions to Prevent RLS Recursion

  1. Overview
    - Creates/replaces helper functions that bypass RLS internally using SECURITY DEFINER
    - Prevents infinite recursion (error 42P17) when users table policies reference users table
    - Sets row_security = off within function scope to safely query users without triggering RLS

  2. New Functions
    - `current_user_role()` - Returns the role of the currently authenticated user
    - `current_user_community_id()` - Returns the community_id of the currently authenticated user
    - `is_super_admin()` - Returns true if current user is a super_admin
    - `is_community_admin()` - Returns true if current user is community_admin or super_admin

  3. Security
    - All functions use SECURITY DEFINER to execute with elevated privileges
    - Row security is disabled within function scope to prevent recursion
    - Search path is explicitly set to public schema
    - Functions granted to authenticated role only

  4. Purpose
    - These functions are safe to use in RLS policies on public.users
    - They do not trigger RLS checks when querying users table internally
    - Enables proper role-based access control without recursion errors
*/

-- Function to get current user's role without triggering RLS
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select u.role
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

-- Function to get current user's community_id without triggering RLS
create or replace function public.current_user_community_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select u.community_id
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

-- Function to check if current user is super admin
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

-- Function to check if current user is community admin or super admin
create or replace function public.is_community_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(public.current_user_role() in ('community_admin','super_admin'), false)
$$;

-- Grant execute permissions to authenticated users
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_community_id() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_community_admin() to authenticated;