'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Import dApp kit styles
import '@mysten/dapp-kit/dist/index.css';

// Create QueryClient outside component to avoid recreation on re-renders
const queryClient = new QueryClient();

/**
 * Sui provider component that wraps the app with necessary providers
 * Implements Requirements 4.1 - wallet integration and session management
 */
export function SuiProvider({ children }: { children: ReactNode }) {

  // Configure network (testnet by default)
  const networks = {
    testnet: { url: getFullnodeUrl('testnet') },
    mainnet: { url: getFullnodeUrl('mainnet') },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
