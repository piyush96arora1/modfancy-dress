-- Simple policy approach - no role restrictions, just allow everything

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create the simplest possible policy
-- Don't specify TO clause, just allow with true check
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Also ensure order_items has the same
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT 
  WITH CHECK (true);


