# Design Document: Gasless Newsletter Publishing

## Overview

This design implements a gasless publishing system for the decentralized newsletter platform using Sui's sponsored transaction mechanism. The system allows creators to publish content without wallet connection or gas fees, while maintaining the security and decentralization benefits of blockchain storage.

The architecture introduces a Gas Station service that sponsors transactions on behalf of users, a temporary keypair management system for wallet-less operations, and seamless integration with existing Walrus and Seal infrastructure.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js App)  │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Gasless API    │                  │  Wallet Connect │
│   (Backend)     │                  │   (Optional)    │
└────────┬────────┘                  └─────────────────┘
         │                                     │
         ├──────────┬──────────┬──────────────┤
         │          │          │              │
         ▼          ▼          ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   Gas    │  │ Walrus   │  │   Seal   │  │   Sui    │
│ Station  │  │  Client  │  │  Client  │  │  Client  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
     │             │             │              │
     │             │             │              │
     ▼             ▼             ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Platform │  │  Walrus  │  │   Seal   │  │   Sui    │
│  Wallet  │  │ Network  │  │  Servers │  │ Blockchain│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Component Interaction Flow

**Newsletter Creation (Gasless):**
1. User submits form (no wallet)
2. Backend generates temporary keypair
3. Backend builds transaction
4. Gas Station adds sponsor signature
5. Transaction submitted to Sui
6. Newsletter ID returned to user

**Issue Publishing (Gasless):**
1. User submits content
2. Backend encrypts premium sections (Seal)
3. Backend uploads to Walrus
4. Backend builds issue transaction
5. Gas Station sponsors transaction
6. Issue confirmed on-chain

**Premium Content Access (With Wallet):**
1. User connects wallet
2. Frontend checks NFT ownership
3. If owned, request Seal decryption
4. Seal verifies NFT via access policy
5. Premium content decrypted and displayed

## Components and Interfaces

### 1. Gas Station Service

Backend service that sponsors transactions for users.

```typescript
interface GasStationConfig {
  sponsorPrivateKey: string;
  suiRpcUrl: string;
  maxGasPerTransaction: number;
  dailyGasLimit: number;
  allowedTransactionTypes: string[];
}

interface SponsorshipRequest {
  transactionBytes: Uint8Array;
  userAddress: string;
  transactionType: 'create_newsletter' | 'publish_issue' | 'mint_nft';
}

interface SponsorshipResponse {
  sponsoredTxBytes: Uint8Array;
  gasUsed: number;
  transactionDigest: string;
}

class GasStationService {
  async sponsorTransaction(request: SponsorshipRequest): Promise<SponsorshipResponse>;
  async validateTransaction(request: SponsorshipRequest): Promise<boolean>;
  async checkRateLimit(userAddress: string): Promise<boolean>;
  async getGasCosts(period: 'daily' | 'weekly' | 'monthly'): Promise<GasCostReport>;
}
```

### 2. Keypair Manager

Manages temporary keypairs for wallet-less users.

```typescript
interface UserKeypair {
  userId: string;
  publicKey: string;
  encryptedPrivateKey: string; // Encrypted with platform key
  createdAt: number;
  lastUsed: number;
}

class KeypairManager {
  async generateKeypair(userId: string): Promise<UserKeypair>;
  async getKeypair(userId: string): Promise<UserKeypair | null>;
  async signTransaction(userId: string, txBytes: Uint8Array): Promise<Uint8Array>;
  async deleteKeypair(userId: string): Promise<void>;
}
```

### 3. Gasless Newsletter API

Backend API endpoints for gasless operations.

```typescript
interface CreateNewsletterRequest {
  userId: string; // Session-based user ID
  title: string;
  description: string;
  accessModel: {
    isFree: boolean;
    isNftGated: boolean;
    isHybrid: boolean;
  };
  nftCollection?: string;
}

interface CreateNewsletterResponse {
  newsletterId: string;
  transactionDigest: string;
  userAddress: string; // Generated address for this user
}

interface PublishIssueRequest {
  userId: string;
  newsletterId: string;
  title: string;
  sections: ContentSection[];
}

interface PublishIssueResponse {
  issueId: string;
  walrusBlobId: string;
  transactionDigest: string;
}

class GaslessNewsletterAPI {
  async createNewsletter(req: CreateNewsletterRequest): Promise<CreateNewsletterResponse>;
  async publishIssue(req: PublishIssueRequest): Promise<PublishIssueResponse>;
  async getNewsletter(newsletterId: string): Promise<Newsletter>;
  async getIssue(issueId: string): Promise<Issue>;
}
```

