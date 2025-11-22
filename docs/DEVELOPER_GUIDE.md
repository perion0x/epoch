# Developer Guide

This guide provides technical documentation for developers who want to understand, extend, or integrate with the Decentralized Newsletter Platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contract API](#smart-contract-api)
3. [Frontend Integration](#frontend-integration)
4. [Deployment Instructions](#deployment-instructions)
5. [Development Setup](#development-setup)
6. [Testing](#testing)
7. [API Reference](#api-reference)
8. [Advanced Topics](#advanced-topics)

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (dApp)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │  React UI    │  │   Sui SDK    │     │
│  │   TypeScript │  │  Components  │  │   Wallet     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────┬──────────────┐
                            │                 │              │
                            ▼                 ▼              ▼
┌──────────────────────────────┐  ┌──────────────────┐  ┌──────────────┐
│      Sui Blockchain          │  │  Walrus Storage  │  │ Seal Servers │
│  ┌────────────────────────┐  │  │                  │  │              │
│  │  Newsletter Module     │  │  │  Content Blobs   │  │ Key Servers  │
│  │  Issue Module          │  │  │  (Encrypted)     │  │ (Threshold)  │
│  │  NFT Module            │  │  │                  │  │              │
│  │  Subscription Module   │  │  │                  │  │              │
│  │  Access Policy Module  │  │  │                  │  │              │
│  └────────────────────────┘  │  │                  │  │              │
└──────────────────────────────┘  └──────────────────┘  └──────────────┘
```

### Technology Stack

**Blockchain:**
- Sui Move for smart contracts
- Sui TypeScript SDK for blockchain interaction
- Sui Wallet Adapter for wallet integration

**Storage:**
- Walrus for decentralized content storage
- Walrus SDK for storage operations

**Access Control:**
- Sui Seal for token-gated encryption
- Seal SDK for encryption/decryption

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS

**Testing:**
- Vitest for unit tests
- fast-check for property-based testing
- Move testing framework for smart contracts

### Data Flow

#### Publishing Flow

```
Creator → Frontend → Seal (encrypt) → Walrus (store) → Sui (metadata) → Event
```

1. Creator writes content in frontend
2. Frontend splits public/premium sections
3. Premium sections encrypted via Seal SDK
4. Complete content uploaded to Walrus
5. Walrus returns Blob ID
6. Frontend creates Issue object on Sui
7. Event emitted for indexing

#### Reading Flow (Premium)

```
Subscriber → Frontend → Sui (metadata) → Walrus (content) → Seal (decrypt) → Display
```

1. Subscriber requests issue
2. Frontend fetches Issue object from Sui
3. Frontend retrieves content from Walrus
4. Frontend displays public sections
5. Frontend verifies NFT ownership
6. Frontend requests Seal approval
7. Seal key servers verify and return keys
8. Frontend decrypts premium sections
9. Full content displayed

## Smart Contract API

### Newsletter Module

Located at: `move/sources/newsletter.move`

#### Structs

```move
struct Newsletter has key, store {
    id: UID,
    creator: address,
    title: String,
    description: String,
    access_model: AccessModel,
    nft_collection: Option<address>,
    seal_package_id: address,
    created_at: u64,
    issue_count: u64
}

struct AccessModel has store, copy, drop {
    is_free: bool,
    is_nft_gated: bool,
    is_hybrid: bool
}
```

#### Functions

**create_newsletter**
```move
public entry fun create_newsletter(
    title: String,
    description: String,
    is_free: bool,
    is_nft_gated: bool,
    is_hybrid: bool,
    nft_collection: Option<address>,
    seal_package_id: address,
    ctx: &mut TxContext
)
```

Creates a new newsletter object.

**Parameters:**
- `title`: Newsletter title
- `description`: Newsletter description
- `is_free`, `is_nft_gated`, `is_hybrid`: Access model flags
- `nft_collection`: Optional NFT collection address
- `seal_package_id`: Seal access policy package ID
- `ctx`: Transaction context

**Emits:** `NewsletterCreated` event

**update_newsletter_metadata**
```move
public entry fun update_newsletter_metadata(
    newsletter: &mut Newsletter,
    title: String,
    description: String,
    ctx: &TxContext
)
```

Updates newsletter metadata (creator only).

### Issue Module

Located at: `move/sources/issue.move`

#### Structs

```move
struct Issue has key, store {
    id: UID,
    newsletter_id: ID,
    title: String,
    walrus_blob_id: vector<u8>,
    content_boundaries: ContentBoundaries,
    published_at: u64,
    has_premium: bool
}

struct ContentBoundaries has store, copy, drop {
    public_ranges: vector<Range>,
    encrypted_ranges: vector<Range>
}

struct Range has store, copy, drop {
    start: u64,
    end: u64
}
```

#### Functions

**publish_issue**
```move
public entry fun publish_issue(
    newsletter: &mut Newsletter,
    title: String,
    walrus_blob_id: vector<u8>,
    public_ranges: vector<Range>,
    encrypted_ranges: vector<Range>,
    has_premium: bool,
    clock: &Clock,
    ctx: &mut TxContext
)
```

Publishes a new issue.

**Parameters:**
- `newsletter`: Mutable reference to newsletter
- `title`: Issue title
- `walrus_blob_id`: Walrus blob identifier
- `public_ranges`: Byte ranges for public content
- `encrypted_ranges`: Byte ranges for encrypted content
- `has_premium`: Whether issue contains premium content
- `clock`: Sui clock for timestamp
- `ctx`: Transaction context

**Emits:** `IssuePublished` event

### NFT Module

Located at: `move/sources/nft.move`

#### Structs

```move
struct NewsletterAccessNFT has key, store {
    id: UID,
    newsletter_id: ID,
    access_level: u8,
    issued_at: u64
}
```

#### Functions

**mint_access_nft**
```move
public entry fun mint_access_nft(
    newsletter: &Newsletter,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext
)
```

Mints an access NFT (creator only).

**transfer_nft**
```move
public entry fun transfer_nft(
    nft: NewsletterAccessNFT,
    recipient: address
)
```

Transfers NFT to new owner.

### Subscription Module

Located at: `move/sources/subscription.move`

#### Structs

```move
struct Subscription has key, store {
    id: UID,
    subscriber: address,
    newsletter_id: ID,
    subscribed_at: u64
}
```

#### Functions

**subscribe**
```move
public entry fun subscribe(
    newsletter_id: ID,
    clock: &Clock,
    ctx: &mut TxContext
)
```

Creates a subscription.

**unsubscribe**
```move
public entry fun unsubscribe(
    subscription: Subscription
)
```

Removes a subscription.

### Access Policy Module

Located at: `move/sources/access_policy.move`

#### Functions

**seal_approve_nft**
```move
public entry fun seal_approve_nft(
    id: vector<u8>,
    nft: &NewsletterAccessNFT,
    ctx: &TxContext
)
```

Seal approval function for NFT-based access.

**Parameters:**
- `id`: Identity bytes (newsletter_id + issue_id)
- `nft`: Reference to access NFT
- `ctx`: Transaction context

**Aborts if:**
- NFT doesn't match newsletter
- Caller doesn't own NFT

## Frontend Integration

### Service Layer

#### NewsletterService

Located at: `src/services/newsletter.ts`

```typescript
class NewsletterService {
  constructor(
    private suiClient: SuiClient,
    private walrusClient: WalrusClient,
    private sealClient: SealClient
  ) {}

  // Create newsletter
  async createNewsletter(params: CreateNewsletterParams): Promise<Newsletter>

  // Publish issue
  async publishIssue(params: PublishIssueParams): Promise<Issue>

  // Mint access NFT
  async mintAccessNFT(newsletterId: string, recipient: string): Promise<NFT>

  // Get newsletter
  async getNewsletter(id: string): Promise<Newsletter>

  // Get issue
  async getIssue(id: string): Promise<Issue>

  // Get issue content
  async getIssueContent(issueId: string): Promise<IssueContent>

  // Decrypt premium content
  async decryptPremiumContent(issueId: string, nft: NFT): Promise<Uint8Array>

  // Subscribe
  async subscribe(newsletterId: string): Promise<Subscription>

  // Unsubscribe
  async unsubscribe(subscriptionId: string): Promise<void>

  // Get subscriptions
  async getSubscriptions(subscriber: string): Promise<Subscription[]>
}
```

#### WalrusClient

Located at: `src/services/walrus.ts`

```typescript
interface WalrusClient {
  // Store content
  store(content: Uint8Array): Promise<BlobId>

  // Retrieve content
  retrieve(blobId: BlobId): Promise<Uint8Array>

  // Check existence
  exists(blobId: BlobId): Promise<boolean>
}
```

#### SealClient

Located at: `src/services/seal.ts`

```typescript
interface SealClient {
  // Encrypt content
  encrypt(params: {
    threshold: number;
    packageId: string;
    id: string;
    data: Uint8Array;
  }): Promise<{
    encryptedObject: Uint8Array;
    key: Uint8Array;
  }>

  // Decrypt content
  decrypt(params: {
    data: Uint8Array;
    sessionKey: SessionKey;
    txBytes: Uint8Array;
  }): Promise<Uint8Array>

  // Create session key
  createSessionKey(params: {
    address: string;
    packageId: string;
    ttlMin: number;
  }): Promise<SessionKey>
}
```

### React Hooks

#### useNewsletters

```typescript
function useNewsletters() {
  const { data: newsletters, isLoading, error } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => {
      // Fetch all newsletters
    }
  })

  return { newsletters, isLoading, error }
}
```

#### useNewsletterDetail

```typescript
function useNewsletterDetail(id: string) {
  const { data: newsletter, isLoading, error } = useQuery({
    queryKey: ['newsletter', id],
    queryFn: async () => {
      // Fetch newsletter details
    }
  })

  return { newsletter, isLoading, error }
}
```

#### useIssueContent

```typescript
function useIssueContent(issueId: string) {
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['issue-content', issueId],
    queryFn: async () => {
      // Fetch and parse issue content
    }
  })

  return { content, isLoading, error }
}
```

### Components

Key React components:

- `NewsletterCreationForm`: Create new newsletters
- `IssuePublishingForm`: Publish new issues
- `NewsletterCard`: Display newsletter in list
- `NewsletterSearch`: Search and filter newsletters
- `IssueReader`: Display issue content
- `PremiumContentUnlock`: Unlock premium sections
- `MintNFTForm`: Mint access NFTs
- `NFTList`: Display NFT holders
- `AnalyticsDashboard`: Show analytics

## Deployment Instructions

### Prerequisites

- Node.js 18+
- Sui CLI
- Walrus CLI (optional)
- Git

### Environment Setup

1. **Clone Repository:**
```bash
git clone <repository-url>
cd decentralized-newsletter
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Configure Environment:**

Create `.env.local`:
```env
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Walrus
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Seal
NEXT_PUBLIC_SEAL_KEY_SERVER_URL=https://seal-testnet.sui.io

# Package IDs (update after deployment)
NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=0x...
NEXT_PUBLIC_ACCESS_POLICY_PACKAGE_ID=0x...
```

### Deploy Smart Contracts

1. **Build Move Packages:**
```bash
cd move
sui move build
```

2. **Run Tests:**
```bash
sui move test
```

3. **Deploy to Testnet:**
```bash
sui client publish --gas-budget 100000000
```

4. **Save Package IDs:**
- Copy the package ID from deployment output
- Update `.env.local` with package IDs

5. **Deploy Access Policy:**
```bash
cd move
sui client publish --gas-budget 100000000
```

### Deploy Frontend

#### Option 1: Vercel

1. **Connect Repository:**
- Go to vercel.com
- Import your repository
- Configure environment variables

2. **Deploy:**
```bash
vercel --prod
```

#### Option 2: IPFS

1. **Build:**
```bash
npm run build
npm run export
```

2. **Upload to IPFS:**
```bash
ipfs add -r out/
```

3. **Pin Content:**
- Use Pinata, Infura, or other pinning service
- Get IPFS hash

#### Option 3: Self-Hosted

1. **Build:**
```bash
npm run build
```

2. **Start:**
```bash
npm run start
```

3. **Configure Reverse Proxy:**
- Use Nginx or Apache
- Set up SSL/TLS
- Configure domain

### Post-Deployment

1. **Verify Contracts:**
- Test newsletter creation
- Test issue publishing
- Test NFT minting

2. **Test End-to-End:**
- Create test newsletter
- Publish test issue with premium content
- Mint test NFT
- Verify decryption works

3. **Monitor:**
- Set up error tracking (Sentry)
- Monitor transaction success rates
- Track Walrus/Seal availability

## Development Setup

### Local Development

1. **Start Development Server:**
```bash
npm run dev
```

2. **Access Application:**
- Open http://localhost:3000
- Connect wallet (testnet)

3. **Hot Reload:**
- Changes auto-reload
- Fast refresh for React components

### Testing Smart Contracts

```bash
cd move
sui move test
```

### Testing Frontend

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

## Testing

### Unit Tests

Located in `*.test.ts` files alongside source code.

**Example:**
```typescript
import { describe, it, expect } from 'vitest'
import { ContentService } from './content'

describe('ContentService', () => {
  it('should split content into sections', () => {
    const content = 'public\n---PREMIUM---\npremium\n---END PREMIUM---'
    const sections = ContentService.splitContent(content)
    
    expect(sections).toHaveLength(2)
    expect(sections[0].type).toBe('public')
    expect(sections[1].type).toBe('premium')
  })
})
```

### Property-Based Tests

Using fast-check for property testing.

**Example:**
```typescript
import { fc, test } from '@fast-check/vitest'

test.prop([fc.string(), fc.string()])('newsletter creation produces valid objects', async (title, description) => {
  const newsletter = await service.createNewsletter({ title, description })
  
  expect(newsletter.id).toBeDefined()
  expect(newsletter.title).toBe(title)
  expect(newsletter.description).toBe(description)
})
```

### Move Tests

Located in `*.test.move` files.

**Example:**
```move
#[test]
fun test_create_newsletter() {
    let ctx = tx_context::dummy();
    let title = string::utf8(b"Test Newsletter");
    let description = string::utf8(b"Test Description");
    
    let newsletter = newsletter::create_newsletter(
        title,
        description,
        true,
        false,
        false,
        option::none(),
        @0x1,
        &mut ctx
    );
    
    assert!(newsletter::title(&newsletter) == title, 0);
}
```

## API Reference

### Types

```typescript
interface Newsletter {
  id: string
  creator: string
  title: string
  description: string
  accessModel: AccessModel
  nftCollection?: string
  sealPackageId: string
  createdAt: number
  issueCount: number
}

interface AccessModel {
  isFree: boolean
  isNftGated: boolean
  isHybrid: boolean
}

interface Issue {
  id: string
  newsletterId: string
  title: string
  walrusBlobId: string
  contentBoundaries: ContentBoundaries
  publishedAt: number
  hasPremium: boolean
}

interface ContentBoundaries {
  publicRanges: Range[]
  encryptedRanges: Range[]
}

interface Range {
  start: number
  end: number
}

interface IssueContent {
  sections: Section[]
}

interface Section {
  type: 'public' | 'premium'
  content: string
  encrypted: boolean
}

interface NewsletterAccessNFT {
  id: string
  newsletterId: string
  accessLevel: number
  issuedAt: number
}

interface Subscription {
  id: string
  subscriber: string
  newsletterId: string
  subscribedAt: number
}
```

### Error Codes

```typescript
enum NewsletterError {
  WALRUS_STORAGE_FAILED = 'WALRUS_STORAGE_FAILED',
  WALRUS_RETRIEVAL_FAILED = 'WALRUS_RETRIEVAL_FAILED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  NFT_VERIFICATION_FAILED = 'NFT_VERIFICATION_FAILED',
  SEAL_APPROVAL_FAILED = 'SEAL_APPROVAL_FAILED',
  INVALID_CONTENT_FORMAT = 'INVALID_CONTENT_FORMAT',
  CONTENT_BOUNDARIES_INVALID = 'CONTENT_BOUNDARIES_INVALID',
  SESSION_KEY_EXPIRED = 'SESSION_KEY_EXPIRED',
  KEY_SERVER_UNAVAILABLE = 'KEY_SERVER_UNAVAILABLE'
}
```

## Advanced Topics

### Custom Seal Policies

You can create custom access control logic:

```move
module custom::time_based_policy {
    use sui::clock::Clock;
    
    entry fun seal_approve_time(
        id: vector<u8>,
        nft: &NewsletterAccessNFT,
        clock: &Clock,
        ctx: &TxContext
    ) {
        // Verify NFT ownership
        assert!(nft.newsletter_id == parse_newsletter_id(id), EInvalidNFT);
        
        // Add time-based logic
        let current_time = clock::timestamp_ms(clock);
        let issue_time = parse_issue_time(id);
        
        // Only allow access after 24 hours
        assert!(current_time >= issue_time + 86400000, EAccessTooEarly);
    }
}
```

### Batch Operations

For bulk operations, use batch transactions:

```typescript
async function batchMintNFTs(
  newsletterId: string,
  recipients: string[]
): Promise<void> {
  const tx = new TransactionBlock()
  
  for (const recipient of recipients) {
    tx.moveCall({
      target: `${PACKAGE_ID}::nft::mint_access_nft`,
      arguments: [
        tx.object(newsletterId),
        tx.pure(recipient),
        tx.object(SUI_CLOCK_OBJECT_ID)
      ]
    })
  }
  
  await signAndExecuteTransactionBlock({ transactionBlock: tx })
}
```

### Event Indexing

Index blockchain events for analytics:

```typescript
async function indexEvents() {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: `${PACKAGE_ID}::newsletter::NewsletterCreated`
    }
  })
  
  for (const event of events.data) {
    // Store in database
    await db.newsletters.create({
      id: event.parsedJson.newsletter_id,
      creator: event.parsedJson.creator,
      title: event.parsedJson.title,
      // ...
    })
  }
}
```

### Content Compression

Optimize storage costs:

```typescript
import pako from 'pako'

async function compressAndEncrypt(content: string): Promise<Uint8Array> {
  // Compress
  const compressed = pako.gzip(content)
  
  // Encrypt
  const encrypted = await sealClient.encrypt({
    threshold: 2,
    packageId: SEAL_PACKAGE_ID,
    id: issueId,
    data: compressed
  })
  
  return encrypted.encryptedObject
}

async function decryptAndDecompress(encrypted: Uint8Array): Promise<string> {
  // Decrypt
  const compressed = await sealClient.decrypt({
    data: encrypted,
    sessionKey,
    txBytes
  })
  
  // Decompress
  const decompressed = pako.ungzip(compressed, { to: 'string' })
  
  return decompressed
}
```

### Caching Strategy

Implement efficient caching:

```typescript
class CacheService {
  private cache = new Map<string, CacheEntry>()
  
  async get<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
    const cached = this.cache.get(key)
    
    if (cached && Date.now() < cached.expiry) {
      return cached.value as T
    }
    
    const value = await fetcher()
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    })
    
    return value
  }
}
```

### Monitoring

Set up monitoring and alerts:

```typescript
import * as Sentry from '@sentry/nextjs'

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
})

// Track errors
try {
  await publishIssue(params)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'publish_issue',
      newsletter_id: params.newsletterId
    }
  })
  throw error
}
```

## Contributing

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write tests for new features
- Document public APIs

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit pull request

### Commit Messages

Follow conventional commits:
```
feat: add batch NFT minting
fix: resolve decryption timeout issue
docs: update deployment guide
test: add property tests for content parsing
```

## Resources

**Documentation:**
- [Sui Documentation](https://docs.sui.io)
- [Walrus Documentation](https://docs.walrus.site)
- [Seal Documentation](https://docs.sui.io/concepts/cryptography/seal)

**SDKs:**
- [@mysten/sui.js](https://www.npmjs.com/package/@mysten/sui.js)
- [@mysten/seal](https://www.npmjs.com/package/@mysten/seal)
- [@walrus/sdk](https://www.npmjs.com/package/@walrus/sdk)

**Community:**
- Discord: [link]
- GitHub: [link]
- Twitter: [link]

## Support

For technical questions or issues:
- GitHub Issues: [link]
- Discord: [link]
- Email: dev@your-platform.com

Happy building! 🚀
