# Testnet Deployment Guide

This guide walks through deploying the Decentralized Newsletter Platform to Sui testnet.

## Prerequisites

✅ Sui CLI installed and configured
✅ Move contracts built successfully
✅ Testnet wallet address: `0xdd82cd89d3101f5ab1c78772b356064b7573883cc587daf83ae4064dd7286746`

## Step 1: Get Testnet SUI Tokens

### Option A: Web Faucet (Recommended)

1. Visit: https://faucet.sui.io/?address=0xdd82cd89d3101f5ab1c78772b356064b7573883cc587daf83ae4064dd7286746
2. Complete the CAPTCHA
3. Click "Request Testnet SUI"
4. Wait for confirmation (usually 10-30 seconds)

### Option B: Discord Faucet

1. Join Sui Discord: https://discord.gg/sui
2. Go to #testnet-faucet channel
3. Type: `!faucet 0xdd82cd89d3101f5ab1c78772b356064b7573883cc587daf83ae4064dd7286746`
4. Wait for bot response

### Verify Balance

```bash
sui client gas
```

You should see gas coins with SUI balance.

## Step 2: Deploy Move Contracts

### 2.1 Deploy Newsletter Package

```bash
cd move
sui client publish --gas-budget 100000000
```

**Expected Output:**
- Transaction Digest: `<hash>`
- Package ID: `0x...` (SAVE THIS!)
- Created Objects: Newsletter, Issue, NFT, Subscription modules

**Save the following from output:**
- ✅ Package ID
- ✅ Transaction Digest
- ✅ Published-at address

### 2.2 Record Package ID

Create a file `deployment-info.json`:

```json
{
  "network": "testnet",
  "deployedAt": "2024-01-XX",
  "deployer": "0xdd82cd89d3101f5ab1c78772b356064b7573883cc587daf83ae4064dd7286746",
  "packages": {
    "newsletter": {
      "packageId": "PASTE_PACKAGE_ID_HERE",
      "transactionDigest": "PASTE_TX_DIGEST_HERE",
      "modules": {
        "newsletter": "newsletter::newsletter",
        "issue": "newsletter::issue",
        "nft": "newsletter::nft",
        "subscription": "newsletter::subscription",
        "access_policy": "newsletter::access_policy"
      }
    }
  }
}
```

### 2.3 Verify Deployment

Check on Sui Explorer:
```
https://suiexplorer.com/object/<PACKAGE_ID>?network=testnet
```

Verify all modules are visible:
- ✅ newsletter
- ✅ issue
- ✅ nft
- ✅ subscription
- ✅ access_policy

## Step 3: Configure Environment

### 3.1 Update .env.local

```env
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Deployed Package IDs
NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=<PASTE_PACKAGE_ID_HERE>

# Walrus Testnet
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Seal Testnet (if available)
NEXT_PUBLIC_SEAL_KEY_SERVER_URL=https://seal-testnet.sui.io
```

### 3.2 Update Environment Config

Edit `src/config/environment.ts` to use the deployed package ID:

```typescript
export const NEWSLETTER_PACKAGE_ID = process.env.NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID || '<FALLBACK_PACKAGE_ID>'
```

## Step 4: Test Smart Contracts

### 4.1 Test Newsletter Creation

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module newsletter \
  --function create_and_share_newsletter \
  --args \
    "Test Newsletter" \
    "A test newsletter on testnet" \
    true \
    false \
    false \
    "[]" \
    "<PACKAGE_ID>" \
  --gas-budget 10000000
```

**Expected:** Newsletter object created and shared

### 4.2 Verify Newsletter Object

From the output, get the Newsletter object ID and check:

```bash
sui client object <NEWSLETTER_OBJECT_ID>
```

Should show:
- title: "Test Newsletter"
- description: "A test newsletter on testnet"
- creator: your address
- access_model: { is_free: true, is_nft_gated: false, is_hybrid: false }

## Step 5: Build and Deploy Frontend

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Build Production Bundle

```bash
npm run build
```

**Verify:**
- ✅ No TypeScript errors
- ✅ No build errors
- ✅ Bundle size reasonable

### 5.3 Test Locally

```bash
npm run start
```

Visit http://localhost:3000 and test:
- ✅ Wallet connection works
- ✅ Can view newsletters
- ✅ Can create newsletter (if you have testnet SUI)

### 5.4 Deploy to Vercel

#### Option A: Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Import your repository
3. Configure environment variables (copy from .env.local)
4. Deploy

**Set Environment Variables in Vercel:**
- `NEXT_PUBLIC_SUI_NETWORK=testnet`
- `NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443`
- `NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=<YOUR_PACKAGE_ID>`
- `NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space`
- `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space`

### 5.5 Alternative: Deploy to IPFS

```bash
# Build static export
npm run build
npm run export

