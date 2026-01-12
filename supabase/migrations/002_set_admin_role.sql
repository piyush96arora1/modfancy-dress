-- Helper script to set admin role for a user
-- Replace 'your-email@example.com' with the actual email address

-- Example: Set admin role for a specific user
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- To check if it worked, run:
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'your-email@example.com';


