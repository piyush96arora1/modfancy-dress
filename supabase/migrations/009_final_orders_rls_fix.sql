-- Final fix: Re-enable RLS and create a working policy
-- Since disabling RLS worked, we know the issue is with the policy evaluation

-- Re-enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create a policy using USING clause instead of WITH CHECK
-- This is more permissive and should work for anonymous users
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  USING (true)
  WITH CHECK (true);

-- Verify it was created
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders' AND cmd = 'INSERT';


