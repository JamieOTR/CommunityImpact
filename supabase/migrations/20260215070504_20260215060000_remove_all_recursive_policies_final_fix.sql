/*
  # Remove All Recursive Policies - Final Fix

  1. Overview
    - Drops ALL existing policies on users table (including recursive ones)
    - Re-creates ONLY the safe non-recursive policies
    - Ensures no policy references users table directly or indirectly

  2. Problem Policies Being Removed
    - "Community admins can view all members" - Has recursive EXISTS subquery on users
    - "Community admins can read community users" - Uses old get_user_community_id() without row_security = off
    - "Community admins can update community users" - Same issue
    - Duplicate "Users can read own profile" and "Users can view own profile"

  3. Safe Policies Being Created
    - Uses only auth.uid() for user access (no users table query)
    - Uses new safe helper functions (current_user_role, current_user_community_id, is_super_admin, is_community_admin)
    - These helpers have row_security = off so they don't trigger RLS

  4. Security
    - RLS remains enabled on users table
    - All policies enforce proper authentication and authorization
    - Zero recursion risk
*/

-- Drop ALL existing policies on users table
drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Admins can view users" on public.users;
drop policy if exists "Admins can update users" on public.users;
drop policy if exists "Super admins can read all users" on public.users;
drop policy if exists "Super admin can update users" on public.users;
drop policy if exists "Community admins can view users in their community" on public.users;
drop policy if exists "Community admins can view all members" on public.users;
drop policy if exists "Community admins can read community users" on public.users;
drop policy if exists "Community admins can update community users" on public.users;
drop policy if exists "Community admins can manage users" on public.users;

-- Ensure RLS is enabled
alter table public.users enable row level security;

-- SAFE Policy 1: User can read their own profile
-- Safe: Only checks auth.uid() = auth_user_id (no users table query)
create policy "Users can view own profile"
on public.users
for select
to authenticated
using (auth.uid() = auth_user_id);

-- SAFE Policy 2: User can update their own profile
-- Safe: Only checks auth.uid() = auth_user_id (no users table query)
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

-- SAFE Policy 3: User can insert their own profile
-- Safe: Only checks auth.uid() = auth_user_id (no users table query)
create policy "Users can insert own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = auth_user_id);

-- SAFE Policy 4: Community admins can view users in their community
-- Safe: is_community_admin() and current_user_community_id() use row_security = off internally
create policy "Community admins can view users in their community"
on public.users
for select
to authenticated
using (
  public.is_community_admin()
  and community_id = public.current_user_community_id()
);

-- SAFE Policy 5: Super admins can read all users
-- Safe: is_super_admin() uses row_security = off internally
create policy "Super admins can read all users"
on public.users
for select
to authenticated
using (public.is_super_admin());

-- SAFE Policy 6: Super admins can update any user
-- Safe: is_super_admin() uses row_security = off internally
create policy "Super admin can update users"
on public.users
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());