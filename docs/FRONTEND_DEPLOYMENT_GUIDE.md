# Frontend Deployment Guide

This guide covers deploying the Decentralized Newsletter Platform frontend to various hosting platforms.

## Pre-Deployment Checklist

### 1. Fix Build Issues

Before deploying, ensure the build completes successfully:

```bash
npm run build
```

**Current Status:** ⚠️ Build has linting errors that need to be fixed

**Known Issues:**
- Unused variables in test files
- React unescaped entities
- Missing dependency warnings

**Quick Fix:** Update ESLint rules or fix the specific issues listed in build output.

### 2. Environment Configuration

Ensure `.env.local` is configured with deployed package IDs:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=<DEPLOYED_PACKAGE_ID>
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_SEAL_KEY_SERVER_URL=https://seal-testnet.sui.io
```

### 3. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- ✅ Pages load without errors
- ✅ Wallet connection works
- ✅ Can view newsletters (if any exist)

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment for Next.js applications.

#### A. Via Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configure Environment Variables:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add all variables from `.env.local`
- Redeploy if needed

#### B. Via Vercel Dashboard

1. **Connect Repository:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add each variable from `.env.local`
   - Select "Production", "Preview", and "Development"

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Get deployment URL

**Advantages:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Built-in analytics

**Cost:** Free tier available

### Option 2: IPFS (Decentralized)

Deploy to IPFS for fully decentralized hosting.

#### Prerequisites

- IPFS CLI or Pinata account
- Static export capability

#### Steps

1. **Update next.config.js for static export:**
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // ... rest of config
};
```

2. **Build static export:**
```bash
npm run build
```

This creates an `out/` directory with static files.

3. **Upload to IPFS:**

**Option A: IPFS CLI**
```bash
ipfs add -r out/
```

**Option B: Pinata**
- Go to https://pinata.cloud
- Upload `out/` folder
- Get IPFS hash

4. **Pin the content:**
- Use Pinata, Infura, or other pinning service
- Ensure content remains available

5. **Access your site:**
- `https://ipfs.io/ipfs/<HASH>`
- `https://gateway.pinata.cloud/ipfs/<HASH>`
- `https://<HASH>.ipfs.dweb.link`

**Optional: Custom Domain**
- Use ENS (Ethereum Name Service)
- Use DNSLink
- Configure CNAME to IPFS gateway

**Advantages:**
- ✅ Fully decentralized
- ✅ Censorship-resistant
- ✅ No single point of failure
- ✅ Permanent storage

**Disadvantages:**
- ⚠️ No server-side rendering
- ⚠️ Requires pinning service
- ⚠️ Slower than traditional CDN

### Option 3: Self-Hosted

Host on your own server or VPS.

#### Prerequisites

- Server with Node.js installed
- Domain name (optional)
- SSL certificate (recommended)

#### Steps

1. **Build the application:**
```bash
npm run build
```

2. **Copy files to server:**
```bash
scp -r .next package.json package-lock.json user@server:/path/to/app/
```

3. **Install dependencies on server:**
```bash
ssh user@server
cd /path/to/app
npm install --production
```

4. **Start the application:**
```bash
npm run start
```

Or use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "newsletter-app" -- start
pm2 save
pm2 startup
```

5. **Configure reverse proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Set up SSL with Let's Encrypt:**
```bash
sudo certbot --nginx -d your-domain.com
```

**Advantages:**
- ✅ Full control
- ✅ Custom configuration
- ✅ No vendor lock-in

**Disadvantages:**
- ⚠️ Requires server management
- ⚠️ Manual scaling
- ⚠️ You handle security updates

### Option 4: Netlify

Similar to Vercel, good alternative.

#### Steps

1. **Connect repository:**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Connect your repository

2. **Configure build:**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Add environment variables:**
   - Site settings → Environment variables
   - Add all from `.env.local`

4. **Deploy:**
   - Click "Deploy site"
   - Get deployment URL

**Advantages:**
- ✅ Similar to Vercel
- ✅ Good free tier
- ✅ Easy to use

## Post-Deployment

### 1. Verify Deployment

Visit your deployed URL and check:
- ✅ Homepage loads
- ✅ Wallet connection works
- ✅ Newsletter browsing works
- ✅ No console errors

### 2. Test Core Functionality

- Create a test newsletter
- Publish a test issue
- Mint a test NFT
- Subscribe to a newsletter

### 3. Monitor Performance

- Check page load times
- Monitor error rates
- Track user interactions

### 4. Set Up Analytics (Optional)

**Vercel Analytics:**
- Automatically available on Vercel

**Google Analytics:**
- Add tracking code to `_app.tsx`

**Custom Analytics:**
- Use the analytics service from the app

## Troubleshooting

### Build Fails

**Issue:** ESLint or TypeScript errors

**Solution:**
1. Fix the errors shown in build output
2. Or temporarily disable strict checking (not recommended)
3. Run `npm run lint` to see all issues

### Environment Variables Not Working

**Issue:** Config values are undefined

**Solution:**
1. Ensure variables start with `NEXT_PUBLIC_`
2. Restart dev server after changing `.env.local`
3. Redeploy after updating environment variables

### Wallet Connection Fails

**Issue:** Cannot connect wallet on deployed site

**Solution:**
1. Check browser console for errors
2. Verify RPC URL is accessible
3. Ensure wallet extension is installed
4. Check network is set to testnet

### Content Not Loading

**Issue:** Newsletters or issues don't load

**Solution:**
1. Verify package ID is correct
2. Check smart contracts are deployed
3. Verify RPC endpoint is accessible
4. Check browser console for errors

## Deployment Checklist

- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Smart contracts deployed
- [ ] Package IDs updated
- [ ] Local testing passed
- [ ] Deployment platform chosen
- [ ] Site deployed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate installed
- [ ] Post-deployment testing complete
- [ ] Monitoring set up
- [ ] Documentation updated

## Maintenance

### Regular Updates

- Update dependencies: `npm update`
- Check for security vulnerabilities: `npm audit`
- Update Next.js: `npm install next@latest`

### Monitoring

- Check deployment logs regularly
- Monitor error rates
- Track performance metrics
- Review user feedback

### Backups

- Keep deployment configuration backed up
- Document environment variables
- Save deployment scripts

## Resources

- **Vercel Docs:** https://vercel.com/docs
- **IPFS Docs:** https://docs.ipfs.tech
- **Netlify Docs:** https://docs.netlify.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment

## Support

For deployment issues:
- Check this guide
- Review platform documentation
- Check Next.js documentation
- Ask in project Discord/forum

---

**Current Status:** ⏳ Ready for deployment after fixing build issues

**Recommended Platform:** Vercel (easiest) or IPFS (most decentralized)

**Next Steps:**
1. Fix linting errors
2. Complete build successfully
3. Choose deployment platform
4. Deploy and test
