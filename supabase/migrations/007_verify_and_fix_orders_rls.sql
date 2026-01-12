-- Verify and fix orders RLS - Step by step debugging

-- Step 1: Check current policies
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- Step 2: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'orders';

-- Step 3: Drop ALL policies on orders table
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Step 4: Temporarily disable RLS to test (COMMENT OUT AFTER TESTING)
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Step 5: Re-enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 6: Create a very permissive INSERT policy
-- Try without TO public first
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Step 7: Recreate other policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Step 8: Verify the INSERT policy was created
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders' AND cmd = 'INSERT';


