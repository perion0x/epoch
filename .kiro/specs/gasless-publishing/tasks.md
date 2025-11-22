# Implementation Plan: Gasless Newsletter Publishing

- [ ] 1. Set up backend infrastructure
  - [x] 1.1 Create Gas Station service structure
    - Create src/services/gas-station.ts
    - Implement GasStationService class with config
    - Set up sponsor wallet loading from environment
    - Add transaction validation logic
    - _Requirements: 3.1, 3.2_
  
  - [x] 1.2 Implement keypair management
    - Create src/services/keypair-manager.ts
    - Implement KeypairManager class
    - Add keypair generation with Ed25519
    - Implement encryption/decryption for private keys
    - Add database schema for user keypairs
    - _Requirements: 1.2, 1.5_
  
  - [x] 1.3 Set up database for gasless operations
    - Create migrations for user_sessions table
    - Create migrations for user_keypairs table
    - Create migrations for sponsored_transactions table
    - Add indexes for performance
    - _Requirements: 1.5, 5.1_
  
  - [ ] 1.4 Write property test for keypair generation
    - **Property 1: Keypair generation for all users**
    - **Validates: Requirements 1.2, 1.5**

- [ ] 2. Implement transaction sponsorship
  - [ ] 2.1 Build transaction sponsorship logic
    - Implement sponsorTransaction method in GasStationService
    - Add sponsor signature to transaction bytes
    - Implement transaction submission to Sui
    - Handle transaction confirmation
    - _Requirements: 1.3, 2.3, 3.3, 3.4_
  
  - [ ] 2.2 Implement transaction validation
    - Add validateTransaction method
    - Check transaction type against allowlist
    - Validate transaction parameters
    - Verify gas limits
    - _Requirements: 3.2, 6.1, 6.5_
  
  - [ ] 2.3 Add rate limiting
    - Implement checkRateLimit method
    - Use Redis for distributed rate limiting
    - Set limits: 10 newsletters/day, 50 issues/day per user
    - Add rate limit exceeded error handling
    - _Requirements: 6.2, 6.3_
  
  - [ ] 2.4 Write property test for sponsorship
    - **Property 2: All newsletter transactions are sponsored**
    - **Property 6: Users never pay gas**
    - **Property 9: Valid transactions get sponsored**
    - **Validates: Requirements 1.3, 2.3, 2.4, 3.3**
  
  - [ ] 2.5 Write property test for validation
    - **Property 8: Transaction type validation**
    - **Property 16: Only allowed operations are sponsored**
    - **Validates: Requirements 3.2, 6.1, 6.5**
  
  - [ ] 2.6 Write property test for rate limiting
    - **Property 15: Rate limits are enforced**
    - **Validates: Requirements 6.2**

- [ ] 3. Implement gasless API endpoints
  - [x] 3.1 Create gasless newsletter API
    - Create src/app/api/gasless/newsletters/route.ts
    - Implement POST /api/gasless/newsletters (create)
    - Implement GET /api/gasless/newsletters/:id
    - Add session management for users
    - _Requirements: 1.1, 1.4, 7.1, 7.2_
  
  - [ ] 3.2 Create gasless issue publishing API
    - Create src/app/api/gasless/issues/route.ts
    - Implement POST /api/gasless/issues (publish)
    - Implement GET /api/gasless/issues/:id
    - Orchestrate Walrus upload + sponsored transaction
    - _Requirements: 2.1, 2.2, 7.3_
  
  - [ ] 3.3 Implement newsletter creation workflow
    - Generate or retrieve user keypair
    - Build newsletter creation transaction
    - Request sponsorship from Gas Station
    - Submit transaction and wait for confirmation
    - Return newsletter ID to user
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 3.4 Implement issue publishing workflow
    - Encrypt premium sections with Seal
    - Upload content to Walrus
    - Build issue creation transaction
    - Request sponsorship from Gas Station
    - Submit transaction and confirm
    - Return issue ID and blob ID
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 3.5 Write property test for API workflows
    - **Property 3: Newsletter ID returned on success**
    - **Property 17: API orchestrates full workflow**
    - **Property 18: Publishing orchestrates upload and transaction**
    - **Validates: Requirements 1.4, 7.2, 7.3**
  
  - [ ]* 3.6 Write property test for Walrus integration
    - **Property 4: Walrus upload for all issues**
    - **Property 5: Sponsored transactions after upload**
    - **Property 7: Walrus round-trip**
    - **Validates: Requirements 2.1, 2.2, 2.5**

