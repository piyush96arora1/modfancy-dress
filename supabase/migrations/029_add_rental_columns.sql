-- Add rental pricing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS rent_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS rent_deposit NUMERIC(10,2);

-- Bulk backfill: 70% of retail price rounded to nearest nice number, deposit by tier
DO $$
DECLARE
  allowed INT[] := ARRAY[200, 250, 300, 350, 400, 450, 500, 600, 800, 1000];
  raw NUMERIC;
  best INT;
  best_dist NUMERIC;
  cur_dist NUMERIC;
  v INT;
  r RECORD;
BEGIN
  FOR r IN SELECT id, price FROM products WHERE price IS NOT NULL AND is_active = true LOOP
    raw := r.price * 0.7;
    best := 200;
    best_dist := abs(raw - 200);
    FOREACH v IN ARRAY allowed LOOP
      cur_dist := abs(raw - v);
      IF cur_dist < best_dist THEN
        best := v;
        best_dist := cur_dist;
      END IF;
    END LOOP;

    UPDATE products
    SET rent_price = best,
        rent_deposit = CASE
          WHEN best <= 200 THEN 500
          WHEN best <= 500 THEN 1000
          ELSE 2000
        END
    WHERE id = r.id;
  END LOOP;
END $$;
