# Requirements Document

## Introduction

A decentralized, censorship-resistant newsletter platform built on Sui and Walrus. The platform enables creators to publish newsletters with content stored immutably on Walrus, while using Sui's Seal for token-gated access control to premium content. The system supports both free (public) and paid (NFT-gated) newsletter models, ensuring creators maintain full control over their content without centralized intermediaries.

## Glossary

- **Newsletter Platform**: The decentralized application system that enables newsletter creation, publishing, and consumption
- **Creator**: A user who publishes newsletters on the platform
- **Subscriber**: A user who reads newsletters, either free or premium content
- **Newsletter**: A publication consisting of multiple issues, with metadata stored on Sui
- **Issue**: A single newsletter edition with content stored on Walrus
- **Premium Content**: Encrypted content sections accessible only to NFT holders or subscribers
- **Public Content**: Unencrypted content accessible to all readers
- **Access NFT**: A Sui NFT that grants access to premium newsletter content
- **Walrus**: Decentralized storage protocol for storing newsletter content
- **Seal**: Sui's decentralized secrets management service for access control
- **Blob ID**: Walrus identifier for stored content
- **Seal Package**: Move smart contract defining access control policies

## Requirements

### Requirement 1

**User Story:** As a creator, I want to create and configure a newsletter, so that I can establish my publication with metadata and access policies.

#### Acceptance Criteria

1. WHEN a creator initiates newsletter creation, THE Newsletter Platform SHALL create a Newsletter object on Sui with unique identifier, title, description, and creator address
2. WHEN a creator configures access settings, THE Newsletter Platform SHALL allow selection between free-only, NFT-gated, or hybrid access models
3. WHEN a creator sets NFT-gated access, THE Newsletter Platform SHALL record the NFT collection address for access verification
4. WHEN a newsletter is created, THE Newsletter Platform SHALL emit an event containing newsletter metadata for indexing
5. WHEN a creator updates newsletter metadata, THE Newsletter Platform SHALL preserve the newsletter identifier and update only mutable fields

### Requirement 2

**User Story:** As a creator, I want to publish newsletter issues with mixed public and premium content, so that I can provide free previews while monetizing premium sections.

#### Acceptance Criteria

1. WHEN a creator publishes an issue, THE Newsletter Platform SHALL store the complete content on Walrus and receive a Blob ID
2. WHEN an issue contains premium sections, THE Newsletter Platform SHALL encrypt premium content using Seal before Walrus storage
3. WHEN encrypting premium content, THE Newsletter Platform SHALL use the newsletter's Seal Package ID and issue-specific identity
4. WHEN an issue is published, THE Newsletter Platform SHALL create an Issue object on Sui linking to the Walrus Blob ID
5. WHEN an issue is published, THE Newsletter Platform SHALL record content boundaries indicating which byte ranges are public versus encrypted
6. WHEN publishing completes, THE Newsletter Platform SHALL emit an event with issue metadata and Walrus reference

### Requirement 3

**User Story:** As a subscriber, I want to read public newsletter content, so that I can access free content without authentication.

#### Acceptance Criteria

1. WHEN a subscriber requests an issue, THE Newsletter Platform SHALL retrieve the Walrus Blob ID from the Issue object
2. WHEN content is retrieved from Walrus, THE Newsletter Platform SHALL parse content boundaries to identify public sections
3. WHEN displaying content, THE Newsletter Platform SHALL render public sections without decryption
4. WHEN a subscriber views public content, THE Newsletter Platform SHALL not require wallet connection or authentication
5. WHEN content is unavailable on Walrus, THE Newsletter Platform SHALL display an appropriate error message

### Requirement 4

**User Story:** As an NFT holder, I want to access premium newsletter content, so that I can read exclusive sections I'm entitled to.

#### Acceptance Criteria

