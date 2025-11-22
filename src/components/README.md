# Components

This directory contains reusable React components for the Decentralized Newsletter Platform.

## Components

### NewsletterCreationForm
**File:** `NewsletterCreationForm.tsx`  
**Requirements:** 1.1, 1.2, 1.3

Form component for creating new newsletters with the following features:
- Title and description input fields
- Access model selection (free, NFT-gated, hybrid)
- Conditional NFT collection address input for gated/hybrid models
- Form validation with error messages
- Integration with NewsletterService for on-chain creation
- Success/error message display
- Wallet connection requirement

**Usage:**
```tsx
import { NewsletterCreationForm } from '@/components/NewsletterCreationForm';

<NewsletterCreationForm />
```

### NewsletterCard
**File:** `NewsletterCard.tsx`  
**Requirements:** 6.1, 6.5

Card component for displaying newsletter metadata in browse view.

### NewsletterSearch
**File:** `NewsletterSearch.tsx`  
**Requirements:** 6.1

Search and filter component for newsletter browsing.

### WalletConnection
**File:** `WalletConnection.tsx`  
**Requirements:** 4.1

Wallet connection button and status display.

### WalletStatus
**File:** `WalletStatus.tsx`  
**Requirements:** 4.1

Detailed wallet connection status and management.
