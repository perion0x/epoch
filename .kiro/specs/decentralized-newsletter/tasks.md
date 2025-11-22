# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize TypeScript project with Next.js for frontend
  - Set up Sui Move project structure for smart contracts
  - Install dependencies: @mysten/sui.js, @mysten/seal, @walrus/sdk
  - Configure TypeScript, ESLint, and testing frameworks (Vitest, fast-check)
  - Set up environment configuration for testnet/mainnet
  - _Requirements: All_

- [x] 2. Implement core Move smart contracts
  - [x] 2.1 Create Newsletter module with object definitions
    - Define Newsletter struct with all fields (id, creator, title, description, access_model, nft_collection, seal_package_id, created_at, issue_count)
    - Define AccessModel struct (is_free, is_nft_gated, is_hybrid)
    - Implement create_newsletter function
    - Implement update_newsletter_metadata function
    - Emit NewsletterCreated events
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 2.2 Write property test for newsletter creation
    - **Property 1: Newsletter creation produces valid objects**
    - **Property 2: NFT collection address is stored for gated newsletters**
    - **Property 3: Newsletter creation emits events**
    - **Property 4: Newsletter updates preserve identity**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
  
  - [x] 2.3 Create Issue module with content references
    - Define Issue struct (id, newsletter_id, title, walrus_blob_id, content_boundaries, published_at, has_premium)
    - Define ContentBoundaries and Range structs
    - Implement publish_issue function
    - Emit IssuePublished events
    - _Requirements: 2.1, 2.4, 2.5, 2.6_
  
  - [ ]* 2.4 Write property test for issue publishing
    - **Property 5: Issue publishing stores content on Walrus**
    - **Property 8: Content boundaries are recorded**
    - **Property 9: Issue publishing emits events**
    - **Validates: Requirements 2.1, 2.4, 2.5, 2.6**
  
  - [x] 2.5 Implement NFT module for access control
    - Define NewsletterAccessNFT struct
    - Implement mint_access_nft function
    - Implement transfer logic
    - Emit NFTMinted events
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 2.6 Write property test for NFT operations
    - **Property 16: NFT minting creates collection link**
    - **Property 17: NFT minting respects recipient**
    - **Property 18: NFT transfer maintains access rights**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [x] 2.7 Create Subscription module
    - Define Subscription struct
    - Implement subscribe function
    - Implement unsubscribe function
    - Implement get_subscriptions query
    - Emit Subscribed/Unsubscribed events
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [ ]* 2.8 Write property test for subscriptions
    - **Property 32: Subscription creates on-chain record**
    - **Property 33: Unsubscribe removes record**
    - **Property 35: Subscriptions don't grant premium access**
    - **Validates: Requirements 10.1, 10.3, 10.5**

- [x] 3. Implement Seal access policy contract
  - [x] 3.1 Create access policy Move module
    - Implement seal_approve_nft function with NFT verification
    - Implement seal_approve_subscription function (alternative)
    - Implement parse_identity helper function
    - Add error constants (ENoAccess, EInvalidNFT)
    - _Requirements: 7.1, 7.3, 7.5_
  
  - [ ]* 3.2 Write property test for Seal policy
    - **Property 24: Access policy verifies NFT ownership**
    - **Property 26: Denied access aborts without keys**
    - **Validates: Requirements 7.3, 7.5**

- [x] 4. Checkpoint - Ensure all Move tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Implement Walrus integration layer
  - [x] 5.1 Create WalrusClient wrapper
    - Implement store method for uploading content
    - Implement retrieve method for downloading content
    - Implement exists method for checking blob availability
    - Add retry logic with exponential backoff
    - Handle Walrus node failures gracefully
    - _Requirements: 2.1, 3.1, 8.3_
  
  - [ ]* 5.2 Write property test for Walrus operations
    - **Property 5: Issue publishing stores content on Walrus**
    - **Property 27: Content retrieval uses Walrus**
    - **Validates: Requirements 2.1, 8.3**

