-- Add size field to products table for default size
-- This allows products without variants to still have a size

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN products.size IS 'Default size for products without variants. Optional field.';


