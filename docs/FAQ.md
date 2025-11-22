# Frequently Asked Questions (FAQ)

## General Questions

### What is the Decentralized Newsletter Platform?

A censorship-resistant newsletter platform built on Sui blockchain and Walrus decentralized storage. Creators can publish newsletters with token-gated premium content, while subscribers can read content without relying on centralized servers.

### Why use this instead of traditional newsletter platforms?

**Censorship Resistance:**
- No central authority can remove your content
- Content stored on decentralized Walrus network
- Metadata on immutable Sui blockchain

**Creator Control:**
- You own your content and subscriber relationships
- Direct monetization through NFTs
- No platform fees or revenue sharing

**Privacy:**
- Subscribers can read anonymously (public content)
- No tracking or data collection
- Decryption happens locally in browser

**Permanence:**
- Content is permanently stored
- No risk of platform shutdown
- Your work is preserved forever

### Is this platform free to use?

**For Subscribers:**
- Reading public content: Completely free, no wallet needed
- Reading premium content: Requires access NFT (may cost money)
- Subscribing: Small gas fee (~$0.01 worth of SUI)

**For Creators:**
- Creating newsletter: Small gas fee (~$0.05 worth of SUI)
- Publishing issues: Gas fee + Walrus storage fee (~$0.10-$1 depending on size)
- Minting NFTs: Small gas fee per NFT (~$0.02)

### What blockchain is this built on?

Sui blockchain, a high-performance Layer 1 blockchain with:
- Fast transaction finality (2-3 seconds)
- Low transaction costs
- Built-in NFT support
- Seal for decentralized access control

### What is Walrus?

Walrus is a decentralized storage protocol that:
- Stores content across multiple nodes
- Ensures content availability and permanence
- Provides censorship resistance
- Integrates seamlessly with Sui

## For Creators

### How do I get started as a creator?

1. Get a Sui wallet
2. Acquire some SUI tokens for gas fees
3. Connect wallet to the platform
4. Click "Create Newsletter"
5. Fill in details and choose access model
6. Start publishing!

See the [Creator Guide](./CREATOR_GUIDE.md) for detailed instructions.

### What are the different access models?

**Free Only:**
- All content is public
- No NFTs required
- Best for building audience

**NFT-Gated:**
- All content requires access NFT
- Full monetization
- Best for exclusive content

**Hybrid:**
- Mix of public and premium content
- Public sections attract readers
- Premium sections monetize
- Best for freemium model

### How do I monetize my newsletter?

**NFT Sales:**
- Mint access NFTs
- Sell directly to subscribers
- List on NFT marketplaces
- Set your own prices

**Subscription Services:**
- Partner with subscription platforms
- Automate NFT distribution
- Recurring revenue models

**Sponsorships:**
- Include sponsored content
- Maintain editorial control
- Direct creator-sponsor relationships

### Can I edit or delete published issues?

**No, content is immutable once published.**

This is by design for censorship resistance. However:
- You can publish corrections in new issues
- You can update newsletter metadata (title, description)
- Content on Walrus is permanent

**Best Practice:** Preview carefully before publishing!

### What happens if I lose access to my wallet?

**Critical:** Your wallet controls your newsletter!

If you lose access:
- You cannot publish new issues
- You cannot mint new NFTs
- You cannot update newsletter settings
- Your existing content remains accessible

**Prevention:**
- Backup your recovery phrase securely
- Consider using a hardware wallet
- Store backups in multiple secure locations

### How much does it cost to publish?

**Typical Costs:**
- Newsletter creation: ~$0.05 in SUI
- Publishing an issue (1MB): ~$0.50 in SUI
- Publishing an issue (5MB): ~$2.00 in SUI
- Minting an NFT: ~$0.02 in SUI

Costs vary based on:
- Content size
- Network congestion
- Walrus storage pricing

### Can I import my existing newsletter?

Currently, you need to manually republish content. Future features may include:
- Bulk import tools
- RSS feed integration
- Migration scripts

