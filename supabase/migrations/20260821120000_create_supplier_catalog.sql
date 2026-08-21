-- Private supplier catalog (/catalog).
--
-- Deliberately separate from products/categories so supplier items can never leak into the
-- retail storefront, its sitemap, or retail search. supplier_code allows a second source
-- later without needing a suppliers table.
--
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS supplier_categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_code    TEXT NOT NULL DEFAULT 'sup-01',
  source_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  parent_id        UUID REFERENCES supplier_categories(id) ON DELETE CASCADE,
  image_url        TEXT,
  thumbnail_url    TEXT,
  source_image_url TEXT,
  sort_order       INTEGER DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (supplier_code, source_id)
);

CREATE TABLE IF NOT EXISTS supplier_products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_code  TEXT NOT NULL DEFAULT 'sup-01',
  source_id      TEXT NOT NULL,
  name           TEXT NOT NULL,
  source_name    TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  category_id    UUID NOT NULL REFERENCES supplier_categories(id) ON DELETE CASCADE,
  supplier_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes          TEXT,
  tags           TEXT,
  set_value      INTEGER DEFAULT 1,
  min_order_qty  INTEGER DEFAULT 0,
  has_sizes      BOOLEAN DEFAULT FALSE,
  variants       JSONB,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (supplier_code, source_id)
);

CREATE TABLE IF NOT EXISTS supplier_product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  thumb_url  TEXT NOT NULL,
  source_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  UNIQUE (product_id, source_url)
);

-- Full-text search over name + tags. 'simple' rather than 'english': these are Hindi/English
-- product names ("mala rudraksh", "mukut"), where English stemming would do more harm than good.
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(tags, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS supplier_products_search_idx
  ON supplier_products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS supplier_products_category_idx ON supplier_products(category_id);
CREATE INDEX IF NOT EXISTS supplier_categories_parent_idx ON supplier_categories(parent_id);

-- Public read (the pages are anonymous); writes are service-role only, matching `products`.
ALTER TABLE supplier_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS supplier_categories_read ON supplier_categories;
CREATE POLICY supplier_categories_read ON supplier_categories
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS supplier_products_read ON supplier_products;
CREATE POLICY supplier_products_read ON supplier_products
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS supplier_product_images_read ON supplier_product_images;
CREATE POLICY supplier_product_images_read ON supplier_product_images
  FOR SELECT USING (TRUE);

-- Search RPC. Mirrors the shape of search_products_and_categories but reads supplier tables
-- only, so retail search can never return supplier items and needs no changes.
CREATE OR REPLACE FUNCTION search_supplier_catalog(search_term TEXT, result_limit INT DEFAULT 24)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  supplier_price NUMERIC,
  notes TEXT,
  set_value INTEGER,
  min_order_qty INTEGER,
  category_name TEXT,
  category_slug TEXT,
  thumb_url TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT p.id,
         p.name,
         p.slug,
         p.supplier_price,
         p.notes,
         p.set_value,
         p.min_order_qty,
         c.name AS category_name,
         c.slug AS category_slug,
         (SELECT i.thumb_url
            FROM supplier_product_images i
           WHERE i.product_id = p.id
           ORDER BY i.is_primary DESC, i.sort_order ASC
           LIMIT 1) AS thumb_url
    FROM supplier_products p
    JOIN supplier_categories c ON c.id = p.category_id
   WHERE p.is_active
     AND (
       p.search_vector @@ plainto_tsquery('simple', search_term)
       OR p.name ILIKE '%' || search_term || '%'
       OR c.name ILIKE '%' || search_term || '%'
     )
   ORDER BY p.name
   LIMIT LEAST(result_limit, 60);
$$;

-- site_settings has no migration in this repo (it was created in the Supabase dashboard), so
-- create it defensively and seed without ON CONFLICT, which would require a constraint we
-- cannot verify from source.
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

INSERT INTO site_settings (key, value)
SELECT 'supplier_markup_pct', '{"value": 20}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'supplier_markup_pct');
