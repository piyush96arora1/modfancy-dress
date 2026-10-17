-- Orders are written only by the server (service role) from here on.
--
-- APPLY AT DEPLOY TIME, after the new checkout (POST /api/checkout) is live: the old cart
-- page inserts orders from the browser with the anon key, and this removes that path.
--
-- Why: anon could insert any status and any total_amount, and the browser computed the
-- total itself. The checkout API reprices every order from the database.

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Catch any other INSERT policy that the 004–010 fix-ups left behind under another name.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items') AND cmd = 'INSERT'
  LOOP
    RAISE NOTICE 'dropping insert policy %.%', p.tablename, p.policyname;
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;
