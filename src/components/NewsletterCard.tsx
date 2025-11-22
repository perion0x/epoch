'use client';

import Link from 'next/link';
import { Newsletter } from '@/types';

/**
 * Newsletter card component for displaying newsletter metadata
 * Implements Requirements 6.1, 6.5
 */
interface NewsletterCardProps {
  newsletter: Newsletter;
}

export function NewsletterCard({ newsletter }: NewsletterCardProps) {
  const { id, title, description, creator, accessModel, issueCount, createdAt } = newsletter;

  // Determine access model display
  const getAccessModelInfo = () => {
    if (accessModel.isFree) {
      return { label: 'Free', className: 'access-free', icon: '🌐' };
    } else if (accessModel.isHybrid) {
      return { label: 'Hybrid', className: 'access-hybrid', icon: '🔓' };
    } else if (accessModel.isNftGated) {
      return { label: 'NFT Gated', className: 'access-nft', icon: '🔒' };
    }
    return { label: 'Unknown', className: 'access-unknown', icon: '❓' };
  };

  const accessInfo = getAccessModelInfo();

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Link href={`/newsletters/${id}`} className="newsletter-card-link">
      <article className="newsletter-card">
        <div className="card-header">
          <h2 className="newsletter-title">{title}</h2>
          <span className={`access-badge ${accessInfo.className}`}>
            <span className="access-icon">{accessInfo.icon}</span>
            {accessInfo.label}
          </span>
        </div>

        <p className="newsletter-description">{description}</p>

        <div className="card-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Creator:</span>
            <span className="metadata-value creator-address">{formatAddress(creator)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Issues:</span>
            <span className="metadata-value">{issueCount}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Created:</span>
            <span className="metadata-value">{formatDate(createdAt)}</span>
          </div>
        </div>

        <div className="card-footer">
          <span className="view-link">View Newsletter →</span>
        </div>
      </article>
    </Link>
  );
}