1. WHEN an NFT holder requests premium content, THE Newsletter Platform SHALL verify NFT ownership in the connected wallet
2. WHEN NFT ownership is verified, THE Newsletter Platform SHALL construct a Seal approval transaction with the user's address and NFT proof
3. WHEN the Seal approval succeeds, THE Newsletter Platform SHALL retrieve decryption keys from Seal key servers
4. WHEN decryption keys are obtained, THE Newsletter Platform SHALL decrypt premium content sections locally in the browser
5. WHEN decryption completes, THE Newsletter Platform SHALL render the full content including premium sections
6. WHEN NFT ownership verification fails, THE Newsletter Platform SHALL display only public content with premium sections marked as locked

### Requirement 5

**User Story:** As a creator, I want to mint access NFTs for my newsletter, so that I can distribute or sell access to premium content.

#### Acceptance Criteria

1. WHEN a creator initiates NFT minting, THE Newsletter Platform SHALL create an NFT collection linked to the newsletter
2. WHEN minting an access NFT, THE Newsletter Platform SHALL include newsletter identifier and access permissions in NFT metadata
3. WHEN an NFT is minted, THE Newsletter Platform SHALL allow the creator to specify the recipient address
4. WHEN an NFT is transferred, THE Newsletter Platform SHALL maintain access rights for the new holder
5. WHEN querying access, THE Newsletter Platform SHALL verify current NFT ownership on-chain

### Requirement 6

**User Story:** As a subscriber, I want to browse available newsletters and their issues, so that I can discover and access content.

#### Acceptance Criteria

1. WHEN a subscriber views the platform, THE Newsletter Platform SHALL display a list of available newsletters with metadata
2. WHEN a subscriber selects a newsletter, THE Newsletter Platform SHALL display all published issues in reverse chronological order
3. WHEN displaying issues, THE Newsletter Platform SHALL indicate which issues contain premium content
4. WHEN a subscriber views issue details, THE Newsletter Platform SHALL show publication date, title, and preview text
5. WHEN browsing, THE Newsletter Platform SHALL indicate the subscriber's access level for each newsletter

### Requirement 7

**User Story:** As a creator, I want to manage my newsletter's Seal access policy, so that I can control who can decrypt premium content.

#### Acceptance Criteria

1. WHEN a creator deploys a Seal policy, THE Newsletter Platform SHALL publish a Move package with seal_approve functions
2. WHEN the Seal policy is deployed, THE Newsletter Platform SHALL record the package ID in the Newsletter object
3. WHEN the policy checks access, THE Newsletter Platform SHALL verify NFT ownership against the specified collection
4. WHEN the policy is upgraded, THE Newsletter Platform SHALL maintain backward compatibility with existing encrypted content
5. WHEN access is denied, THE Seal policy SHALL abort without returning decryption keys

### Requirement 8

**User Story:** As a platform user, I want content to be censorship-resistant, so that newsletters remain accessible regardless of external pressures.

#### Acceptance Criteria

1. WHEN content is stored on Walrus, THE Newsletter Platform SHALL ensure content is distributed across decentralized storage nodes
2. WHEN a newsletter is published, THE Newsletter Platform SHALL not rely on centralized servers for content hosting
3. WHEN accessing content, THE Newsletter Platform SHALL retrieve data directly from Walrus nodes
4. WHEN metadata is stored on Sui, THE Newsletter Platform SHALL ensure immutability through blockchain consensus
5. WHEN a creator publishes content, THE Newsletter Platform SHALL not implement content moderation or filtering mechanisms

### Requirement 9

**User Story:** As a creator, I want to track newsletter analytics, so that I can understand my audience and content performance.

#### Acceptance Criteria

1. WHEN an issue is published, THE Newsletter Platform SHALL emit events that can be indexed off-chain
2. WHEN a subscriber accesses content, THE Newsletter Platform SHALL optionally record access events on-chain
3. WHEN querying analytics, THE Newsletter Platform SHALL provide issue view counts from indexed events
4. WHEN displaying analytics, THE Newsletter Platform SHALL show subscriber growth over time
5. WHEN analytics are unavailable, THE Newsletter Platform SHALL function normally without analytics data

