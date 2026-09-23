-- Date-window homepage sections and banners so the coming festival leads the
-- homepage and a finished one drops off by itself (Janmashtami was still the
-- only section on 23 Sep 2026). Both bounds are inclusive, IST, and optional:
-- a NULL bound is open-ended. Filtering happens at render time via
-- lib/utils/seasonal.ts `isActiveOn`.
--
-- min_products: a section only shows once its category has at least this many
-- live products (Halloween waits for its stock to be listed).

alter table homepage_sections
  add column if not exists starts_on date,
  add column if not exists ends_on date,
  add column if not exists min_products integer check (min_products is null or min_products >= 1);

alter table banners
  add column if not exists starts_on date,
  add column if not exists ends_on date;

notify pgrst, 'reload schema';