- [ ] 4. Implement gas cost tracking
  - [ ] 4.1 Add transaction logging
    - Log all sponsored transactions to database
    - Record gas used, transaction type, user ID
    - Add timestamp and status tracking
    - _Requirements: 3.5, 5.1_
  
  - [ ] 4.2 Implement cost reporting
    - Create getGasCosts method in GasStationService
    - Aggregate costs by period (daily, weekly, monthly)
    - Break down by transaction type
    - _Requirements: 5.2, 5.5_
  
  - [ ] 4.3 Add monitoring and alerts
    - Monitor sponsor wallet balance
    - Alert when balance < 10 SUI
    - Alert when daily costs exceed threshold
    - Log all alerts for review
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 4.4 Write property test for cost tracking
    - **Property 11: Gas costs are logged**
    - **Property 14: Cost aggregation accuracy**
    - **Validates: Requirements 3.5, 5.1, 5.2, 5.5**

- [ ] 5. Update frontend for gasless flow
  - [ ] 5.1 Update newsletter creation form
    - Remove wallet connection requirement
    - Add session-based user identification
    - Update form to call gasless API
    - Show "No wallet needed!" message
    - _Requirements: 1.1_
  
  - [ ] 5.2 Update issue publishing form
    - Update to call gasless API
    - Show "Publishing to Walrus..." progress
    - Remove gas fee warnings
    - Display success with Walrus blob ID
    - _Requirements: 2.1, 2.5_
  
  - [x] 5.3 Create frontend gasless service
    - Create src/services/gasless-newsletter.ts
    - Implement createNewsletter method
    - Implement publishIssue method
    - Handle API errors gracefully
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [ ]* 5.4 Write property test for API responses
    - **Property 19: Consistent error responses**
    - **Property 20: Consistent success responses**
    - **Validates: Requirements 7.4, 7.5**

- [ ] 6. Implement premium content access (wallet required)
  - [ ] 6.1 Create premium content service
    - Create src/services/premium-content.ts
    - Implement checkNFTOwnership method
    - Implement requestSealDecryption method
    - Implement decryptPremiumContent method
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ] 6.2 Update issue reading page
    - Show locked premium sections
    - Add "Connect Wallet to Unlock" button
    - Check NFT ownership on wallet connect
    - Request Seal decryption if NFT owned
    - Display decrypted content
    - Show access denied if no NFT
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 6.3 Write property test for premium access
    - **Property 12: NFT ownership triggers Seal request**
    - **Property 13: Seal approval enables decryption**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [ ] 7. Add error handling and validation
  - [ ] 7.1 Implement error types
    - Create src/services/gasless-errors.ts
    - Define GaslessErrorCode enum
    - Implement GaslessError class
    - Add error mapping for all services
    - _Requirements: 7.4_
  
  - [ ] 7.2 Add input validation
    - Validate newsletter creation inputs
    - Validate issue publishing inputs
    - Add content size limits (10MB)
    - Validate user session tokens
    - _Requirements: 1.1, 2.1_
  
  - [ ] 7.3 Add retry logic
    - Retry Walrus uploads (3 attempts)
    - Retry transaction submissions (1 attempt)
    - Retry Seal operations (2 attempts)
    - Add exponential backoff
    - _Requirements: 2.1, 2.5_

- [ ] 8. Testing and deployment
  - [ ] 8.1 Set up testnet environment
    - Create sponsor wallet on Sui testnet
    - Fund wallet with testnet SUI
    - Configure environment variables
    - Set up Redis for rate limiting
    - _Requirements: All_
  
  - [ ] 8.2 Deploy backend services
    - Deploy Gas Station service
    - Deploy gasless API endpoints
    - Set up database migrations
    - Configure monitoring
    - _Requirements: All_
  
  - [ ] 8.3 Deploy frontend updates
    - Build and deploy updated forms
    - Test gasless newsletter creation
    - Test gasless issue publishing
    - Test premium content access
    - _Requirements: All_
  
  - [ ]* 8.4 Run integration tests
    - Test end-to-end gasless creation flow
    - Test end-to-end gasless publishing flow
    - Test premium content access with NFT
    - Test rate limiting enforcement
    - Test error handling
    - _Requirements: All_

- [ ] 9. Documentation and monitoring
  - [ ] 9.1 Write user documentation
    - Update creator guide for gasless flow
    - Document premium content access
    - Add FAQ for common issues
    - _Requirements: All_
  
  - [ ] 9.2 Write developer documentation
    - Document Gas Station API
    - Document gasless API endpoints
    - Add architecture diagrams
    - Document deployment process
    - _Requirements: All_
  
  - [ ] 9.3 Set up monitoring dashboard
    - Track transactions per second
    - Monitor gas costs
    - Track error rates
    - Monitor API response times
    - _Requirements: 5.1, 5.2_

- [ ] 10. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
