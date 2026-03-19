-- Add SEO columns to products (editors control Google search title/description)
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description text;

-- Add SEO columns to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_title varchar(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description text;

-- Add alt_text to product_images (Google Image Search + accessibility)
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS alt_text varchar(255);

-- Populate existing images: default alt = product name + "fancy dress costume"
UPDATE product_images pi
SET alt_text = trim(p.name || ' fancy dress costume')
FROM products p
WHERE pi.product_id = p.id
  AND (pi.alt_text IS NULL OR trim(pi.alt_text) = '');
