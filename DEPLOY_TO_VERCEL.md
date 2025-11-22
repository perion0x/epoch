# 🚀 Deploy to Vercel - Complete Guide

## Step 1: Commit Your Changes

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit with message
git commit -m "Add gasless newsletter creation with Sui blockchain integration"
```

## Step 2: Push to GitHub (if not already)

```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy (will prompt for login if needed)
vercel

# For production deployment
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repo
4. Vercel will auto-detect Next.js
5. Click "Deploy"

## Step 4: Add Environment Variables on Vercel

**CRITICAL:** Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
SPONSOR_PRIVATE_KEY=suiprivkey1qp4hsvfe29glg294ejfyzgv39az77thm4gedf6p7rpu75t7k53swz5f384u
PLATFORM_MASTER_KEY=gasless-test-key-2024-change-in-production
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_SEAL_KEY_SERVER_URL=https://seal-testnet.sui.io
NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=0xbefe3b446989ccbf743e319701aabcca7cc2063691ac4658f13cede746258061
NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID=0xbefe3b446989ccbf743e319701aabcca7cc2063691ac4658f13cede746258061
```

## Step 5: Test Your Deployment

Once deployed, visit:
- **Main page:** https://your-project.vercel.app
- **Gasless demo:** https://your-project.vercel.app/test-gasless

## Quick Deploy Command (All-in-One)

```bash
# Commit and deploy in one go
git add . && \
git commit -m "Deploy gasless newsletter platform" && \
vercel --prod
```

## Troubleshooting

### If build fails:
```bash
# Test build locally first
npm run build

# If successful, then deploy
vercel --prod
```

### If environment variables are missing:
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from above
5. Redeploy

### To redeploy after changes:
```bash
git add .
git commit -m "Your update message"
git push
# Vercel auto-deploys on push!
```

## Your Live URLs

After deployment, you'll get:
- **Production:** https://your-project.vercel.app
- **Preview:** https://your-project-git-branch.vercel.app

## Testing Checklist

- [ ] Visit main page
- [ ] Click "Create Newsletter"
- [ ] Fill in form and submit
- [ ] Verify blockchain transaction on SuiVision
- [ ] Check that no wallet was needed
- [ ] Confirm gasless creation worked

---

**You're ready to go live! 🚀**
