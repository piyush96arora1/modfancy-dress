-- Configurable homepage product sections (replaces hard-coded "New Arrivals").
-- Each row is one labeled section on the homepage; enable multiple to feature
-- overlapping occasions (e.g. Independence Day + Janmashtami).

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'category' CHECK (source_type IN ('category', 'latest')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_count INTEGER NOT NULL DEFAULT 8 CHECK (product_count BETWEEN 1 AND 12),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: public read, admin write (mirrors the banners table policies)
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read homepage sections"
  ON homepage_sections FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert homepage sections"
  ON homepage_sections FOR INSERT
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admins can update homepage sections"
  ON homepage_sections FOR UPDATE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admins can delete homepage sections"
  ON homepage_sections FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- Seed: current occasion. Add more sections (incl. a "latest products" row) from
-- Admin → Homepage as needed.
INSERT INTO homepage_sections (title, source_type, category_id, product_count, sort_order, is_enabled)
VALUES
  ('Independence Day Picks', 'category',
   (SELECT id FROM categories WHERE slug = 'independence-day-dress' LIMIT 1), 8, 0, TRUE);
