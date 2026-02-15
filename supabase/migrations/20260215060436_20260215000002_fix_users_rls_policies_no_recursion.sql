/*
  # Fix Users Table RLS Policies to Prevent Recursion

  1. Overview
    - Rewrites all RLS policies on public.users table to eliminate recursion
    - Removes policies that directly or indirectly query users table
    - Uses safe helper functions from previous migration that bypass RLS internally

  2. Changes
    - Drops all existing recursive policies on users table
    - Creates new non-recursive policies using safe helper functions
    - Maintains RLS security while preventing error 42P17 (infinite recursion)

  3. New Policies
    A) Users can view own profile - User reads their own row via auth.uid()
    B) Users can update own profile - User updates their own row via auth.uid()
    C) Community admins can view users in their community - Uses safe helper
    D) Super admin can update users - Uses safe helper for role check

  4. Security
    - RLS remains enabled on users table
    - All policies enforce proper authentication and authorization
    - No policy references users table directly (preventing recursion)
*/

-- Ensure RLS is enabled on users table
alter table public.users enable row level security;

-- Drop all existing policies that may cause recursion
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Admins can view users" on public.users;
drop policy if exists "Admins can update users" on public.users;
drop policy if exists "Super admins can read all users" on public.users;
drop policy if exists "Super admin can update users" on public.users;
drop policy if exists "Community admins can view users in their community" on public.users;
drop policy if exists "Community admins can manage users" on public.users;

-- Policy A: User can read their own profile row
-- Safe because it only checks auth.uid() = auth_user_id (no users table query)
create policy "Users can view own profile"
on public.users
for select
to authenticated
using (auth.uid() = auth_user_id);

-- Policy B: User can update their own profile row
-- Safe because it only checks auth.uid() = auth_user_id (no users table query)
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

-- Policy C: Community admins can view users in their community
-- Safe because is_community_admin() and current_user_community_id() use SECURITY DEFINER with row_security = off
create policy "Community admins can view users in their community"
on public.users
for select
to authenticated
using (
  public.is_community_admin()
  and community_id = public.current_user_community_id()
);

-- Policy D: Super admin can read all users
-- Safe because is_super_admin() uses SECURITY DEFINER with row_security = off
create policy "Super admins can read all users"
on public.users
for select
to authenticated
using (public.is_super_admin());

-- Policy E: Super admin can update any user
-- Safe because is_super_admin() uses SECURITY DEFINER with row_security = off
create policy "Super admin can update users"
on public.users
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());