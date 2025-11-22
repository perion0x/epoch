'use client';

import { useWallet } from '@/hooks/useWallet';

/**
 * Component that displays wallet connection status
 * Demonstrates session state management
 */
export function WalletStatus() {
  const { isConnected, address, disconnect } = useWallet();

  if (!isConnected) {
    return (
      <div className="wallet-status">
        <p>Please connect your wallet to use the platform.</p>
      </div>
    );
  }

  return (
    <div className="wallet-status connected">
      <div className="status-info">
        <span className="status-indicator">●</span>
        <span>Connected</span>
      </div>
      <div className="address-display">
        <strong>Address:</strong> {address}
      </div>
      <button onClick={() => disconnect()} className="disconnect-button">
        Disconnect
      </button>
    </div>
  );
}
