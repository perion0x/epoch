'use client';

import { NewsletterAccessNFT } from '@/types';

interface NFTListProps {
  nfts: NewsletterAccessNFT[];
  emptyMessage: string;
  showHolder: boolean;
}

/**
 * Component for displaying a list of NFTs
 * Implements Requirements 5.1, 5.3
 * 
 * Features:
 * - Show minted NFTs and their holders (when showHolder is true)
 * - Display subscriber's owned NFTs (when showHolder is false)
 */
export function NFTList({ nfts, emptyMessage, showHolder }: NFTListProps) {
  // Format address for display
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get access level label
  const getAccessLevelLabel = (level: number): string => {
    switch (level) {
      case 1:
        return 'Full Access';
      case 2:
        return 'Premium Access';
      case 3:
        return 'Limited Access';
      default:
        return 'Basic Access';
    }
  };

  if (nfts.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="nft-list">
      {nfts.map((nft) => (
        <div key={nft.id} className="nft-card">
          <div className="nft-header">
            <div className="nft-icon">🎫</div>
            <div className="nft-title-section">
              <h4 className="nft-title">Access NFT</h4>
              <span className="nft-id">{formatAddress(nft.id)}</span>
            </div>
          </div>

          <div className="nft-details">
            <div className="nft-detail-row">
              <span className="detail-label">Access Level:</span>
              <span className="detail-value access-level">
                {getAccessLevelLabel(nft.accessLevel)}
              </span>
            </div>

            <div className="nft-detail-row">
              <span className="detail-label">Issued:</span>
              <span className="detail-value">{formatDate(nft.issuedAt)}</span>
            </div>

            {showHolder && (
              <div className="nft-detail-row">
                <span className="detail-label">Current Holder:</span>
                <span className="detail-value holder-address">
                  <span className="holder-placeholder">View on explorer</span>
                </span>
              </div>
            )}
          </div>

          <div className="nft-actions">
            <button
              className="nft-action-button view-button"
              onClick={() => {
                // TODO: Implement view on explorer
                window.open(`https://suiscan.xyz/testnet/object/${nft.id}`, '_blank');
              }}
            >
              View on Explorer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
