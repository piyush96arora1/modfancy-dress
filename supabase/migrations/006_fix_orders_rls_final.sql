-- Final fix for orders RLS policy to allow anonymous inserts
-- This ensures the policy works correctly for anonymous users

-- Drop ALL existing policies on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Recreate SELECT policy
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Recreate INSERT policy - MUST allow anonymous users
-- Using the simplest possible check that always evaluates to true
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Recreate UPDATE policy
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Also fix order_items INSERT policy
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT 
  TO public
  WITH CHECK (true);


