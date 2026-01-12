-- Fix RLS policies for product_categories table to use auth.jwt() instead of auth.users
-- This fixes "permission denied for table users" errors

-- Drop existing policies
DROP POLICY IF EXISTS "Product categories can be inserted by admins" ON product_categories;
DROP POLICY IF EXISTS "Product categories can be updated by admins" ON product_categories;
DROP POLICY IF EXISTS "Product categories can be deleted by admins" ON product_categories;

-- Recreate policies using auth.jwt() to access user metadata
CREATE POLICY "Product categories can be inserted by admins" ON product_categories
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Product categories can be updated by admins" ON product_categories
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Product categories can be deleted by admins" ON product_categories
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