- [-] 6. Implement Seal SDK integration
  - [x] 6.1 Create SealClient wrapper
    - Implement encrypt method with threshold configuration
    - Implement decrypt method with session key
    - Implement createSessionKey method
    - Configure Seal key servers (testnet)
    - Handle key server unavailability
    - _Requirements: 2.2, 2.3, 4.3, 4.4_
  
  - [ ]* 6.2 Write property test for encryption/decryption
    - **Property 6: Premium content is encrypted before storage**
    - **Property 7: Encryption uses correct parameters**
    - **Property 13: Decryption keys are retrieved after approval**
    - **Property 14: Decryption produces readable content**
    - **Validates: Requirements 2.2, 2.3, 4.3, 4.4**

- [x] 7. Implement content processing layer
  - [x] 7.1 Create content parser and serializer
    - Define StoredContent and Section interfaces
    - Implement content splitting (public vs premium sections)
    - Implement content boundary calculation
    - Implement content serialization for Walrus storage
    - Implement content deserialization from Walrus
    - _Requirements: 2.5, 3.2_
  
  - [ ]* 7.2 Write property test for content processing
    - **Property 8: Content boundaries are recorded**
    - **Property 10: Public content retrieval doesn't require decryption**
    - **Validates: Requirements 2.5, 3.3**

- [x] 8. Implement newsletter service layer
  - [x] 8.1 Create NewsletterService class
    - Implement createNewsletter method
    - Implement publishIssue method (orchestrates Walrus + Seal + Sui)
    - Implement mintAccessNFT method
    - Implement getNewsletter and getIssue methods
    - Implement getIssueContent method
    - _Requirements: 1.1, 2.1, 2.2, 5.1_
  
  - [x] 8.2 Implement content decryption workflow
    - Implement decryptPremiumContent method
    - Implement NFT ownership verification
    - Implement Seal approval transaction construction
    - Implement session key management
    - Handle decryption failures gracefully
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_
  
  - [ ]* 8.3 Write property test for service operations
    - **Property 11: NFT ownership is verified for premium access**
    - **Property 12: Seal approval uses correct parameters**
    - **Property 15: Failed verification prevents decryption**
    - **Validates: Requirements 4.1, 4.2, 4.6**
  
  - [x] 8.4 Implement subscription operations
    - Implement subscribe method
    - Implement unsubscribe method
    - Implement getSubscriptions method
    - _Requirements: 10.1, 10.3_
  
  - [ ]* 8.5 Write property test for subscription service
    - **Property 34: Subscription data is queryable**
    - **Validates: Requirements 10.4**

- [x] 9. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement frontend UI components
  - [x] 10.1 Create wallet connection component
    - Integrate Sui wallet adapter
    - Handle wallet connection/disconnection
    - Display connected address
    - Manage session state
    - _Requirements: 4.1_
  
  - [x] 10.2 Create newsletter creation form
    - Build form for title, description, access model
    - Add NFT collection address input for gated newsletters
    - Implement form validation
    - Call NewsletterService.createNewsletter
    - Display success/error messages
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 10.3 Create issue publishing interface
    - Build rich text editor for content
    - Add section markers for public/premium content
    - Implement content preview
    - Call NewsletterService.publishIssue
    - Show publishing progress (encrypting, uploading, confirming)
    - _Requirements: 2.1, 2.2_
  
  - [x] 10.4 Create newsletter browsing page
    - Display list of newsletters with metadata
    - Implement search and filtering
    - Show access model indicators
    - Link to individual newsletter pages
    - _Requirements: 6.1, 6.5_
  
  - [x] 10.5 Create newsletter detail page
    - Display newsletter metadata
    - List all issues in reverse chronological order
    - Show premium content indicators
    - Display subscriber's access level
    - Implement subscribe/unsubscribe buttons
    - _Requirements: 6.2, 6.3, 6.5, 10.1, 10.3_
  
  - [x] 10.6 Create issue reading page
    - Fetch and display issue content from Walrus
    - Render public sections immediately
    - Show locked premium sections for non-holders
    - Implement "Unlock Premium" button for NFT holders
    - Handle decryption and render premium content
    - Display loading states and errors
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.4, 4.6_
  
  - [x] 10.7 Create NFT management interface
    - Display creator's newsletters
    - Implement mint NFT form (recipient address)
    - Show minted NFTs and their holders
    - Display subscriber's owned NFTs
    - _Requirements: 5.1, 5.3_

