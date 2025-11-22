'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

/**
 * Wallet connection component
 * Implements Requirements 4.1 - wallet connection for authentication
 */
export function WalletConnection() {
  const account = useCurrentAccount();

  return (
    <div className="wallet-connection">
      <ConnectButton />
      {account && (
        <div className="wallet-info">
          <span className="wallet-label">Connected:</span>
          <span className="wallet-address">
            {formatAddress(account.address)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Format address for display (show first 6 and last 4 characters)
 */
function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
