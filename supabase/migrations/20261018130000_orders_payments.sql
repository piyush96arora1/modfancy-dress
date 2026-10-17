-- Online payment (Cashfree) + delivery method on orders.
--
-- Additive only: existing rows become payment_method 'pay_later' / payment_status 'unpaid',
-- which is what they were. The live cart keeps working until the new checkout ships; the
-- anon INSERT policies are dropped separately in 20261018140000 at deploy time.

-- 1. Orders: payment + delivery columns -------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method   text NOT NULL DEFAULT 'pay_later',
  ADD COLUMN IF NOT EXISTS payment_status   text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS items_subtotal   numeric(10,2),
  ADD COLUMN IF NOT EXISTS delivery_fee     numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_method  text,
  ADD COLUMN IF NOT EXISTS cf_order_id      text,
  ADD COLUMN IF NOT EXISTS cf_payment_id    text,
  ADD COLUMN IF NOT EXISTS payment_group    text,
  ADD COLUMN IF NOT EXISTS paid_amount      numeric(10,2),
  ADD COLUMN IF NOT EXISTS paid_at          timestamptz,
  ADD COLUMN IF NOT EXISTS owner_alerted_at timestamptz;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('online', 'pay_later'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('unpaid', 'awaiting_payment', 'paid', 'failed', 'refunded', 'partially_refunded'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_method_check
  CHECK (delivery_method IS NULL OR delivery_method IN ('courier', 'porter', 'pickup'));

-- 'delivered' joins the fulfilment states.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'));

-- Email becomes optional at checkout (phone is the contact that matters).
ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;

CREATE INDEX IF NOT EXISTS orders_payment_status_created_idx
  ON orders (payment_status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS orders_cf_order_id_key
  ON orders (cf_order_id) WHERE cf_order_id IS NOT NULL;

-- 2. Webhook log: de-duplication + audit. Service role only (RLS on, no policies). --------
CREATE TABLE IF NOT EXISTS payment_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid REFERENCES orders(id) ON DELETE SET NULL,
  cf_order_id     text,
  event_type      text NOT NULL,
  cf_payment_id   text,
  payment_status  text,
  idempotency_key text NOT NULL UNIQUE,
  payload         jsonb NOT NULL,
  received_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS payment_events_order_idx ON payment_events (order_id);

-- 3. Atomic order creation ---------------------------------------------------------------
-- The browser used to insert orders and order_items in two calls; a failure between them
-- left an order with no items. The checkout API now calls this with the service role.
CREATE OR REPLACE FUNCTION create_order(p jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone, shipping_address,
    status, total_amount, items_subtotal, delivery_fee, delivery_method,
    payment_method, payment_status
  ) VALUES (
    new_id,
    p->>'order_number',
    p->>'customer_name',
    NULLIF(p->>'customer_email', ''),
    p->>'customer_phone',
    COALESCE(p->'shipping_address', '{}'::jsonb),
    'pending',
    (p->>'total_amount')::numeric,
    (p->>'items_subtotal')::numeric,
    COALESCE((p->>'delivery_fee')::numeric, 0),
    p->>'delivery_method',
    p->>'payment_method',
    p->>'payment_status'
  );

  INSERT INTO order_items (order_id, product_id, variant_id, product_name, size, color, quantity, price)
  SELECT
    new_id,
    (i->>'product_id')::uuid,
    NULLIF(i->>'variant_id', '')::uuid,
    i->>'product_name',
    NULLIF(i->>'size', ''),
    NULLIF(i->>'color', ''),
    (i->>'quantity')::int,
    (i->>'price')::numeric
  FROM jsonb_array_elements(p->'items') AS i;

  RETURN new_id;
END $$;

REVOKE ALL ON FUNCTION create_order(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_order(jsonb) TO service_role;
