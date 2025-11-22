# Walrus Sites Deployment Guide

This guide explains how to deploy your decentralized newsletter platform to Walrus Sites for a fully censorship-resistant, unstoppable Web3 experience.

## What is Walrus Sites?

Walrus Sites allows you to host your entire frontend on Walrus decentralized storage. This means:

- **No centralized hosting** - Your site lives on Walrus nodes
- **Censorship-resistant** - No single entity can take down your site
- **Permanent** - Content persists as long as Walrus storage is paid for
- **Fast** - Served through Walrus aggregators with caching
- **Cost-effective** - Pay once for storage, no monthly hosting fees

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Newsletter                       │
│                                                          │
│  Frontend (HTML/JS/CSS) ──────► Walrus Sites           │
│  Newsletter Content ───────────► Walrus Blobs           │
│  Smart Contracts ──────────────► Sui Blockchain         │
│  Access Control ───────────────► Seal                   │
└─────────────────────────────────────────────────────────┘
```

Everything is decentralized!

## Prerequisites

### 1. Install Walrus Sites CLI

```bash
# Install via Cargo
cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder

# Verify installation
site-builder --version
```

### 2. Configure Sui Wallet

Make sure you have a Sui wallet with testnet SUI:

```bash
# Check wallet status
sui client active-address

# Get testnet SUI from faucet if needed
sui client faucet
```

### 3. Get Walrus Testnet Tokens

You'll need WAL tokens to pay for storage:

```bash
# Request testnet WAL tokens
# Visit: https://discord.gg/walrus (check #faucet channel)
```

## Deployment Steps

### Step 1: Build Your Application

The Next.js app is already configured for static export:

```bash
npm run build
```

This creates an `out/` directory with all static files.

### Step 2: Deploy to Walrus Sites

Use the deployment script:

```bash
./scripts/deploy-walrus-sites.sh
```

Or manually:

```bash
site-builder publish --network testnet ./out
```

### Step 3: Access Your Site

After deployment, you'll receive:

1. **Site Object ID** - The Sui object representing your site
2. **Walrus Site URL** - Something like `https://[site-id].walrus.site`

Example output:
```
Created site object: 0x1234...
Your site is live at: https://abc123.walrus.site
```

## Configuration

### Environment Variables

Create a `.env.walrus` file:

```bash
# Walrus Network (testnet or mainnet)
WALRUS_NETWORK=testnet

# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet

# Walrus Aggregator
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space

# Your deployed site object ID (after first deployment)
WALRUS_SITE_OBJECT_ID=0x...
```

### Custom Domain (Optional)

To use a custom domain with your Walrus site:

1. Deploy your site and note the site object ID
2. Create a DNS TXT record:
   ```
   _walrus.yourdomain.com TXT "site-object-id=0x1234..."
   ```
3. Access via: `https://yourdomain.com` (through Walrus gateway)

## Updating Your Site

To update your deployed site:

```bash
# Rebuild
npm run build

# Update the site (uses same site object ID)
site-builder update --site-id $WALRUS_SITE_OBJECT_ID ./out
```

## Cost Estimation

Walrus Sites pricing (testnet is free, mainnet estimates):

- **Storage**: ~$0.10 per GB per year
- **Typical newsletter site**: 10-50 MB = ~$0.01-0.05/year
- **One-time payment** - No recurring hosting fees!

## Troubleshooting

### Build Fails

If `npm run build` fails:

1. Check that `output: 'export'` is in `next.config.js`
2. Ensure no server-side features are used (API routes, ISR, etc.)
3. Run `npm run type-check` to find TypeScript errors

### Deployment Fails

If `site-builder publish` fails:

1. **Insufficient WAL tokens**: Request more from faucet
2. **Wallet not configured**: Run `sui client` to set up
3. **Network issues**: Check Walrus testnet status

### Site Not Loading

If your site doesn't load:

1. **Wait 1-2 minutes** - Walrus needs time to propagate
2. **Check aggregator status** - Try different aggregators
3. **Verify site object** - Check on Sui Explorer

## Advanced: CI/CD Deployment

Automate deployments with GitHub Actions:

```yaml
# .github/workflows/deploy-walrus.yml
name: Deploy to Walrus Sites

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Install site-builder
        run: cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder
      
      - name: Deploy to Walrus
        env:
          SUI_PRIVATE_KEY: ${{ secrets.SUI_PRIVATE_KEY }}
        run: |
          echo "$SUI_PRIVATE_KEY" > ~/.sui/sui_config/sui.keystore
          site-builder publish --network testnet ./out
```

## Monitoring

### Check Site Status

```bash
# Get site info
sui client object $WALRUS_SITE_OBJECT_ID

# Check Walrus blob availability
curl https://aggregator.walrus-testnet.walrus.space/v1/blobs/$BLOB_ID
```

### Analytics

Since your site is static, use:
- **On-chain analytics** - Track via Sui events
- **Client-side analytics** - Use privacy-focused tools like Plausible
- **Walrus metrics** - Monitor blob access patterns

## Benefits of Walrus Sites

✅ **Censorship-resistant** - No single point of failure
✅ **Cost-effective** - Pay once, host forever
✅ **Fast** - Distributed CDN-like performance
✅ **Permanent** - Content persists on decentralized storage
✅ **Verifiable** - All content is cryptographically verified
✅ **Privacy-friendly** - No tracking by hosting provider

## Comparison: Traditional vs Walrus Sites

| Feature | Traditional Hosting | Walrus Sites |
|---------|-------------------|--------------|
| Censorship resistance | ❌ Low | ✅ High |
| Monthly costs | 💰 $5-50/month | 💰 ~$0.01/year |
| Takedown risk | ⚠️ High | ✅ None |
| Setup complexity | ✅ Easy | ⚠️ Moderate |
| Performance | ✅ Excellent | ✅ Good |
| Custom domains | ✅ Yes | ⚠️ Via gateway |

## Next Steps

1. **Deploy to testnet** - Test the full flow
2. **Verify functionality** - Check all features work
3. **Deploy to mainnet** - Go live with real WAL tokens
4. **Set up monitoring** - Track site health
5. **Share your site** - Promote your censorship-resistant newsletter!

## Resources

- [Walrus Sites Documentation](https://docs.walrus.site)
- [Walrus Discord](https://discord.gg/walrus)
- [Sui Documentation](https://docs.sui.io)
- [Site Builder GitHub](https://github.com/MystenLabs/walrus-sites)

## Support

If you encounter issues:

1. Check the [Walrus Sites FAQ](https://docs.walrus.site/faq)
2. Ask in [Walrus Discord](https://discord.gg/walrus)
3. Review [GitHub Issues](https://github.com/MystenLabs/walrus-sites/issues)

---

**Your newsletter is now truly unstoppable! 🚀**
