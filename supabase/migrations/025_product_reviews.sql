-- Product reviews: rating (1-5) and text for SEO (AggregateRating schema) and fresh UGC
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  author_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_created_at ON product_reviews(created_at);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (for product page and schema)
CREATE POLICY "Product reviews are viewable by everyone" ON product_reviews
  FOR SELECT USING (true);

-- Anyone can submit a review (can restrict to authenticated later)
CREATE POLICY "Anyone can submit a product review" ON product_reviews
  FOR INSERT WITH CHECK (true);