For now, you can:
- Copy/paste existing content
- Publish as new issues
- Maintain links to original content

### How do I grow my audience?

**On-Platform:**
- Publish consistently
- Use descriptive titles and descriptions
- Start with free content to build trust
- Engage with subscribers

**Off-Platform:**
- Share on social media
- Cross-promote with other creators
- Leverage existing audience
- SEO-optimize your content

**Quality:**
- Provide unique value
- Maintain high standards
- Listen to feedback
- Iterate and improve

## For Subscribers

### Do I need a wallet to read newsletters?

**For Public Content:** No
- Browse and read freely
- No registration required
- Completely anonymous

**For Premium Content:** Yes
- Need wallet to prove NFT ownership
- Required for content decryption
- Free to set up

### How do I get access to premium content?

1. **Acquire Access NFT:**
   - Buy from creator
   - Purchase on NFT marketplace
   - Receive as airdrop/gift

2. **Connect Wallet:**
   - Install Sui wallet
   - Connect to platform
   - Ensure NFT is in wallet

3. **Unlock Content:**
   - Navigate to premium issue
   - Click "Unlock Premium"
   - Approve verification
   - Read decrypted content

See the [Subscriber Guide](./SUBSCRIBER_GUIDE.md) for details.

### What's the difference between subscribing and having an access NFT?

**Subscription (Following):**
- Tracks newsletters you're interested in
- Enables notifications (if available)
- Shows in "My Subscriptions"
- Does NOT grant premium access

**Access NFT:**
- Grants access to premium content
- Proves ownership on-chain
- Can be bought, sold, or transferred
- Required for decryption

You can have one without the other!

### Can I share premium content with others?

**No, premium content is encrypted.**

- Each NFT holder must decrypt individually
- Sharing decrypted content violates creator's access control
- Respect creators' monetization model

You can:
- Share public content freely
- Share links (others need their own NFT)
- Recommend newsletters to friends

### Are my reading habits tracked?

**Public Content:**
- No tracking
- Anonymous browsing
- No analytics collected

**Premium Content:**
- Your wallet address is visible on-chain when unlocking
- Decryption happens locally (private)
- No centralized tracking

**Subscriptions:**
- On-chain record of subscriptions
- Used for notifications only
- No reading behavior tracked

### What if a creator stops publishing?

**Your access remains:**
- All published content stays on Walrus
- You can still read everything
- NFTs retain value for existing content

**No new content:**
- Creator must publish new issues
- Platform cannot force publishing
- Consider this when buying NFTs

### Can I resell my access NFT?

**Yes, NFTs are transferable!**

You can:
- Sell on NFT marketplaces
- Transfer to another wallet
- Gift to others
- Trade peer-to-peer

The new owner gets full access to premium content.

## Technical Questions

### What is Seal?

Seal is Sui's decentralized secrets management service:
- Provides token-gated encryption
- Verifies NFT ownership for decryption
- Uses threshold cryptography (multiple key servers)
- Ensures no single point of failure

### How does content decryption work?

1. **Encryption (Creator):**
   - Premium content encrypted with Seal
   - Encryption tied to NFT collection
   - Encrypted content stored on Walrus

2. **Decryption (Subscriber):**
   - Platform verifies NFT ownership
   - Seal key servers approve access
   - Decryption keys sent to browser
   - Content decrypts locally

3. **Security:**
   - Keys are temporary (expire after 10 minutes)
   - Decryption happens in your browser
   - No server sees your decrypted content

### Is my content/data secure?

**For Creators:**
- Content on Walrus is immutable and permanent
- Premium content encrypted with industry-standard cryptography
- Only NFT holders can decrypt
- No central point of failure

**For Subscribers:**
- Decryption happens locally
- Private keys never leave your wallet
- No tracking or surveillance
- Anonymous reading of public content

### What happens if Walrus goes down?

Walrus is decentralized with multiple nodes:
- Content replicated across nodes
- High availability design
- Automatic failover
- Very unlikely to go completely down

If temporary issues occur:
- Platform retries automatically
- Content loads when nodes recover
- No data loss

