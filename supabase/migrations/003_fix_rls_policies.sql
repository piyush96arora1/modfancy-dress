-- Fix RLS policies to use auth.jwt() instead of querying auth.users table
-- This fixes "permission denied for table users" errors

-- Drop existing admin policies
DROP POLICY IF EXISTS "Products can be inserted by admins" ON products;
DROP POLICY IF EXISTS "Products can be updated by admins" ON products;
DROP POLICY IF EXISTS "Products can be deleted by admins" ON products;

DROP POLICY IF EXISTS "Categories can be inserted by admins" ON categories;
DROP POLICY IF EXISTS "Categories can be updated by admins" ON categories;
DROP POLICY IF EXISTS "Categories can be deleted by admins" ON categories;

DROP POLICY IF EXISTS "Product images can be inserted by admins" ON product_images;
DROP POLICY IF EXISTS "Product images can be updated by admins" ON product_images;
DROP POLICY IF EXISTS "Product images can be deleted by admins" ON product_images;

DROP POLICY IF EXISTS "Product variants can be inserted by admins" ON product_variants;
DROP POLICY IF EXISTS "Product variants can be updated by admins" ON product_variants;
DROP POLICY IF EXISTS "Product variants can be deleted by admins" ON product_variants;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

DROP POLICY IF EXISTS "Users can view items from their orders" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Recreate policies using auth.jwt() to access user metadata
-- Products policies
CREATE POLICY "Products can be inserted by admins" ON products
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Products can be updated by admins" ON products
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Products can be deleted by admins" ON products
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Categories policies
CREATE POLICY "Categories can be inserted by admins" ON categories
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Categories can be updated by admins" ON categories
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Categories can be deleted by admins" ON categories
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Product images policies
CREATE POLICY "Product images can be inserted by admins" ON product_images
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Product images can be updated by admins" ON product_images
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Product images can be deleted by admins" ON product_images
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Product variants policies
CREATE POLICY "Product variants can be inserted by admins" ON product_variants
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Product variants can be updated by admins" ON product_variants
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Product variants can be deleted by admins" ON product_variants
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Order items policies
CREATE POLICY "Users can view items from their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid() OR
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
      )
    )
  );

CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

