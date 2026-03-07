-- Add image_url to categories table
ALTER TABLE categories
ADD COLUMN image_url text DEFAULT NULL;
