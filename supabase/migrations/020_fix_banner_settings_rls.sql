-- Fix RLS policies for banner_settings table to use auth.jwt() instead of auth.users
-- This fixes "permission denied for table users" errors

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can update banner settings" ON banner_settings;
DROP POLICY IF EXISTS "Admins can insert banner settings" ON banner_settings;

-- Recreate policies using auth.jwt() to access user metadata
CREATE POLICY "Admins can update banner settings"
  ON banner_settings FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admins can insert banner settings"
  ON banner_settings FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

