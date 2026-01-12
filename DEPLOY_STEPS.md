# Step-by-Step Vercel Deployment Guide

Follow these steps **one by one**. Complete each step before moving to the next.

---

## STEP 1: Verify Your Code is Ready ✅

**Action:** Run this command in your terminal:

```bash
cd /home/fa064236/Desktop/code/modfacnydress
npm run build
```

**Expected Result:** You should see:
```
✓ Compiled successfully
✓ Generating static pages
```

**If you see errors:** Fix them before proceeding.

**✅ Check this box when done:** [ ]

---

## STEP 2: Prepare Your Supabase Environment Variables 📝

**Action:** Get your Supabase credentials ready.

1. Go to **https://supabase.com/dashboard**
2. Select your project
3. Go to **Settings** → **API**
4. Copy these 3 values (keep them handy):

   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
     - Example: `https://udnidqllpmyoothwznbv.supabase.co`
   
   - **Publishable API Key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Look for "Publishable API Key" or "anon" key
   
   - **Service Role Key** → This is your `SUPABASE_SERVICE_ROLE_KEY`
     - Scroll down to find "service_role" key
     - Click "Reveal" or "Show" to see it
     - ⚠️ Keep this secret!

**✅ Check this box when you have all 3 values copied:** [ ]

---

## STEP 3: Commit Your Code to Git 📦

**Action:** Make sure your code is committed and pushed to GitHub.

**If you already have a GitHub repository:**

```bash
cd /home/fa064236/Desktop/code/modfacnydress
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

**If you DON'T have a GitHub repository yet:**

1. Go to **https://github.com**
2. Click **"New repository"**
3. Name it: `modfacnydress`
4. Don't initialize with README
5. Click **"Create repository"**
6. Then run these commands (GitHub will show you the exact commands):

```bash
cd /home/fa064236/Desktop/code/modfacnydress
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/modfacnydress.git
git push -u origin main
```

**✅ Check this box when code is pushed to GitHub:** [ ]

---

## STEP 4: Create Vercel Account & Import Project 🚀

**Action:** Deploy to Vercel.

1. Go to **https://vercel.com**
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
   - You can sign in with GitHub (recommended)
3. After logging in, click **"Add New..."** → **"Project"**
4. You'll see a list of your GitHub repositories
5. Find **`modfacnydress`** and click **"Import"**

**✅ Check this box when project is imported:** [ ]

---

## STEP 5: Configure Project Settings ⚙️

**Action:** Set up the project configuration.

On the import page, you'll see these settings:

1. **Framework Preset:** Should say "Next.js" (auto-detected) ✅
2. **Root Directory:** Leave as `./` (default) ✅
3. **Build Command:** Leave as `npm run build` (default) ✅
4. **Output Directory:** Leave as `.next` (default) ✅
5. **Install Command:** Leave as `npm install` (default) ✅

**Don't click Deploy yet!** We need to add environment variables first.

**✅ Check this box when settings are verified:** [ ]

---

## STEP 6: Add Environment Variables 🔐

**Action:** Add your Supabase credentials.

1. On the same page, scroll down to **"Environment Variables"** section
2. Click **"Add"** or the **"+"** button
3. Add these **3 variables one by one**:

   **Variable 1:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Paste your Project URL from Step 2
   - **Environments:** Check all three boxes:
     - ☑ Production
     - ☑ Preview  
     - ☑ Development
   - Click **"Add"**

   **Variable 2:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** Paste your Publishable API Key from Step 2
   - **Environments:** Check all three boxes:
     - ☑ Production
     - ☑ Preview
     - ☑ Development
   - Click **"Add"**

   **Variable 3:**
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Paste your Service Role Key from Step 2
   - **Environments:** Check all three boxes:
     - ☑ Production
     - ☑ Preview
     - ☑ Development
   - Click **"Add"**

**✅ Check this box when all 3 variables are added:** [ ]

---

## STEP 7: Deploy! 🎉

**Action:** Start the deployment.

1. Scroll to the bottom of the page
2. Click the big **"Deploy"** button
3. Wait 2-3 minutes for the build to complete
4. You'll see build logs in real-time
5. When it says **"Ready"**, your site is live!

**✅ Check this box when deployment completes:** [ ]

---

## STEP 8: Get Your Live URL 🌐

**Action:** Copy your deployment URL.

After deployment completes:

1. You'll see a success message
2. Click on your project name or **"Visit"** button
3. Your site URL will be: `https://modfacnydress.vercel.app` (or similar)
4. **Copy this URL** - you'll need it for the next step

**✅ Check this box when you have your URL:** [ ]

---

## STEP 9: Configure Supabase for Production 🔧

**Action:** Tell Supabase about your Vercel URL.

1. Go back to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Find **"Site URL"** field
3. Replace the value with your Vercel URL: `https://modfacnydress.vercel.app`
4. Scroll down to **"Redirect URLs"**
5. Click **"Add URL"**
6. Add: `https://modfacnydress.vercel.app/**`
7. Click **"Save"**

**✅ Check this box when Supabase is configured:** [ ]

---

## STEP 10: Test Your Live Site 🧪

**Action:** Verify everything works.

Visit your Vercel URL and test:

- [ ] Homepage loads correctly
- [ ] Products page shows products
- [ ] Can click on a product to see details
- [ ] Can add products to cart
- [ ] Can place an order
- [ ] Admin login works (if you have admin account)
- [ ] Images load correctly

**✅ Check this box when testing is complete:** [ ]

---

## 🎊 Congratulations!

Your Mod Fancy Dress application is now live on Vercel!

**Your live URL:** `https://modfacnydress.vercel.app` (or your custom URL)

---

## ❓ Troubleshooting

**If deployment fails:**
- Check the build logs in Vercel Dashboard
- Make sure all environment variables are correct
- Verify your code builds locally (`npm run build`)

**If site loads but has errors:**
- Check browser console (F12)
- Verify environment variables in Vercel Settings
- Check Supabase is accessible

**Need help?** Check the detailed guide in `DEPLOYMENT.md`

