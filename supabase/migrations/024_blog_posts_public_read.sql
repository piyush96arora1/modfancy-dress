-- Match products/categories: allow public read for blog_posts (app filters published only)
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON blog_posts;
CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (true);
