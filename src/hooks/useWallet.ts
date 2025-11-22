'use client';

import { useCurrentAccount, useDisconnectWallet, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

/**
 * Custom hook for wallet session management
 * Implements Requirements 4.1 - session state management
 */
export function useWallet() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const suiClient = useSuiClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!account);
  }, [account]);

  return {
    account,
    address: account?.address,
    isConnected,
    disconnect,
    suiClient,
  };
}
