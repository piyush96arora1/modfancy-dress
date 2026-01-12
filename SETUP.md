# Quick Setup Guide

## Step 1: Supabase Database Setup

1. **Run the Migrations:**

   - Open Supabase Dashboard → SQL Editor
   - **First migration:** Copy entire contents of `supabase/migrations/001_initial_schema.sql`
     - Paste and click "Run"
   - **Fix migration:** Copy entire contents of `supabase/migrations/003_fix_rls_policies.sql`
     - Paste and click "Run"
     - This fixes the "permission denied for table users" error

2. **Create Storage Bucket:**

   - Go to Storage → Create Bucket
   - Name: `product-images`
   - Make it **Public**
   - Add Policy:

     ```sql
     CREATE POLICY "Public Access" ON storage.objects
     FOR SELECT USING (bucket_id = 'product-images');

     CREATE POLICY "Authenticated Upload" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'product-images' AND
       auth.role() = 'authenticated'
     );
     ```

## Step 2: Environment Variables

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### How to Find These Values:

1. **Go to Supabase Dashboard:**

   - Open your project at https://supabase.com/dashboard
   - Click on your project

2. **Navigate to API Settings:**

   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **API** under Project Settings

3. **Find Your Values:**
   - **Project URL** → Copy the "Project URL" (looks like: `https://xxxxx.supabase.co`)
     - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable API Key** → Copy the "Publishable API Key" (starts with `sb_publishable_` or `eyJ...`)
     - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → Scroll down to find "service_role" key
     - Click **"Reveal"** or **"Show"** button to reveal it (it's hidden by default)
     - Copy this key (starts with `sb_service_` or `eyJ...`)
     - This is your `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ **Keep this secret!** Never commit it to git or expose it publicly.

### Example (using your values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://udnidqllpmyoothwznbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XTUnQw2nMdvOO3AS71SzZw_c3s6ylTi
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Note:** The Service Role Key is different from the Publishable Key. Look for a section labeled "service_role" or "Secret Key" in the API settings page.

## Step 3: Create Admin User

**Option 1: Via Signup Page**

1. Go to `/signup`
2. Sign up with email/password
3. Select "Admin" role
4. Verify email

**Option 2: Using SQL (Recommended if user already exists)**

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this SQL query (replace `your-email@example.com` with your actual email):

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

3. Click **Run** to execute

**Option 3: Via Supabase Dashboard UI**

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user in the list
3. Click on the user to open details
4. Look for **"User Metadata"** or **"Raw User Meta Data"** section
5. If you see an edit button, click it and add: `{ "role": "admin" }`
6. Save

**Note:** The UI option may not be available in all Supabase versions. If you don't see the edit option, use **Option 2 (SQL)** instead - it's the most reliable method.

**To verify the admin role was set:**

Run this SQL to check:

```sql
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'your-email@example.com';
```

You should see `"role": "admin"` in the `raw_user_meta_data` column.

## Step 4: Run the App

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Test Admin Features

1. Login as admin
2. Go to `/admin/products`
3. Click "Add New Product"
4. Add product name and upload image (required)
5. Optionally add category, description, price, variants
6. Save

## Important Notes

- **Product Name & Image are mandatory** - other fields are optional
- **Size formats supported:** "1-2 yrs", "12,14,16", "12,14,16,18,20,22,24,26,28,30,32,34"
- **Cart is session-based** - stored in localStorage
- **Orders don't require payment** - just customer info
- **Admin can update order status** from Orders page

## Troubleshooting

**Images not uploading?**

- Check Storage bucket is public
- Verify Storage policies are set correctly
- Check browser console for errors

**Can't access admin panel?**

- Verify user has `role: 'admin'` in metadata
- Check middleware is working (should redirect non-admins)

**Orders not saving?**

- Check database tables exist
- Verify RLS policies allow INSERT on orders table
- Check browser console for errors
- **Temporary fix:** If RLS policies aren't working, run this SQL to disable RLS:
  ```sql
  ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
  ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
  ```
  **WARNING:** This is NOT secure for production. Re-enable RLS once policies are fixed.
