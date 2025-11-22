# 🐋 Walrus Sites Deployment - Quick Start

## ⚠️ Important Note

Your newsletter platform currently uses Next.js dynamic routes which require runtime data fetching. Full Walrus Sites deployment requires converting to a static site or SPA.

**Current Status:**
- ✅ **Content Storage**: Already on Walrus (decentralized!)
- ✅ **Smart Contracts**: On Sui blockchain (decentralized!)
- ✅ **Access Control**: Via Seal (decentralized!)
- ⚠️ **Frontend Hosting**: Traditional hosting (Vercel/Netlify)

**See [docs/WALRUS_DEPLOYMENT_NOTES.md](./docs/WALRUS_DEPLOYMENT_NOTES.md) for deployment options.**

---

## Future: Deploy to Walrus Sites

When you're ready to go fully decentralized, here's how it will work:

## Prerequisites

1. **Sui Wallet** with testnet SUI
2. **Walrus testnet WAL tokens** (get from Discord faucet)
3. **Cargo/Rust** installed (for site-builder CLI)

## Installation

### 1. Install Walrus Sites CLI

```bash
cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder
```

### 2. Verify Sui Wallet

```bash
sui client active-address
# Should show your wallet address

# Get testnet SUI if needed
sui client faucet
```

### 3. Get WAL Tokens

Join Walrus Discord and request testnet WAL:
- Discord: https://discord.gg/walrus
- Go to #faucet channel
- Request testnet WAL tokens

## Deploy in 3 Steps

### Step 1: Build

```bash
npm run build
```

This creates a static export in the `out/` directory.

### Step 2: Deploy

```bash
npm run deploy:walrus
```

Or manually:

```bash
site-builder publish --network testnet ./out
```

### Step 3: Access

After deployment completes, you'll see:

```
✅ Site deployed successfully!
Site Object ID: 0x1234567890abcdef...
URL: https://abc123xyz.walrus.site
```

Visit your URL - your newsletter is now live on Walrus! 🎉

## What Just Happened?

1. **Built** - Next.js created static HTML/JS/CSS files
2. **Uploaded** - All files uploaded to Walrus as blobs
3. **Registered** - Site object created on Sui blockchain
4. **Live** - Site accessible via walrus.site domain

## Your Site is Now:

✅ **Censorship-resistant** - No one can take it down
✅ **Decentralized** - Hosted on Walrus nodes worldwide
✅ **Permanent** - Lives as long as storage is paid for
✅ **Fast** - Served through Walrus aggregators
✅ **Verifiable** - All content cryptographically verified

## Updating Your Site

To update after making changes:

```bash
# Rebuild
npm run build

# Update (replace with your site object ID)
site-builder update --site-id 0xYOUR_SITE_ID ./out
```

## Troubleshooting

### "site-builder not found"

Install the CLI:
```bash
cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder
```

### "Insufficient WAL balance"

Get more testnet WAL from Discord faucet.

### "Build failed"

Check for errors:
```bash
npm run type-check
npm run lint
```

### Site not loading

Wait 1-2 minutes for Walrus propagation, then refresh.

## Next Steps

1. ✅ Deploy to testnet (you just did this!)
2. 📝 Test all features on your walrus.site URL
3. 🎨 Customize your newsletter design
4. 🚀 Deploy to mainnet when ready
5. 📢 Share your censorship-resistant newsletter!

## Cost

**Testnet**: Free!
**Mainnet**: ~$0.01-0.05 per year for typical newsletter site

Compare that to $5-50/month for traditional hosting! 💰

## Resources

- [Full Deployment Guide](./docs/WALRUS_SITES_DEPLOYMENT.md)
- [Walrus Documentation](https://docs.walrus.site)
- [Walrus Discord](https://discord.gg/walrus)

---

**Welcome to the decentralized web! 🌐**
