lk# Deployment Guide - Vercel

This guide will help you deploy your Mod Fancy Dress application to Vercel.

## Prerequisites

1. ✅ Your code is ready (all migrations applied to Supabase)
2. ✅ Your Supabase project is set up
3. ✅ You have a GitHub account (recommended) or can use Vercel CLI

## Step 1: Prepare Your Code

### 1.1 Ensure all migrations are applied

Make sure you've run all SQL migrations in your Supabase SQL Editor:

- `001_initial_schema.sql`
- `002_set_admin_role.sql`
- `003_fix_rls_policies.sql`
- `004_fix_orders_insert_policy.sql`
- `005_fix_orders_policy_explicit.sql`
- `006_fix_orders_rls_final.sql`
- `007_verify_and_fix_orders_rls.sql`
- `008_orders_anonymous_fix.sql`
- `009_final_orders_rls_fix.sql`
- `010_orders_simple_policy.sql`
- `011_disable_rls_temporary.sql` (if needed)
- `012_add_product_quantity.sql`
- `013_add_product_size.sql`
- `014_add_product_size_and_quantity.sql`
- `016_add_soft_delete.sql`

### 1.2 Commit your code to Git

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**

   - Visit https://vercel.com
   - Sign up or log in (you can use GitHub to sign in)

2. **Import Your Project**

   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository (or connect Git provider)
   - Select your repository: `modfacnydress`

3. **Configure Project**

   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables**
   Click **"Environment Variables"** and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://udnidqllpmyoothwznbv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   ⚠️ **Important:**

   - Get these values from Supabase Dashboard → Settings → API
   - Make sure to add them for **Production**, **Preview**, and **Development** environments
   - The Service Role Key should be kept secret

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   Follow the prompts:

   - Link to existing project? **No** (first time)
   - Project name: `modfacnydress` (or your choice)
   - Directory: `./` (default)
   - Override settings? **No**

4. **Add Environment Variables**

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Supabase for Production

### 3.1 Update Supabase Site URL

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://your-project.vercel.app`
3. Add to **Redirect URLs**: `https://your-project.vercel.app/**`

### 3.2 Update CORS Settings (if needed)

Supabase should work out of the box, but if you encounter CORS issues:

- Go to Supabase Dashboard → **Settings** → **API**
- Check that your Vercel domain is allowed

## Step 4: Verify Deployment

1. **Check Build Logs**

   - Go to Vercel Dashboard → Your Project → **Deployments**
   - Click on the latest deployment to see build logs
   - Ensure build completed successfully

2. **Test Your Site**

   - Visit your Vercel URL
   - Test key features:
     - ✅ Homepage loads
     - ✅ Products page works
     - ✅ Product detail pages work
     - ✅ Cart functionality
     - ✅ Order placement
     - ✅ Admin login (if you have admin account)

3. **Check Environment Variables**
   - Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
   - Verify all three variables are set correctly

## Step 5: Set Up Custom Domain (Optional)

1. **Add Domain in Vercel**

   - Go to Project Settings → **Domains**
   - Add your custom domain (e.g., `modfacnydress.com`)

2. **Configure DNS**

   - Follow Vercel's DNS instructions
   - Add the required DNS records to your domain provider

3. **Update Supabase**
   - Update Site URL in Supabase to your custom domain

## Troubleshooting

### Build Fails

**Error: Missing environment variables**

- Solution: Make sure all environment variables are added in Vercel Dashboard

**Error: Module not found**

- Solution: Run `npm install` locally and commit `package-lock.json`

**Error: Type errors**

- Solution: Fix TypeScript errors locally first, then redeploy

### Runtime Errors

**Error: Supabase connection failed**

- Check environment variables are correct
- Verify Supabase project is active
- Check Supabase URL is correct (no trailing slash)

**Error: RLS policy violations**

- Ensure all migrations are applied
- Check RLS policies in Supabase Dashboard

**Error: Images not loading**

- Verify `next.config.ts` has correct `remotePatterns` for Supabase
- Check image URLs in Supabase Storage

### Common Issues

1. **"Cannot find module" errors**

   - Make sure all dependencies are in `package.json`
   - Run `npm install` and commit `package-lock.json`

2. **Environment variables not working**

   - Variables starting with `NEXT_PUBLIC_` are available in browser
   - Other variables are server-only
   - Redeploy after adding new environment variables

3. **Build succeeds but site doesn't work**
   - Check browser console for errors
   - Verify Supabase connection
   - Check Vercel function logs

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Supabase migrations are applied
- [ ] Site URL is configured in Supabase
- [ ] Admin user is created
- [ ] Test product creation
- [ ] Test order placement
- [ ] Test admin panel access
- [ ] Images are loading correctly
- [ ] Mobile responsiveness works

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Docs: https://supabase.com/docs
