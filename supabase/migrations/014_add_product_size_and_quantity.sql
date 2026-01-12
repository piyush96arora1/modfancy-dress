-- Add size and quantity fields to products table for default values
-- This allows products without variants to still have size and quantity

-- Add quantity column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS quantity INTEGER;

-- Add size column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size TEXT;

-- Add comments to explain the fields
COMMENT ON COLUMN products.quantity IS 'Default quantity for products without variants. Optional field.';
COMMENT ON COLUMN products.size IS 'Default size for products without variants. Optional field.';

