-- Alternative approach: Explicitly allow anonymous users in the policy

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create policy that explicitly checks for anonymous OR authenticated users
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is anonymous (auth.uid() is NULL)
    auth.uid() IS NULL
    -- OR allow if user is authenticated (auth.uid() is NOT NULL)
    OR auth.uid() IS NOT NULL
  );

-- This should be equivalent to WITH CHECK (true) but more explicit
-- If this doesn't work, the issue might be elsewhere


