# Implementation Plan: SPA Conversion for Walrus Sites

- [x] 1. Install React Router and dependencies
  - Install react-router-dom
  - Update package.json
  - _Requirements: 1.1, 2.1_

- [ ] 2. Create router configuration
  - [x] 2.1 Create src/router.tsx with route definitions
    - Define all routes with React Router syntax
    - Map old Next.js routes to new paths
    - Set up nested routes
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.2 Create RootLayout component
    - Move layout logic from app/layout.tsx
    - Include SuiProvider and other providers
    - Add Outlet for child routes
    - _Requirements: 2.4_

- [ ] 3. Convert page components
  - [x] 3.1 Convert HomePage (/)
    - Move from app/page.tsx to src/pages/HomePage.tsx
    - Remove Next.js specific code
    - Use React Router navigation
    - _Requirements: 4.1, 4.4_
  
  - [ ] 3.2 Convert NewslettersPage (/newsletters)
    - Move from app/newsletters/page.tsx
    - Convert to standard React component
    - Use useNavigate for navigation
    - _Requirements: 4.1, 4.2_
  
  - [ ] 3.3 Convert CreateNewsletterPage (/newsletters/create)
    - Move from app/newsletters/create/page.tsx
    - Update navigation after creation
    - _Requirements: 4.1_
  
  - [ ] 3.4 Convert NewsletterDetailPage (/newsletters/:id)
    - Move from app/newsletters/[id]/page.tsx
    - Use useParams() to get newsletter ID
    - Fetch data client-side with useQuery
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 3.5 Convert PublishIssuePage (/newsletters/:id/publish)
    - Move from app/newsletters/[id]/publish/page.tsx
    - Use useParams() for newsletter ID
    - _Requirements: 4.1, 4.2_
  
  - [ ] 3.6 Convert IssueDetailPage (/newsletters/:id/issues/:issueId)
    - Move from app/newsletters/[id]/issues/[issueId]/page.tsx
    - Use useParams() for both IDs
    - Handle content fetching client-side
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 3.7 Convert NFTManagementPage (/newsletters/:id/nfts)
    - Move from app/newsletters/[id]/nfts/page.tsx
    - Use useParams() for newsletter ID
    - _Requirements: 4.1, 4.2_

- [ ] 4. Update navigation components
  - [ ] 4.1 Replace Next.js Link with React Router Link
    - Update all <Link> imports
    - Change href to to prop
    - Update navigation patterns
    - _Requirements: 2.1, 2.4_
  
  - [ ] 4.2 Update programmatic navigation
    - Replace useRouter with useNavigate
    - Update router.push() calls
    - _Requirements: 2.1, 2.4_

- [ ] 5. Configure for static export
  - [ ] 5.1 Update Next.js config
    - Set output: 'export'
    - Configure images: { unoptimized: true }
    - Set trailingSlash: true
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 5.2 Create main entry point
    - Create src/main.tsx
    - Set up RouterProvider
    - Include all providers
    - _Requirements: 3.1, 3.3_
  
  - [ ] 5.3 Update index.html
    - Create public/index.html
    - Add root div
    - Link to main.tsx
    - _Requirements: 3.1_
  
  - [ ] 5.4 Update Walrus Sites config
    - Set spa_mode = true in .walrus-sites.toml
    - Configure fallback routing
    - _Requirements: 3.3, 3.4_

- [ ] 6. Test and verify
  - [ ] 6.1 Test local build
    - Run npm run build
    - Verify out/ directory structure
    - Test with local server
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 6.2 Test all routes
    - Navigate to each route
    - Test browser back/forward
    - Test direct URL access
    - Verify data loading
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 6.3 Test wallet integration
    - Connect wallet
    - Test all blockchain operations
    - Verify Seal integration
    - _Requirements: 4.3_

- [ ] 7. Deploy to Walrus Sites
  - [ ] 7.1 Build production bundle
    - Run npm run build
    - Verify output size
    - Check for errors
    - _Requirements: 3.1, 3.2_
  
  - [ ] 7.2 Deploy to Walrus
    - Run deployment script
    - Note site object ID
    - Get walrus.site URL
    - _Requirements: 3.3, 3.4_
  
  - [ ] 7.3 Verify deployment
    - Access walrus.site URL
    - Test all functionality
    - Verify content loading from Walrus
    - Test end-to-end flows
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Final checkpoint
  - Ensure all features work on Walrus Sites
  - Document the deployment
  - Celebrate 100% decentralization! 🎉