- [ ] 11. Implement caching and optimization
  - [x] 11.1 Add browser caching layer
    - Cache newsletter metadata in localStorage
    - Cache issue lists with TTL
    - Cache decrypted content in memory (session-only)
    - Implement cache invalidation logic
    - _Requirements: Performance_
  
  - [x] 11.2 Implement lazy loading
    - Lazy load issue content on scroll
    - Lazy decrypt premium sections on demand
    - Paginate issue lists
    - _Requirements: Performance_
  
  - [x] 11.3 Add content compression
    - Compress content before encryption
    - Decompress after decryption
    - Use efficient serialization (MessagePack)
    - _Requirements: Performance_

- [ ] 12. Implement error handling and recovery
  - [x] 12.1 Add error handling to all service methods
    - Define NewsletterError enum
    - Implement retry logic for transient failures
    - Add user-friendly error messages
    - Log errors for debugging
    - _Requirements: All_
  
  - [x] 12.2 Add error boundaries to UI
    - Wrap components in error boundaries
    - Display fallback UI on errors
    - Provide retry actions
    - _Requirements: All_

- [ ] 13. Implement analytics and events
  - [x] 13.1 Add event indexing service
    - Index NewsletterCreated events
    - Index IssuePublished events
    - Index NFTMinted events
    - Index Subscribed/Unsubscribed events
    - Store in database for querying
    - _Requirements: 9.1, 9.2_
  
  - [x] 13.2 Create analytics dashboard
    - Display issue view counts
    - Show subscriber growth charts
    - Display NFT distribution
    - Show publication frequency
    - _Requirements: 9.3, 9.4_
  
  - [ ]* 13.3 Write property test for analytics
    - **Property 30: View counts are calculated correctly**
    - **Property 31: Subscriber growth is tracked**
    - **Validates: Requirements 9.3, 9.4**

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Deploy and test on testnet
  - [x] 15.1 Deploy Move contracts to Sui testnet
    - Deploy Newsletter module
    - Deploy Issue module
    - Deploy NFT module
    - Deploy Subscription module
    - Deploy Seal access policy
    - Record deployed package IDs
    - _Requirements: All_
  
  - [x] 15.2 Configure testnet environment
    - Set up Walrus testnet access
    - Configure Seal testnet key servers
    - Update frontend environment variables
    - _Requirements: All_
  
  - [x] 15.3 Deploy frontend to testnet
    - Build production bundle
    - Deploy to IPFS or Vercel
    - Test end-to-end flows
    - _Requirements: All_
  
  - [ ]* 15.4 Run integration tests on testnet
    - Test newsletter creation flow
    - Test issue publishing with premium content
    - Test NFT minting and access
    - Test subscription management
    - Test content decryption with real Seal servers
    - _Requirements: All_

- [x] 16. Documentation and deployment guide
  - [x] 16.1 Write user documentation
    - Creator guide (how to create newsletters, publish issues, mint NFTs)
    - Subscriber guide (how to browse, read, unlock premium content)
    - FAQ and troubleshooting
    - _Requirements: All_
  
  - [x] 16.2 Write developer documentation
    - Architecture overview
    - Smart contract API reference
    - Frontend integration guide
    - Deployment instructions
    - _Requirements: All_
  
  - [x] 16.3 Create deployment checklist
    - Mainnet deployment steps
    - Security audit checklist
    - Monitoring setup
    - Backup and recovery procedures
    - _Requirements: All_

