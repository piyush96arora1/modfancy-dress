-- TEMPORARY: Disable RLS on orders and order_items tables
-- This allows order creation to work while we debug the RLS policy issue
-- NOTE: This is NOT secure for production - re-enable RLS once policy is fixed

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items');