### 4. Frontend Service Layer

Simplified frontend service that calls gasless API.

```typescript
class GaslessNewsletterService {
  private apiBaseUrl: string;
  
  async createNewsletter(params: {
    title: string;
    description: string;
    accessModel: AccessModel;
    nftCollection?: string;
  }): Promise<Newsletter>;
  
  async publishIssue(params: {
    newsletterId: string;
    title: string;
    sections: ContentSection[];
  }): Promise<Issue>;
  
  async getNewsletter(id: string): Promise<Newsletter>;
  async getIssue(id: string): Promise<Issue>;
  async getIssueContent(issueId: string): Promise<IssueContent>;
}
```

### 5. Premium Content Access (Wallet Required)

For NFT-gated content, users must connect wallet.

```typescript
interface AccessPremiumContentRequest {
  issueId: string;
  userAddress: string; // From connected wallet
  nftId: string;
}

interface AccessPremiumContentResponse {
  decryptedSections: ContentSection[];
}

class PremiumContentService {
  async checkNFTOwnership(userAddress: string, newsletterId: string): Promise<boolean>;
  async requestSealDecryption(issueId: string, nftId: string): Promise<Uint8Array>;
  async decryptPremiumContent(request: AccessPremiumContentRequest): Promise<ContentSection[]>;
}
```

## Data Models

### User Session

```typescript
interface UserSession {
  userId: string; // Generated session ID
  createdAt: number;
  lastActive: number;
  userAddress?: string; // Generated Sui address
  newsletters: string[]; // Newsletter IDs created by this user
}
```

### Sponsored Transaction Record

```typescript
interface SponsoredTransaction {
  id: string;
  userId: string;
  transactionDigest: string;
  transactionType: 'create_newsletter' | 'publish_issue' | 'mint_nft';
  gasUsed: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}
```

### Gas Cost Report

```typescript
interface GasCostReport {
  period: 'daily' | 'weekly' | 'monthly';
  totalTransactions: number;
  totalGasUsed: number;
  totalCostSUI: number;
  breakdown: {
    create_newsletter: { count: number; gasUsed: number };
    publish_issue: { count: number; gasUsed: number };
    mint_nft: { count: number; gasUsed: number };
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Keypair generation for all users
*For any* user submission, the system should generate and store a unique keypair
**Validates: Requirements 1.2, 1.5**

### Property 2: All newsletter transactions are sponsored
*For any* newsletter creation transaction, the platform wallet should be the gas sponsor
**Validates: Requirements 1.3, 2.3**

### Property 3: Newsletter ID returned on success
*For any* successful newsletter creation, a valid newsletter ID should be returned to the user
**Validates: Requirements 1.4**

### Property 4: Walrus upload for all issues
*For any* issue publication, content should be uploaded to Walrus and a blob ID returned
**Validates: Requirements 2.1**

### Property 5: Sponsored transactions after upload
*For any* successful Walrus upload, a sponsored transaction should be created for on-chain recording
**Validates: Requirements 2.2**

### Property 6: Users never pay gas
*For any* transaction in the system, the gas payer should be the platform wallet, not the user
**Validates: Requirements 2.4**

### Property 7: Walrus round-trip
*For any* content uploaded to Walrus, retrieving it should return the same content
**Validates: Requirements 2.5**

### Property 8: Transaction type validation
*For any* sponsorship request, the transaction type should be validated before sponsoring
**Validates: Requirements 3.2, 6.1**

### Property 9: Valid transactions get sponsored
*For any* valid transaction request, the gas station should add a sponsor signature
**Validates: Requirements 3.3**

### Property 10: Sponsored transactions are submitted
*For any* transaction with sponsor signature, it should be submitted to Sui
**Validates: Requirements 3.4**

### Property 11: Gas costs are logged
*For any* sponsored transaction, the gas cost should be recorded in the database
**Validates: Requirements 3.5, 5.1**

### Property 12: NFT ownership triggers Seal request
*For any* user with NFT ownership, accessing premium content should trigger a Seal decryption request
**Validates: Requirements 4.2, 4.3**

### Property 13: Seal approval enables decryption
*For any* Seal approval response, the premium content should be successfully decrypted
**Validates: Requirements 4.4**

### Property 14: Cost aggregation accuracy
*For any* set of transactions, the aggregated costs should equal the sum of individual transaction costs
**Validates: Requirements 5.2, 5.5**

### Property 15: Rate limits are enforced
*For any* user, the number of sponsored transactions within a time window should not exceed the rate limit
**Validates: Requirements 6.2**

### Property 16: Only allowed operations are sponsored
*For any* sponsored transaction, it should be one of the allowed operation types (newsletter, issue, NFT)
**Validates: Requirements 6.5**

### Property 17: API orchestrates full workflow
*For any* newsletter creation request, the API should handle keypair generation, transaction building, and sponsorship
**Validates: Requirements 7.2**

### Property 18: Publishing orchestrates upload and transaction
*For any* issue publication, the API should orchestrate both Walrus upload and sponsored transaction
**Validates: Requirements 7.3**

### Property 19: Consistent error responses
*For any* error condition, the API should return an error response matching the defined schema
**Validates: Requirements 7.4**

### Property 20: Consistent success responses
*For any* successful operation, the API should return a response matching the defined schema
**Validates: Requirements 7.5**

## Error Handling

### Error Types

```typescript
enum GaslessErrorCode {
  // Keypair errors
  KEYPAIR_GENERATION_FAILED = 'KEYPAIR_GENERATION_FAILED',
  KEYPAIR_NOT_FOUND = 'KEYPAIR_NOT_FOUND',
  KEYPAIR_DECRYPTION_FAILED = 'KEYPAIR_DECRYPTION_FAILED',
  