- [x] 17. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Implement hybrid mode - Traditional newsletter support
  - [x] 18.1 Extend types for hybrid mode
    - Add NewsletterType enum to types/index.ts
    - Extend Newsletter interface with type field and optional blockchain fields
    - Add TraditionalNewsletter and BlockchainNewsletter type guards
    - _Requirements: 11.1, 11.2, 14.5_
  
  - [x] 18.2 Create database schema and client
    - Set up database connection (PostgreSQL or SQLite for local dev)
    - Create newsletters table with type discriminator
    - Create issues table for traditional content
    - Create migrations table for tracking upgrades
    - Add database client utility functions
    - _Requirements: 11.2, 11.3, 13.2_
  
  - [x] 18.3 Implement TraditionalNewsletterService
    - Create src/services/traditional-newsletter.ts
    - Implement createNewsletter (database-backed, no wallet)
    - Implement publishIssue (store content in database)
    - Implement updateNewsletter (edit metadata)
    - Implement updateIssue (edit content)
    - Implement deleteNewsletter and deleteIssue
    - Implement getNewsletter, getIssue, listIssues
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3_
  
  - [x] 18.4 Extend existing NewsletterService for routing
    - Rename current NewsletterService to BlockchainNewsletterService
    - Create new unified NewsletterService that routes to appropriate backend
    - Implement type detection logic
    - Add upgradeToBlockchain method
    - Ensure consistent error handling across both backends
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 18.5 Write property tests for traditional newsletters
    - **Property 36: Traditional newsletter creation without wallet**
    - **Property 37: Traditional content is editable**
    - **Validates: Requirements 11.1, 11.2, 13.1, 13.2**
  
  - [ ]* 18.6 Write property tests for migration
    - **Property 38: Blockchain upgrade preserves data**
    - **Property 39: Migrated content becomes immutable**
    - **Validates: Requirements 12.4, 13.4, 13.5**

- [ ] 19. Update frontend for hybrid mode
  - [ ] 19.1 Update newsletter creation form
    - Add "Create without wallet" option for free newsletters
    - Show wallet connection only when needed (NFT-gated/hybrid)
    - Update form validation logic
    - _Requirements: 11.1, 11.2_
  
  - [ ] 19.2 Update newsletter display components
    - Add type badges (Traditional vs Blockchain)
    - Show "Upgrade to Blockchain" button for traditional newsletters
    - Update NewsletterCard component
    - Update newsletter detail page
    - _Requirements: 14.5_
  
  - [ ] 19.3 Implement upgrade flow UI
    - Create upgrade modal/dialog
    - Add wallet connection prompt
    - Show migration progress
    - Handle migration errors
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ] 19.4 Add edit/delete UI for traditional newsletters
    - Add edit button to traditional issues
    - Create issue edit form
    - Add delete confirmation dialog
    - Disable edit/delete for blockchain newsletters
    - Show immutability notice
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 19.5 Update issue publishing form
    - Support both traditional and blockchain publishing
    - Auto-detect newsletter type
    - Adjust UI based on type (show/hide encryption options)
    - _Requirements: 11.3, 14.2_

- [ ] 20. Testing and refinement
  - [ ] 20.1 Test traditional newsletter flow
    - Create newsletter without wallet
    - Publish multiple issues
    - Edit and delete content
    - Verify database persistence
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3_
  
  - [ ] 20.2 Test upgrade flow
    - Create traditional newsletter
    - Publish issues
    - Upgrade to blockchain
    - Verify data preservation
    - Verify immutability after upgrade
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.4, 13.5_
  
  - [ ] 20.3 Test unified experience
    - Browse mixed traditional and blockchain newsletters
    - Verify consistent API responses
    - Test error handling
    - Verify wallet-less reading of free content
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ]* 20.4 Write integration tests
    - Test full traditional newsletter lifecycle
    - Test upgrade migration
    - Test mixed newsletter browsing
    - _Requirements: All hybrid mode requirements_

- [ ] 21. Final checkpoint - Hybrid mode complete
  - Ensure all tests pass, ask the user if questions arise.
