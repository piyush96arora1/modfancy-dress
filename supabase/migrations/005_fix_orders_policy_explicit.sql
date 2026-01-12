-- Fix orders INSERT policy to explicitly allow anonymous users
-- This fixes the RLS violation when creating orders via REST API

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create policy that explicitly allows ALL users (authenticated and anonymous)
-- Using a condition that always evaluates to true
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Also ensure order_items has the same policy
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT 
  WITH CHECK (true);

