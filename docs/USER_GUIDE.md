# User Guide
## Decentralized Newsletter Platform

Welcome to the Decentralized Newsletter Platform - a censorship-resistant publishing platform built on Sui blockchain and Walrus storage.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [For Creators](#for-creators)
3. [For Subscribers](#for-subscribers)
4. [FAQ](#faq)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You'll Need

1. **Sui Wallet**: Install a Sui-compatible wallet (Sui Wallet, Suiet, Ethos)
2. **SUI Tokens**: Small amount of SUI for transaction fees
3. **Web Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### Connecting Your Wallet

1. Visit the platform at [platform-url]
2. Click "Connect Wallet" in the top right
3. Select your wallet provider
4. Approve the connection request
5. Your wallet address will appear once connected

---

## For Creators

### Creating a Newsletter

1. **Navigate to Create**
   - Click "Create Newsletter" from the home page
   - Or visit `/newsletters/create`

2. **Fill in Details**
   - **Title**: Your newsletter name (required)
   - **Description**: Brief description of your newsletter (required)
   - **Access Model**: Choose one:
     - **Free**: All content is public
     - **NFT-Gated**: All content requires NFT ownership
     - **Hybrid**: Mix of free and premium content

3. **Configure NFT Access** (if NFT-Gated or Hybrid)
   - Enter your NFT collection address
   - Enter your Seal policy package ID
   - These control who can access premium content

4. **Create Newsletter**
   - Click "Create Newsletter"
   - Approve the transaction in your wallet
   - Wait for blockchain confirmation
   - Your newsletter is now live!

### Publishing an Issue

1. **Navigate to Your Newsletter**
   - Go to your newsletter's detail page
   - Click "Publish Issue"

2. **Write Your Content**
   - **Title**: Issue title (required)
   - **Sections**: Add content sections
     - Click "+ Public Section" for free content
     - Click "+ Premium Section" for NFT-gated content
   - **Format**: Choose markdown, HTML, or plain text

3. **Preview Your Issue**
   - Click "Preview" to see how it will look
   - Review public and premium sections
   - Make edits as needed

4. **Publish**
   - Click "Publish Issue"
   - The platform will:
     - Encrypt premium sections (if any)
     - Upload content to Walrus storage
     - Create issue record on Sui blockchain
   - Approve the transaction in your wallet
   - Wait for confirmation

5. **Share Your Issue**
   - Copy the issue URL
   - Share with your audience
   - Subscribers will be notified (if enabled)

### Managing Access NFTs

1. **Navigate to NFT Management**
   - Go to your newsletter detail page
   - Click "🎫 Manage NFTs"

2. **Mint an Access NFT**
   - Enter recipient's Sui wallet address
   - Click "Mint Access NFT"
   - Approve the transaction
   - NFT will be sent to recipient

3. **View Minted NFTs**
   - See all NFTs you've minted
   - View current holders
   - Track NFT distribution

4. **NFT Benefits**
   - Holders can access all premium content
   - NFTs are transferable
   - Access is verified on-chain

### Best Practices for Creators

**Content Strategy:**
- Use hybrid model to attract free readers while monetizing premium content
- Provide value in public sections to encourage NFT purchases
- Publish consistently to build audience

**Premium Content:**
- Make premium content worth the NFT price
- Include exclusive insights, analysis, or resources
- Consider different NFT tiers for future expansion

**Engagement:**
- Monitor analytics to understand your audience
- Track subscriber growth and issue performance
- Adjust content strategy based on data

---

## For Subscribers

### Browsing Newsletters

1. **Discover Newsletters**
   - Visit the "Browse" page
   - See all available newsletters
   - Filter by access model (Free, NFT-Gated, Hybrid)

2. **Search Newsletters**
   - Use the search bar to find specific topics
   - Search by title or description
   - Results update in real-time

3. **View Newsletter Details**
   - Click on any newsletter card
   - See creator info, access model, and issue count
   - View your access level

### Reading Issues

1. **Access Public Content**
   - No wallet connection required for free content
   - Click on any issue to read
   - Public sections display immediately

2. **Access Premium Content**
   - Connect your wallet
   - Premium sections show as locked if you don't have access
   - If you own an access NFT:
     - Click "Unlock Premium Content"
     - Approve the Seal transaction
     - Premium content decrypts and displays

3. **Reading Experience**
   - Content loads progressively (lazy loading)
   - Premium sections decrypt on-demand
   - Smooth scrolling experience

### Subscribing to Newsletters

1. **Subscribe**
   - Connect your wallet
   - Visit a newsletter detail page
   - Click "Subscribe"
   - Approve the transaction
   - You're now subscribed!

2. **Benefits of Subscribing**
   - Track newsletters you follow
   - Receive notifications (when enabled)
   - Show support for creators
   - Note: Subscription ≠ premium access (NFT required for that)

3. **Unsubscribe**
   - Visit the newsletter page
   - Click "Unsubscribe"
   - Approve the transaction

### Viewing Your NFTs

1. **Check Your Access**
   - Visit any newsletter with NFT-gated content
   - Click "🎫 View NFTs"
   - See all access NFTs you own for that newsletter

2. **Using Your NFTs**
   - NFTs automatically grant access to premium content
   - No additional steps needed
   - Access is verified when you try to view premium content

3. **Transferring NFTs**
   - NFTs are standard Sui objects
   - Transfer through your wallet
   - New holder gains access, you lose access

---

## FAQ

### General Questions

**Q: What makes this platform censorship-resistant?**  
A: Content is stored on Walrus (decentralized storage) and metadata on Sui blockchain. No single entity can remove or censor content.

**Q: Do I need cryptocurrency to use the platform?**  
A: Reading free content requires no wallet or crypto. Creating newsletters, publishing issues, and accessing premium content require a Sui wallet and small amounts of SUI for transaction fees.

**Q: What is Walrus?**  
A: Walrus is a decentralized storage network where newsletter content is stored immutably.

**Q: What is Seal?**  
A: Seal is Sui's decentralized secrets management service that enables token-gated content encryption.

### For Creators

**Q: How much does it cost to create a newsletter?**  
A: Only Sui blockchain transaction fees (typically < $0.01 per transaction).

**Q: How do I monetize my newsletter?**  
A: Mint and sell access NFTs to subscribers. You control pricing and distribution.

**Q: Can I change my newsletter's access model later?**  
A: No, access models are set at creation. Create a new newsletter if you want to change models.

**Q: What happens if Walrus goes down?**  
A: Walrus is decentralized with multiple nodes. Content remains accessible as long as any nodes are online.

**Q: Can I delete an issue after publishing?**  
A: No, content on Walrus and blockchain records are immutable. Review carefully before publishing.

### For Subscribers

**Q: How do I get an access NFT?**  
A: Purchase from the creator (off-platform) or receive as a gift. Creators mint and distribute NFTs.

**Q: Can I share my NFT with friends?**  
A: Yes, NFTs are transferable. Transfer through your wallet, but you'll lose access when you transfer.

**Q: What if I lose access to my wallet?**  
A: Your NFTs and subscriptions are tied to your wallet address. Losing wallet access means losing your NFTs. Always backup your wallet!

**Q: Do subscriptions give me access to premium content?**  
A: No, subscriptions are for following newsletters. Premium content requires an access NFT.

---

## Troubleshooting

### Connection Issues

**Problem: Wallet won't connect**
- Solution: Refresh the page and try again
- Ensure your wallet extension is unlocked
- Try a different browser
- Check wallet extension is up to date

**Problem: Transaction fails**
- Solution: Ensure you have enough SUI for gas fees
- Check network status (testnet/mainnet)
- Try increasing gas budget in wallet settings
- Wait a moment and retry

### Content Issues

**Problem: Content won't load**
- Solution: Check your internet connection
- Refresh the page
- Clear browser cache
- Try a different Walrus node (automatic retry)

**Problem: Premium content won't decrypt**
- Solution: Verify you own the access NFT
- Check NFT is for the correct newsletter
- Reconnect your wallet
- Approve the Seal transaction when prompted

**Problem: Issue publishing fails**
- Solution: Check content isn't empty
- Verify Walrus is accessible
- Ensure Seal policy is correctly configured
- Check you have enough SUI for gas

### NFT Issues

**Problem: Can't mint NFT**
- Solution: Verify you're the newsletter creator
- Check recipient address is valid (starts with 0x, 66 characters)
- Ensure you have SUI for gas fees
- Verify newsletter supports NFTs (not free-only)

**Problem: NFT doesn't grant access**
- Solution: Verify NFT is for the correct newsletter
- Check you're using the wallet that owns the NFT
- Refresh the page
- Check NFT wasn't transferred to another address

### Performance Issues

**Problem: Slow loading**
- Solution: Content is cached after first load
- Large issues may take longer to decrypt
- Check your internet connection
- Try refreshing to clear cache

---

## Privacy & Security

### What's Private
- Your wallet address is public on blockchain
- Your subscriptions are public on blockchain
- Your NFT ownership is public on blockchain
- Reading public content is anonymous (no wallet needed)

### What's Secure
- Premium content is encrypted end-to-end
- Decryption happens only in your browser
- Decryption keys are never stored
- Session keys expire after 10 minutes

### Best Practices
- Never share your wallet private keys
- Always verify transaction details before approving
- Use hardware wallets for valuable NFTs
- Keep wallet software updated
- Backup your wallet recovery phrase

---

## Support

### Getting Help
- Check this guide first
- Review the FAQ section
- Check the troubleshooting section
- Visit our community forum [link]
- Contact support [email/discord]

### Reporting Issues
- Describe the problem clearly
- Include steps to reproduce
- Note your wallet address (if relevant)
- Specify browser and wallet type
- Include any error messages

---

## Additional Resources

- **Sui Documentation**: https://docs.sui.io
- **Walrus Documentation**: https://docs.walrus.site
- **Seal Documentation**: https://docs.sui.io/concepts/cryptography/seal
- **Developer Guide**: See DEVELOPER_GUIDE.md
- **Deployment Guide**: See DEPLOYMENT_GUIDE.md

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0  
**Platform Status:** Testnet
