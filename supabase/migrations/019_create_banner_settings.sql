-- Banner settings table
CREATE TABLE IF NOT EXISTS banner_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN DEFAULT FALSE,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  link_url TEXT,
  alt_text TEXT DEFAULT 'Upcoming Event',
  ticker_text TEXT,
  ticker_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default row (disabled)
INSERT INTO banner_settings (is_enabled, desktop_image_url, mobile_image_url, link_url, alt_text, ticker_text, ticker_enabled)
VALUES (FALSE, NULL, NULL, NULL, 'Upcoming Event', NULL, FALSE)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read banner settings"
  ON banner_settings FOR SELECT
  USING (true);

-- Allow authenticated admins to update
CREATE POLICY "Admins can update banner settings"
  ON banner_settings FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Allow authenticated admins to insert
CREATE POLICY "Admins can insert banner settings"
  ON banner_settings FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

