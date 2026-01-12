# Quick Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Build passes locally (`npm run build`)
- [x] All TypeScript errors fixed
- [x] All migrations applied to Supabase

## 🚀 Deploy Steps

### 1. Push to GitHub (if not already done)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy via Vercel Dashboard

1. **Go to https://vercel.com** and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import your repository** from GitHub
4. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 3. Add Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://udnidqllpmyoothwznbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:**
- Add these for **Production**, **Preview**, and **Development**
- Get values from: Supabase Dashboard → Settings → API
- Service Role Key is the "secret" key (keep it secure!)

### 4. Deploy

Click **"Deploy"** and wait 2-3 minutes.

### 5. Configure Supabase

After deployment, update Supabase:

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: `https://your-project.vercel.app/**`

## 📝 Environment Variables Reference

Get these from **Supabase Dashboard → Settings → API**:

- **NEXT_PUBLIC_SUPABASE_URL**: Project URL (e.g., `https://xxxxx.supabase.co`)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Publishable API Key (safe for browser)
- **SUPABASE_SERVICE_ROLE_KEY**: Service Role Key (secret, server-only)

## ✅ Post-Deployment

Test these features:
- [ ] Homepage loads
- [ ] Products page works
- [ ] Product detail pages work
- [ ] Cart functionality
- [ ] Order placement works
- [ ] Admin login works
- [ ] Admin can create/edit products
- [ ] Images load correctly

## 🔧 Troubleshooting

**Build fails?**
- Check build logs in Vercel Dashboard
- Ensure all environment variables are set
- Verify `package.json` has all dependencies

**Site loads but errors?**
- Check browser console
- Verify Supabase environment variables
- Check Vercel function logs

**Images not loading?**
- Verify `next.config.ts` has Supabase remote patterns
- Check Supabase Storage bucket is public

## 📚 Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Docs: https://supabase.com/docs

