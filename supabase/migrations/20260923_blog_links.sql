-- Internal linking between guides, categories and products (plan Task 15).
--   blog_posts.cover_image_url         cover image: LCP image on the post, BlogPosting `image`, OG image
--   blog_posts.related_category_slugs  categories whose products fill the post's "Shop this guide" grid
--   categories.guide_blog_slug         the blog post a category page links to as "Read the guide"

alter table blog_posts
  add column if not exists cover_image_url text,
  add column if not exists related_category_slugs text[] default '{}';

alter table categories
  add column if not exists guide_blog_slug text;

notify pgrst, 'reload schema';
