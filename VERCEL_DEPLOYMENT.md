# Vercel Deployment Guide

## Quick Deploy (5 minutes)

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No
- **Project name?** decentralized-newsletter (or your choice)
- **Directory?** ./ (press Enter)
- **Override settings?** No

### Step 4: Deploy to Production
```bash
vercel --prod
```

## Your Site Will Be Live!

After deployment, you'll get a URL like:
```
https://decentralized-newsletter-xyz.vercel.app
```

## Environment Variables

Your environment variables are already configured in `vercel.json`:
- `NEXT_PUBLIC_SUI_NETWORK`: testnet
- `NEXT_PUBLIC_WALRUS_AGGREGATOR`: Walrus testnet aggregator
- `NEXT_PUBLIC_WALRUS_PUBLISHER`: Walrus testnet publisher

If you need to add more:
```bash
vercel env add VARIABLE_NAME
```

## Custom Domain (Optional)

To add a custom domain:
1. Go to your project on vercel.com
2. Settings → Domains
3. Add your domain
4. Update DNS records as instructed

## Updating Your Site

After making changes:
```bash
git add .
git commit -m "Update"
git push
```

Vercel will auto-deploy! Or manually:
```bash
vercel --prod
```

## What's Deployed

✅ **Frontend**: Your Next.js app
✅ **Connects to**: Walrus (for content) + Sui (for blockchain)
✅ **Content**: Still on Walrus (decentralized!)
✅ **Smart Contracts**: Still on Sui (decentralized!)

## Monitoring

View your deployment:
- Dashboard: https://vercel.com/dashboard
- Logs: Click on your project → Deployments → View logs
- Analytics: Built-in analytics available

## Troubleshooting

### Build Fails
Check the build logs on Vercel dashboard. Common issues:
- TypeScript errors: Check `npm run type-check`
- Missing env vars: Add them in Vercel dashboard

### Site Loads But Doesn't Work
- Check browser console for errors
- Verify environment variables are set
- Check Walrus/Sui connectivity

## Cost

Vercel is **FREE** for:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN

Perfect for your newsletter platform!

## Next Steps

1. ✅ Deploy to Vercel (you're doing this now!)
2. 🧪 Test all features on your live site
3. 📢 Share your URL
4. 🚀 Later: Migrate to Walrus Sites for 100% decentralization

---

**Your content is already on Walrus, smart contracts on Sui. This just makes it accessible!**
