# How to Push Code to GitHub

## Option 1: Use GitHub Web Interface (Easiest)

1. Go to: https://github.com/piyush96arora1/modfancy-dress
2. Click **"uploading an existing file"** or drag and drop your files
3. Commit directly from GitHub

## Option 2: Use Personal Access Token (Recommended)

### Step 1: Create Personal Access Token

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `Vercel Deployment`
4. Select scopes: Check **`repo`** (full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Push Using Token

Run these commands:

```bash
cd /home/fa064236/Desktop/code/modfacnydress
git remote set-url origin https://YOUR_TOKEN@github.com/piyush96arora1/modfancy-dress.git
git push origin main
```

Replace `YOUR_TOKEN` with the token you just created.

**OR** use this command (it will prompt for username and password/token):

```bash
cd /home/fa064236/Desktop/code/modfacnydress
git remote set-url origin https://github.com/piyush96arora1/modfancy-dress.git
git push origin main
```

When prompted:
- **Username:** `piyush96arora1`
- **Password:** Paste your Personal Access Token (not your GitHub password!)

## Option 3: Skip Git Push - Deploy Directly

You can also deploy directly from your local machine using Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel
```

This will deploy without needing to push to GitHub first.


