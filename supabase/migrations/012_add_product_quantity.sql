-- Add quantity field to products table for default quantity tracking
-- This allows products without variants to still have quantity

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS quantity INTEGER;

-- Add comment to explain the field
COMMENT ON COLUMN products.quantity IS 'Default quantity for products without variants. Optional field.';


