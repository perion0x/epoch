# 🚨 ADD ENVIRONMENT VARIABLES TO VERCEL NOW

## The Error
`Failed to load sponsor wallet. Make sure SPONSOR_PRIVATE_KEY is set correctly.`

This means the environment variables are missing on Vercel.

## Quick Fix (5 minutes)

### Step 1: Go to Vercel Dashboard
https://vercel.com/john-lims-projects-378e73ac/epoch/settings/environment-variables

### Step 2: Add These Variables

Click "Add New" for each:

```
Name: SPONSOR_PRIVATE_KEY
Value: suiprivkey1qp4hsvfe29glg294ejfyzgv39az77thm4gedf6p7rpu75t7k53swz5f384u
Environment: Production, Preview, Development
```

```
Name: PLATFORM_MASTER_KEY
Value: gasless-test-key-2024-change-in-production
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUI_NETWORK
Value: testnet
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUI_RPC_URL
Value: https://fullnode.testnet.sui.io:443
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_WALRUS_AGGREGATOR_URL
Value: https://aggregator.walrus-testnet.walrus.space
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_WALRUS_PUBLISHER_URL
Value: https://publisher.walrus-testnet.walrus.space
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SEAL_KEY_SERVER_URL
Value: https://seal-testnet.sui.io
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID
Value: 0xbefe3b446989ccbf743e319701aabcca7cc2063691ac4658f13cede746258061
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID
Value: 0xbefe3b446989ccbf743e319701aabcca7cc2063691ac4658f13cede746258061
Environment: Production, Preview, Development
```

### Step 3: Redeploy

After adding all variables, click "Redeploy" in Vercel Dashboard or run:

```bash
vercel --prod
```

### Step 4: Test

Visit: https://epoch-zuv49nz3f-john-lims-projects-378e73ac.vercel.app/test-gasless

It should work now!

---

## Alternative: Use Vercel CLI

```bash
# Add all at once
vercel env add SPONSOR_PRIVATE_KEY production
# Paste: suiprivkey1qp4hsvfe29glg294ejfyzgv39az77thm4gedf6p7rpu75t7k53swz5f384u

vercel env add PLATFORM_MASTER_KEY production
# Paste: gasless-test-key-2024-change-in-production

# ... repeat for all variables

# Then redeploy
vercel --prod
```

---

**DO THIS NOW** - It takes 5 minutes and your app will work! 🚀
