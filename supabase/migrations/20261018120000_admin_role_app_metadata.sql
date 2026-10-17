-- Admin role: read it from app_metadata, never user_metadata.
--
-- Admin policies in migrations 003–033 check `auth.jwt() -> 'user_metadata' ->> 'role'`. Any
-- signed-in user can rewrite their own user_metadata with supabase.auth.updateUser(), and
-- public sign-up is enabled, so anyone could make themselves admin. app_metadata is
-- writable only with the service role.
--
-- Live state on 18 Oct 2026: the orders/order_items policies had already been switched to
-- app_metadata by hand; the three homepage_sections admin policies had not. The real admin
-- already carries app_metadata.role = 'admin', so nobody is locked out. Rather than restate
-- policies scattered over many migrations, this rewrites whatever is live: every
-- public-schema policy whose USING or WITH CHECK mentions user_metadata.
--
-- Idempotent: a second run finds nothing to change.

DO $$
DECLARE
  p record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual LIKE '%user_metadata%' OR with_check LIKE '%user_metadata%')
  LOOP
    new_qual  := replace(p.qual, 'user_metadata', 'app_metadata');
    new_check := replace(p.with_check, 'user_metadata', 'app_metadata');

    stmt := format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    IF new_qual IS NOT NULL THEN
      stmt := stmt || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK (%s)', new_check);
    END IF;

    RAISE NOTICE 'admin-role fix: %.%', p.tablename, p.policyname;
    EXECUTE stmt;
  END LOOP;
END $$;

-- Storage policies belong to supabase_storage_admin and cannot be altered from here; list
-- any that still read user_metadata so they can be fixed in Dashboard → Storage → Policies.
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'storage'
  AND (qual LIKE '%user_metadata%' OR with_check LIKE '%user_metadata%');

-- orders.deleted_at exists in the live database (admin soft-delete uses it) but no
-- migration ever created it. Record it so a rebuilt database matches.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
