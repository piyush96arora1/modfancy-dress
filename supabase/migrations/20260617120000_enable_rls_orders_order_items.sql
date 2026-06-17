-- SEC-01: Enable Row Level Security on orders + order_items.
--
-- Until now RLS was DISABLED on these tables, so the public anon key (shipped
-- in the browser bundle) could SELECT/UPDATE every customer's name, email,
-- phone, address and order history. This migration activates the existing
-- policies, which already express the correct access:
--   INSERT : "Anyone can create orders" / "Anyone can create order items"  (anon checkout)
--   SELECT : order owner (auth.uid() = user_id) OR admin (app_metadata.role = 'admin')
--   UPDATE : admin only
--
-- PREREQUISITE — DEPLOY ORDER MATTERS:
--   The checkout change in app/(public)/cart/page.tsx (client-generated order id,
--   no `.insert().select()`) MUST be deployed and serving BEFORE this runs.
--   The old code reads the order row back after insert; once RLS is on, anon
--   cannot read it back and checkout would fail. Deploy code first, verify a
--   test order, THEN apply this migration.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
