-- Add soft delete functionality to products table
-- This allows products to be "deleted" while preserving data for orders and analytics

-- Add deleted_at column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries filtering out deleted products
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN products.deleted_at IS 'Timestamp when product was soft deleted. NULL means product is not deleted.';

-- Note: We keep the foreign key constraint on order_items.product_id as is
-- This allows orders to reference products even after soft deletion
-- Products with deleted_at IS NOT NULL will be filtered out from public views