### What happens if Seal key servers go down?

Seal uses threshold cryptography:
- Multiple key servers (typically 3+)
- Only 2 of 3 needed for decryption
- High availability
- Redundancy built-in

If issues occur:
- Platform retries automatically
- Works as long as threshold is met
- Temporary unavailability possible but rare

### Can content be censored?

**No, by design:**

**Content Storage:**
- Walrus is decentralized
- No single entity controls storage
- Content is immutable once published

**Metadata:**
- Stored on Sui blockchain
- Immutable and permanent
- No central authority

**Access Control:**
- Seal is decentralized
- Multiple key servers
- No single point of control

**Frontend:**
- Can be hosted on IPFS
- Multiple mirrors possible
- Users can run their own frontend

### What are the system requirements?

**For Reading:**
- Modern web browser (Chrome, Firefox, Brave, Safari)
- Internet connection
- JavaScript enabled

**For Premium Content:**
- Above requirements plus:
- Sui wallet extension
- Sufficient browser memory for decryption

**Recommended:**
- Desktop or laptop for best experience
- Stable internet connection
- Updated browser

### Is there a mobile app?

Currently web-only, but:
- Mobile browsers work
- Responsive design
- Wallet apps support mobile

Future plans include:
- Native iOS app
- Native Android app
- Better mobile optimization

## Troubleshooting

### Why is content loading slowly?

**Possible causes:**
- Large content size
- Slow internet connection
- Walrus node congestion
- Browser performance

**Solutions:**
- Wait a bit longer
- Refresh the page
- Try a different browser
- Check internet connection

### Why can't I decrypt premium content?

**Check:**
1. Do you own the correct access NFT?
2. Is your wallet connected?
3. Is the NFT in the connected wallet?
4. Are Seal key servers online?

**Try:**
- Reconnect wallet
- Refresh page
- Try again in a few minutes
- Check platform status page

### Transaction failed - what do I do?

**Common causes:**
- Insufficient SUI for gas
- Network congestion
- Wallet connection lost

**Solutions:**
1. Check SUI balance
2. Reconnect wallet
3. Wait and retry
4. Increase gas budget (if option available)

### I found a bug - how do I report it?

**Report via:**
- GitHub Issues: [link]
- Discord: [link]
- Email: bugs@your-platform.com

**Include:**
- Description of the bug
- Steps to reproduce
- Browser and wallet used
- Screenshots if applicable
- Transaction hashes if relevant

## Platform and Ecosystem

### Who built this platform?

[Information about the team/organization]

### Is the code open source?

Yes! The platform is fully open source:
- Smart contracts: [GitHub link]
- Frontend: [GitHub link]
- Documentation: [GitHub link]

Contributions welcome!

### How is the platform governed?

[Information about governance model]

### What's the roadmap?

**Current Features:**
- Newsletter creation and publishing
- NFT-gated access control
- Subscription management
- Analytics dashboard

**Coming Soon:**
- Rich media support (images, videos)
- Comments and discussions
- Email notifications
- Mobile apps
- Multi-tier access
- Collaborative newsletters

See [GitHub](link) for full roadmap.

### How can I contribute?

**Developers:**
- Contribute code on GitHub
- Report bugs
- Suggest features
- Improve documentation

**Creators:**
- Publish great content
- Provide feedback
- Help test new features
- Share the platform

**Community:**
- Help new users
- Moderate discussions
- Translate documentation
- Spread the word

### Where can I get support?

**Documentation:**
- [Creator Guide](./CREATOR_GUIDE.md)
- [Subscriber Guide](./SUBSCRIBER_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

**Community:**
- Discord: [link]
- Twitter: [link]
- Reddit: [link]

**Direct Support:**
- Email: support@your-platform.com
- Response time: 24-48 hours

## Still Have Questions?

If your question isn't answered here:

1. Check the relevant guide (Creator or Subscriber)
2. Search the documentation
3. Ask in Discord community
4. Email support

We're here to help! 🚀
