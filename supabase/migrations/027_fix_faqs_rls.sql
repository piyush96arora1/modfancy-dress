-- Fix FAQ visibility: avoid auth.users subquery in policies (anon cannot read auth.users,
-- which can break RLS evaluation). Align with banners — jwt() + per-command policies.

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "FAQs are viewable by everyone" ON public.faqs;
DROP POLICY IF EXISTS "FAQs can be managed by admins" ON public.faqs;
DROP POLICY IF EXISTS "faqs_select_published" ON public.faqs;
DROP POLICY IF EXISTS "faqs_select_admin" ON public.faqs;
DROP POLICY IF EXISTS "faqs_insert_admin" ON public.faqs;
DROP POLICY IF EXISTS "faqs_update_admin" ON public.faqs;
DROP POLICY IF EXISTS "faqs_delete_admin" ON public.faqs;

-- Published rows: explicit roles (anon + logged-in customers)
CREATE POLICY "faqs_select_published"
  ON public.faqs
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Admins: read drafts / all rows
CREATE POLICY "faqs_select_admin"
  ON public.faqs
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "faqs_insert_admin"
  ON public.faqs
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "faqs_update_admin"
  ON public.faqs
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "faqs_delete_admin"
  ON public.faqs
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');