  // Sponsorship errors
  SPONSORSHIP_REJECTED = 'SPONSORSHIP_REJECTED',
  INVALID_TRANSACTION_TYPE = 'INVALID_TRANSACTION_TYPE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  GAS_LIMIT_EXCEEDED = 'GAS_LIMIT_EXCEEDED',
  
  // Walrus errors
  WALRUS_UPLOAD_FAILED = 'WALRUS_UPLOAD_FAILED',
  WALRUS_RETRIEVE_FAILED = 'WALRUS_RETRIEVE_FAILED',
  
  // Seal errors
  SEAL_ENCRYPTION_FAILED = 'SEAL_ENCRYPTION_FAILED',
  SEAL_DECRYPTION_FAILED = 'SEAL_DECRYPTION_FAILED',
  NFT_OWNERSHIP_VERIFICATION_FAILED = 'NFT_OWNERSHIP_VERIFICATION_FAILED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Transaction errors
  TRANSACTION_BUILD_FAILED = 'TRANSACTION_BUILD_FAILED',
  TRANSACTION_SUBMISSION_FAILED = 'TRANSACTION_SUBMISSION_FAILED',
  TRANSACTION_CONFIRMATION_TIMEOUT = 'TRANSACTION_CONFIRMATION_TIMEOUT',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // System errors
  SPONSOR_WALLET_UNAVAILABLE = 'SPONSOR_WALLET_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

class GaslessError extends Error {
  constructor(
    message: string,
    public readonly code: GaslessErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GaslessError';
  }
}
```

### Error Handling Strategy

1. **Keypair Errors**: Retry generation once, then fail with clear message
2. **Sponsorship Errors**: Return specific error codes for rate limits, invalid types, etc.
3. **Walrus Errors**: Retry with exponential backoff (3 attempts)
4. **Seal Errors**: Return access denied with explanation
5. **Transaction Errors**: Retry submission once, log for investigation
6. **System Errors**: Alert administrators, return generic error to user

## Testing Strategy

### Unit Testing

Unit tests will cover:
- Keypair generation and encryption
- Transaction validation logic
- Rate limiting enforcement
- Gas cost calculation
- Error handling for each component

### Property-Based Testing

Property-based tests will use **fast-check** (JavaScript/TypeScript PBT library) with minimum 100 iterations per test.

Each property-based test will be tagged with: `**Feature: gasless-publishing, Property {number}: {property_text}**`

Property tests will cover:
- **Property 1**: Keypair generation for random user IDs
- **Property 2**: Sponsor signature verification for all transactions
- **Property 6**: Gas payer verification across all transaction types
- **Property 7**: Walrus round-trip with random content
- **Property 14**: Cost aggregation with random transaction sets
- **Property 15**: Rate limit enforcement with burst requests
- **Property 20**: Response schema validation for all operations

### Integration Testing

Integration tests will cover:
- End-to-end newsletter creation flow (gasless)
- End-to-end issue publishing flow (gasless)
- Premium content access flow (with wallet)
- Gas station service with real Sui testnet
- Walrus upload and retrieval
- Seal encryption and decryption

### Security Testing

Security tests will cover:
- Rate limit bypass attempts
- Invalid transaction type submissions
- Keypair extraction attempts
- Sponsor wallet key protection
- Transaction replay attacks

## Performance Considerations

### Scalability

- **Keypair Storage**: Use encrypted database with indexing on userId
- **Transaction Queue**: Implement queue for sponsored transactions to handle bursts
- **Caching**: Cache user keypairs in memory with TTL
- **Rate Limiting**: Use Redis for distributed rate limiting

### Optimization

- **Batch Operations**: Support batch issue publishing for multiple newsletters
- **Parallel Processing**: Process Walrus uploads and transaction building in parallel
- **Connection Pooling**: Maintain connection pools for Sui RPC, Walrus, and database

### Monitoring

- **Metrics to Track**:
  - Transactions per second
  - Average gas cost per transaction
  - Walrus upload success rate
  - Seal decryption success rate
  - API response times
  - Error rates by type

- **Alerts**:
  - Sponsor wallet balance < 10 SUI
  - Daily gas cost > threshold
  - Error rate > 5%
  - API response time > 5s

## Security Considerations

### Keypair Security

- Store private keys encrypted with platform master key
- Rotate platform master key periodically
- Use HSM or secure enclave for sponsor wallet
- Implement key derivation for user keypairs

### Transaction Security

- Validate all transaction parameters before sponsoring
- Implement strict rate limits per user
- Log all sponsored transactions for audit
- Monitor for suspicious patterns (rapid creation, large content)

### Access Control

- Verify NFT ownership on-chain before Seal decryption
- Implement session management for wallet connections
- Use HTTPS for all API communications
- Implement CORS policies for frontend

### Abuse Prevention

- Rate limit: 10 newsletters per user per day
- Rate limit: 50 issues per newsletter per day
- Content size limit: 10MB per issue
- Monitor for spam patterns and flag users

## Deployment Strategy

### Phase 1: Backend Infrastructure
1. Deploy Gas Station service
2. Set up sponsor wallet with initial SUI balance
3. Deploy keypair management database
4. Configure monitoring and alerts

### Phase 2: API Layer
1. Deploy gasless API endpoints
2. Integrate with existing Walrus and Seal clients
3. Set up rate limiting with Redis
4. Deploy transaction queue

### Phase 3: Frontend Integration
1. Update newsletter creation form (remove wallet requirement)
2. Update issue publishing form (gasless flow)
3. Add premium content access UI (wallet required)
4. Deploy to testnet

### Phase 4: Testing and Optimization
1. Run integration tests on testnet
2. Load test with simulated users
3. Optimize gas costs
4. Fine-tune rate limits

### Phase 5: Production Deployment
1. Deploy to mainnet
2. Monitor gas costs and performance
3. Gradually increase rate limits
4. Collect user feedback

## Migration Path

For existing users with wallet-connected newsletters:
1. Continue supporting wallet-based operations
2. Offer migration to gasless mode (optional)
3. Maintain backward compatibility
4. Provide unified API for both modes

## Future Enhancements

1. **Gasless NFT Minting**: Sponsor NFT minting for creators
2. **Subscription Payments**: Integrate with payment providers for monetization
3. **Content Moderation**: Add automated content moderation before publishing
4. **Analytics Dashboard**: Show creators their gas savings
5. **Multi-chain Support**: Extend to other blockchains with sponsored transactions
