-- Banners table for carousel
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT NOT NULL,
  link_url TEXT,
  alt_text TEXT DEFAULT 'Promotional Banner',
  sort_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read banners"
  ON banners FOR SELECT
  USING (true);

-- Allow authenticated admins to update
CREATE POLICY "Admins can update banners"
  ON banners FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Allow authenticated admins to insert
CREATE POLICY "Admins can insert banners"
  ON banners FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Allow authenticated admins to delete
CREATE POLICY "Admins can delete banners"
  ON banners FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );
