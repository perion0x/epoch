# Creator Guide

Welcome to the Decentralized Newsletter Platform! This guide will help you create, publish, and manage your newsletter on a censorship-resistant, blockchain-based platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your Newsletter](#creating-your-newsletter)
3. [Publishing Issues](#publishing-issues)
4. [Managing Access with NFTs](#managing-access-with-nfts)
5. [Viewing Analytics](#viewing-analytics)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- A Sui wallet (e.g., Sui Wallet, Suiet, Ethos)
- SUI tokens for transaction fees
- A web browser (Chrome, Firefox, or Brave recommended)

### Connecting Your Wallet

1. Visit the platform at [your-platform-url]
2. Click "Connect Wallet" in the top right corner
3. Select your wallet provider
4. Approve the connection request in your wallet

## Creating Your Newsletter

### Step 1: Navigate to Create Newsletter

1. Click "Create Newsletter" from the main navigation
2. You'll see the newsletter creation form

### Step 2: Fill in Newsletter Details

**Title** (Required)
- Your newsletter's name
- Example: "Tech Insights Weekly"

**Description** (Required)
- A brief description of your newsletter's content
- This helps subscribers discover your newsletter
- Example: "Weekly analysis of emerging technologies and their impact on society"

### Step 3: Choose Your Access Model

You have three options:

**Free Only**
- All content is public and accessible to everyone
- No NFTs required
- Best for: Building audience, public discourse

**NFT-Gated**
- All content requires an access NFT to read
- You control who gets NFTs
- Best for: Premium exclusive content, paid subscriptions

**Hybrid** (Recommended)
- Mix of public and premium content in each issue
- Public sections attract readers, premium sections monetize
- Best for: Freemium model, growing while earning

### Step 4: Configure NFT Settings (if applicable)

If you chose NFT-Gated or Hybrid:

1. You'll need to provide an NFT collection address
2. You can either:
   - Use an existing NFT collection
   - Create a new collection (we'll help you mint NFTs later)

### Step 5: Create Newsletter

1. Review your settings
2. Click "Create Newsletter"
3. Approve the transaction in your wallet
4. Wait for confirmation (usually 2-3 seconds)
5. Success! Your newsletter is now on-chain

## Publishing Issues

### Step 1: Navigate to Your Newsletter

1. Go to "My Newsletters" from the navigation
2. Click on the newsletter you want to publish to
3. Click "Publish New Issue"

### Step 2: Write Your Content

**Issue Title**
- Give your issue a descriptive title
- Example: "Issue #5: The Rise of Decentralized Social Media"

**Content Editor**
- Write your content using Markdown or rich text
- Format with headers, lists, links, and emphasis

### Step 3: Mark Premium Sections (Hybrid/NFT-Gated only)

If your newsletter has premium content:

1. Select the text you want to make premium
2. Click "Mark as Premium" or use the `---PREMIUM---` marker
3. Premium sections will be highlighted in yellow
4. You can have multiple premium sections per issue

**Example Structure:**
```markdown
# Welcome to Issue #5

This is the public introduction that everyone can read...

---PREMIUM---

This exclusive analysis is only for NFT holders...

Detailed insights and data...

---END PREMIUM---

Public conclusion that everyone sees...
```

### Step 4: Preview Your Issue

1. Click "Preview" to see how your issue will look
2. Check both public and premium views
3. Make any necessary edits

### Step 5: Publish

1. Click "Publish Issue"
2. The platform will:
   - Encrypt premium sections (if any)
   - Upload content to Walrus decentralized storage
   - Create an Issue object on Sui blockchain
   - Emit publication events
3. Approve the transaction in your wallet
4. Wait for confirmation
5. Your issue is now live!

**Note:** Publishing typically takes 5-10 seconds depending on content size.

## Managing Access with NFTs

### Minting Access NFTs

If you have an NFT-gated or hybrid newsletter, you can mint access NFTs for your subscribers.

#### Step 1: Navigate to NFT Management

1. Go to your newsletter page
2. Click "Manage NFTs" tab

#### Step 2: Mint NFT

1. Click "Mint New Access NFT"
2. Enter the recipient's Sui address
3. Review the details
4. Click "Mint NFT"
5. Approve the transaction
6. The recipient now has access to your premium content!

### Viewing NFT Holders

- See all addresses that hold your newsletter's access NFTs
- Track when NFTs were minted
- Monitor your subscriber base

### NFT Distribution Strategies

**Direct Sales**
- Mint NFTs to buyers after receiving payment off-chain
- Use escrow services for trustless sales

**Airdrops**
- Reward early supporters with free NFTs
- Mint to multiple addresses

**Marketplace Listings**
- List your access NFTs on Sui NFT marketplaces
- Let the market determine pricing

**Subscription Services**
- Partner with subscription platforms
- Automate NFT minting for subscribers

## Viewing Analytics

### Access Your Dashboard

1. Go to your newsletter page
2. Click "Analytics" tab

### Available Metrics

**Subscriber Count**
- Total number of subscribers following your newsletter
- Growth over time chart

**Issue Views**
- View count for each published issue
- Engagement trends

**NFT Distribution**
- Number of access NFTs minted
- Active NFT holders

**Publication Frequency**
- Your publishing cadence
- Consistency metrics

### Using Analytics

- Identify your most popular issues
- Track subscriber growth after specific issues
- Optimize publishing schedule based on engagement
- Understand your audience size

## Best Practices

### Content Strategy

**Start with Free Content**
- Build an audience with free issues first
- Establish credibility and value
- Then introduce premium content

**Consistent Publishing**
- Set a regular schedule (weekly, bi-weekly, monthly)
- Subscribers appreciate consistency
- Use analytics to find optimal timing

**Balance Free and Premium**
- In hybrid newsletters, give enough free content to attract readers
- Make premium content valuable enough to justify NFT purchase
- Typical ratio: 60% free, 40% premium

### Writing Tips

**Engaging Titles**
- Clear and descriptive
- Create curiosity without clickbait
- Include issue numbers for series

**Content Structure**
- Start with a hook
- Use headers to organize sections
- Include visuals when possible (coming soon)
- End with a call-to-action

**Premium Content Value**
- Offer unique insights, data, or analysis
- Provide actionable advice
- Share exclusive interviews or research
- Give early access to information

### Technical Best Practices

**Content Size**
- Keep issues under 5MB for optimal performance
- Compress images before including
- Consider splitting very long content into multiple issues

**Wallet Security**
- Never share your private keys
- Use hardware wallets for high-value newsletters
- Keep your wallet software updated

**Backup Your Content**
- Keep local copies of your issues
- Content on Walrus is permanent, but keep backups
- Save your newsletter ID and important addresses

## Troubleshooting

### Common Issues

#### "Transaction Failed" Error

**Possible Causes:**
- Insufficient SUI for gas fees
- Network congestion
- Wallet connection lost

**Solutions:**
1. Check your SUI balance
2. Reconnect your wallet
3. Try again in a few moments
4. Reduce transaction complexity

#### "Failed to Upload to Walrus" Error

**Possible Causes:**
- Content too large
- Network issues
- Walrus nodes temporarily unavailable

**Solutions:**
1. Check your internet connection
2. Reduce content size
3. Wait a few minutes and retry
4. Contact support if persistent

#### "Encryption Failed" Error

**Possible Causes:**
- Invalid premium content markers
- Seal service temporarily unavailable
- Configuration issues

**Solutions:**
1. Check premium section markers are correct
2. Retry in a few moments
3. Verify your newsletter has a Seal package ID
4. Contact support if persistent

#### Premium Content Not Decrypting for NFT Holders

**Possible Causes:**
- NFT not properly linked to newsletter
- Seal policy misconfigured
- Session key expired

**Solutions:**
1. Verify NFT collection address in newsletter settings
2. Check NFT holder has the correct NFT
3. Ask holder to reconnect wallet
4. Verify Seal package ID is correct

### Getting Help

**Documentation**
- Read the [Developer Documentation](./DEVELOPER_GUIDE.md)
- Check the [FAQ](./FAQ.md)

**Community Support**
- Join our Discord: [link]
- Follow on Twitter: [link]
- GitHub Issues: [link]

**Technical Support**
- Email: support@your-platform.com
- Response time: 24-48 hours

## Advanced Features

### Custom Seal Policies

For advanced users, you can deploy custom Seal access policies:

1. Write a Move module with custom `seal_approve` logic
2. Deploy to Sui
3. Use the package ID when creating your newsletter
4. Implement custom access rules (time-based, multi-NFT, etc.)

See [Developer Documentation](./DEVELOPER_GUIDE.md) for details.

### Batch Operations

Publishing multiple issues or minting multiple NFTs:

1. Use the batch operations interface (coming soon)
2. Or use the CLI tools for automation
3. See [Developer Documentation](./DEVELOPER_GUIDE.md)

### API Integration

Integrate newsletter publishing into your existing workflow:

1. Use the TypeScript SDK
2. Automate publishing from your CMS
3. See [Developer Documentation](./DEVELOPER_GUIDE.md)

## Conclusion

You're now ready to create and manage your decentralized newsletter! Remember:

- Start simple and iterate
- Engage with your subscribers
- Use analytics to improve
- Keep your content valuable

Welcome to censorship-resistant publishing! 🚀