# Upload to IPFS (using Pinata, Infura, or other service)
# Example with IPFS CLI:
ipfs add -r out/

# Pin the content
# Get IPFS hash: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Access via:
- `https://ipfs.io/ipfs/<HASH>`
- `https://gateway.pinata.cloud/ipfs/<HASH>`

## Step 6: Integration Testing

### 6.1 Test Newsletter Creation

1. Connect wallet to deployed frontend
2. Click "Create Newsletter"
3. Fill in details:
   - Title: "My Test Newsletter"
   - Description: "Testing on testnet"
   - Access Model: Free
4. Submit and approve transaction
5. Verify newsletter appears in list

### 6.2 Test Issue Publishing

**Note:** This requires Walrus testnet access. If Walrus is not available, this test will fail gracefully.

1. Go to your newsletter
2. Click "Publish Issue"
3. Write content:
   ```markdown
   # Test Issue
   
   This is public content.
   
   ---PREMIUM---
   This is premium content (encrypted).
   ---END PREMIUM---
   ```
4. Submit and approve transaction
5. Verify issue appears

### 6.3 Test NFT Minting

1. Go to newsletter NFT management
2. Click "Mint NFT"
3. Enter recipient address (can be your own)
4. Submit and approve transaction
5. Verify NFT appears in wallet

### 6.4 Test Subscription

1. Go to any newsletter
2. Click "Subscribe"
3. Approve transaction
4. Verify subscription appears in "My Subscriptions"

## Step 7: Monitoring and Verification

### 7.1 Check Transaction History

```bash
sui client transactions --address <YOUR_ADDRESS>
```

### 7.2 Monitor Events

Check Sui Explorer for emitted events:
- NewsletterCreated
- IssuePublished
- NFTMinted
- Subscribed

### 7.3 Verify Objects

List all objects owned by your address:

```bash
sui client objects
```

Should see:
- Newsletter objects (if created)
- Issue objects (if published)
- NFT objects (if minted)
- Subscription objects (if subscribed)

## Troubleshooting

### Issue: "Insufficient gas"

**Solution:** Request more testnet SUI from faucet

### Issue: "Package not found"

**Solution:** Verify package ID is correct in environment variables

### Issue: "Transaction failed"

**Solution:** 
1. Check gas budget is sufficient
2. Verify all arguments are correct
3. Check Sui network status

### Issue: "Walrus storage failed"

**Solution:** 
- Walrus testnet may be unavailable
- Check Walrus status page
- Try again later
- For testing, you can mock Walrus responses

### Issue: "Seal encryption failed"

**Solution:**
- Seal testnet may be unavailable
- Check Seal status page
- For testing, you can skip premium content

## Success Criteria

✅ Smart contracts deployed to testnet
✅ Package ID recorded and configured
✅ Frontend deployed and accessible
✅ Can connect wallet
✅ Can create newsletter
✅ Can view newsletters
✅ Can mint NFTs
✅ Can subscribe to newsletters

## Next Steps

1. **Test End-to-End Flows**
   - Create newsletter with premium content
   - Mint NFT to test address
   - Verify premium content decryption

2. **Gather Feedback**
   - Share with test users
   - Collect bug reports
   - Identify UX improvements

3. **Prepare for Mainnet**
   - Complete security audit
   - Review deployment checklist
   - Plan mainnet deployment

## Deployment Information

**Testnet Deployment:**
- Network: Sui Testnet
- Deployer: `0xdd82cd89d3101f5ab1c78772b356064b7573883cc587daf83ae4064dd7286746`
- Package ID: `<TO_BE_FILLED>`
- Frontend URL: `<TO_BE_FILLED>`
- Deployed: `<DATE>`

**Status:** ⏳ Awaiting testnet SUI tokens

## Resources

- Sui Testnet Faucet: https://faucet.sui.io
- Sui Explorer: https://suiexplorer.com/?network=testnet
- Sui Documentation: https://docs.sui.io
- Walrus Documentation: https://docs.walrus.site
- Seal Documentation: https://docs.sui.io/concepts/cryptography/seal

## Support

For issues or questions:
- GitHub Issues: [link]
- Discord: [link]
- Email: dev@your-platform.com