### Requirement 10

**User Story:** As a subscriber, I want to manage my newsletter subscriptions, so that I can track newsletters I follow.

#### Acceptance Criteria

1. WHEN a subscriber follows a newsletter, THE Newsletter Platform SHALL create a subscription record on Sui
2. WHEN a subscriber views their subscriptions, THE Newsletter Platform SHALL display all followed newsletters
3. WHEN a subscriber unfollows a newsletter, THE Newsletter Platform SHALL remove the subscription record
4. WHEN new issues are published, THE Newsletter Platform SHALL enable off-chain notification services to query subscription data
5. WHEN a subscription exists, THE Newsletter Platform SHALL not affect access control for premium content

### Requirement 11

**User Story:** As a creator, I want to create and publish free newsletters without connecting a wallet, so that I can start publishing immediately without blockchain complexity.

#### Acceptance Criteria

1. WHEN a creator visits the create newsletter page, THE Newsletter Platform SHALL allow newsletter creation without wallet connection
2. WHEN a creator selects "Free" access model, THE Newsletter Platform SHALL store the newsletter in a traditional database
3. WHEN a creator publishes an issue to a traditional newsletter, THE Newsletter Platform SHALL store content in the database without blockchain transactions
4. WHEN a creator views a traditional newsletter, THE Newsletter Platform SHALL display content from the database
5. WHEN a creator creates a traditional newsletter, THE Newsletter Platform SHALL assign a unique identifier without blockchain interaction

### Requirement 12

**User Story:** As a creator, I want to upgrade my free newsletter to blockchain when I'm ready to add premium features, so that I can monetize my content later.

#### Acceptance Criteria

1. WHEN a creator views their traditional newsletter settings, THE Newsletter Platform SHALL display an "Upgrade to Blockchain" option
2. WHEN a creator clicks "Upgrade to Blockchain", THE Newsletter Platform SHALL prompt for wallet connection
3. WHEN a creator confirms blockchain upgrade, THE Newsletter Platform SHALL migrate newsletter metadata to Sui blockchain
4. WHEN a newsletter is upgraded, THE Newsletter Platform SHALL preserve all existing issues and content
5. WHEN a newsletter is upgraded, THE Newsletter Platform SHALL enable NFT-gating and premium content features

### Requirement 13

**User Story:** As a creator, I want to edit and delete traditional newsletter content, so that I can manage my content flexibly before committing to blockchain.

#### Acceptance Criteria

1. WHEN a creator views a traditional newsletter issue, THE Newsletter Platform SHALL display edit and delete options
2. WHEN a creator edits a traditional issue, THE Newsletter Platform SHALL update the database record
3. WHEN a creator deletes a traditional issue, THE Newsletter Platform SHALL remove it from the database
4. WHEN a newsletter is upgraded to blockchain, THE Newsletter Platform SHALL disable editing of migrated content
5. WHEN a creator attempts to edit blockchain content, THE Newsletter Platform SHALL display an immutability notice

### Requirement 14

**User Story:** As a reader, I want to browse and read free newsletters without a wallet, so that I can access content without blockchain complexity.

#### Acceptance Criteria

1. WHEN a reader browses newsletters, THE Newsletter Platform SHALL display both traditional and blockchain newsletters
2. WHEN a reader views a free traditional newsletter, THE Newsletter Platform SHALL not require wallet connection
3. WHEN a reader views a free blockchain newsletter, THE Newsletter Platform SHALL not require wallet connection for public content
4. WHEN a reader attempts to access premium content, THE Newsletter Platform SHALL require wallet connection and NFT ownership
5. WHEN displaying newsletters, THE Newsletter Platform SHALL clearly indicate which are traditional versus blockchain
