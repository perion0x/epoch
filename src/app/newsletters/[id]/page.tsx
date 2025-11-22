'use client';

import Link from 'next/link';
import { useNewsletterDetail } from '@/hooks/useNewsletterDetail';
import { useWallet } from '@/hooks/useWallet';
import { useState } from 'react';
import { usePagination } from '@/hooks/useLazyLoad';

/**
 * Newsletter detail page
 * Implements Requirements 6.2, 6.3, 6.5, 10.1, 10.3
 * 
 * Features:
 * - Display newsletter metadata
 * - List all issues in reverse chronological order (Requirement 6.2)
 * - Show premium content indicators (Requirement 6.3)
 * - Display subscriber's access level (Requirement 6.5)
 * - Implement subscribe/unsubscribe buttons (Requirements 10.1, 10.3)
 */
export default function NewsletterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { address, isConnected } = useWallet();
  const {
    newsletter,
    issues,
    subscription,
    hasAccessNFT,
    loading,
    error,
    refreshDetail,
    subscribe,
    unsubscribe,
  } = useNewsletterDetail(id, address);

  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  // Pagination for issues (Task 11.2 - lazy loading)
  const {
    displayedItems: displayedIssues,
    hasMore,
    loadMore,
  } = usePagination(issues, 5); // Show 5 issues at a time

  // Handle subscribe action (Requirement 10.1)
  const handleSubscribe = async () => {
    if (!isConnected) {
      setSubscribeError('Please connect your wallet to subscribe');
      return;
    }

    setSubscribing(true);
    setSubscribeError(null);

    try {
      await subscribe();
    } catch (err) {
      setSubscribeError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  // Handle unsubscribe action (Requirement 10.3)
  const handleUnsubscribe = async () => {
    if (!isConnected) {
      return;
    }

    setSubscribing(true);
    setSubscribeError(null);

    try {
      await unsubscribe();
    } catch (err) {
      setSubscribeError(err instanceof Error ? err.message : 'Failed to unsubscribe');
    } finally {
      setSubscribing(false);
    }
  };

  // Determine access level display (Requirement 6.5)
  const getAccessLevelInfo = () => {
    if (!newsletter) return null;

    if (newsletter.accessModel.isFree) {
      return {
        level: 'Full Access',
        description: 'All content is free to read',
        className: 'access-level-full',
        icon: '✓',
      };
    }

    if (hasAccessNFT) {
      return {
        level: 'Premium Access',
        description: 'You own an access NFT',
        className: 'access-level-premium',
        icon: '🔓',
      };
    }

    if (newsletter.accessModel.isHybrid) {
      return {
        level: 'Public Access',
        description: 'Premium content requires NFT',
        className: 'access-level-public',
        icon: '👁️',
      };
    }

    return {
      level: 'No Access',
      description: 'Premium content requires NFT',
      className: 'access-level-none',
      icon: '🔒',
    };
  };

  const accessLevelInfo = getAccessLevelInfo();

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  if (loading) {
    return (
      <main>
        <header className="app-header">
          <h1>Newsletter Details</h1>
          <Link href="/newsletters" className="back-link">
            ← Back to Browse
          </Link>
        </header>
        <div className="content">
          <div className="loading-state">
            <p>Loading newsletter...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !newsletter) {
    return (
      <main>
        <header className="app-header">
          <h1>Newsletter Details</h1>
          <Link href="/newsletters" className="back-link">
            ← Back to Browse
          </Link>
        </header>
        <div className="content">
          <div className="error-state">
            <p className="error-message">
              {error || 'Newsletter not found'}
            </p>
            <button onClick={refreshDetail} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="app-header">
        <h1>Newsletter Details</h1>
        <div className="nav-links">
          <Link href="/newsletters" className="back-link">
            ← Back to Browse
          </Link>
          {isConnected && address === newsletter.creator && (
            <>
              <Link href={`/newsletters/${id}/publish`} className="create-link">
                + Publish Issue
              </Link>
              {(newsletter.accessModel.isNftGated || newsletter.accessModel.isHybrid) && (
                <Link href={`/newsletters/${id}/nfts`} className="create-link">
                  🎫 Manage NFTs
                </Link>
              )}
            </>
          )}
          {isConnected && address !== newsletter.creator && (newsletter.accessModel.isNftGated || newsletter.accessModel.isHybrid) && (
            <Link href={`/newsletters/${id}/nfts`} className="create-link">
              🎫 View NFTs
            </Link>
          )}
        </div>
      </header>

      <div className="content">
        {/* Newsletter Metadata */}
        <div className="newsletter-detail-header">
          <div className="detail-title-section">
            <h2 className="detail-title">{newsletter.title}</h2>
            <div className="detail-badges">
              {newsletter.accessModel.isFree && (
                <span className="access-badge access-free">
                  <span className="access-icon">🌐</span>
                  Free
                </span>
              )}
              {newsletter.accessModel.isNftGated && !newsletter.accessModel.isHybrid && (
                <span className="access-badge access-nft">
                  <span className="access-icon">🔒</span>
                  NFT Gated
                </span>
              )}
              {newsletter.accessModel.isHybrid && (
                <span className="access-badge access-hybrid">
                  <span className="access-icon">🔓</span>
                  Hybrid
                </span>
              )}
            </div>
          </div>

          <p className="detail-description">{newsletter.description}</p>

          <div className="detail-metadata">
            <div className="metadata-row">
              <span className="metadata-label">Creator:</span>
              <span className="metadata-value creator-address">
                {formatAddress(newsletter.creator)}
              </span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">Created:</span>
              <span className="metadata-value">
                {formatDate(newsletter.createdAt)}
              </span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">Total Issues:</span>
              <span className="metadata-value">{newsletter.issueCount}</span>
            </div>
            {newsletter.nftCollection && (
              <div className="metadata-row">
                <span className="metadata-label">NFT Collection:</span>
                <span className="metadata-value creator-address">
                  {formatAddress(newsletter.nftCollection)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Access Level Display (Requirement 6.5) */}
        {accessLevelInfo && (
          <div className={`access-level-card ${accessLevelInfo.className}`}>
            <div className="access-level-header">
              <span className="access-level-icon">{accessLevelInfo.icon}</span>
              <div>
                <h3 className="access-level-title">{accessLevelInfo.level}</h3>
                <p className="access-level-description">
                  {accessLevelInfo.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscribe/Unsubscribe Buttons (Requirements 10.1, 10.3) */}
        <div className="subscription-section">
          {!isConnected ? (
            <div className="subscription-message">
              <p>Connect your wallet to subscribe to this newsletter</p>
            </div>
          ) : subscription ? (
            <div className="subscription-status">
              <div className="subscription-info">
                <span className="subscription-icon">✓</span>
                <div>
                  <p className="subscription-label">Subscribed</p>
                  <p className="subscription-date">
                    Since {formatDate(subscription.subscribedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUnsubscribe}
                disabled={subscribing}
                className="unsubscribe-button"
              >
                {subscribing ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="subscribe-button"
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          )}
          {subscribeError && (
            <p className="subscription-error">{subscribeError}</p>
          )}
        </div>

        {/* Issues List (Requirements 6.2, 6.3) */}
        <div className="issues-section">
          <h3 className="section-title">
            Published Issues ({issues.length})
          </h3>

          {issues.length === 0 ? (
            <div className="empty-state">
              <p>No issues published yet. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="issues-list">
                {displayedIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/newsletters/${newsletter.id}/issues/${issue.id}`}
                  className="issue-card-link"
                >
                  <article className="issue-card">
                    <div className="issue-header">
                      <h4 className="issue-title">{issue.title}</h4>
                      {/* Premium content indicator (Requirement 6.3) */}
                      {issue.hasPremium && (
                        <span className="premium-badge">
                          <span className="premium-icon">⭐</span>
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="issue-metadata">
                      <span className="issue-date">
                        {formatDate(issue.publishedAt)}
                      </span>
                      {issue.hasPremium && !hasAccessNFT && !newsletter.accessModel.isFree && (
                        <span className="locked-indicator">
                          🔒 Premium content locked
                        </span>
                      )}
                    </div>
                    <div className="issue-footer">
                      <span className="read-link">Read Issue →</span>
                    </div>
                  </article>
                </Link>
                ))}
              </div>
              
              {/* Load More button for pagination */}
              {hasMore && (
                <div className="load-more-container">
                  <button onClick={loadMore} className="load-more-button">
                    Load More Issues
                  </button>
                  <p className="load-more-info">
                    Showing {displayedIssues.length} of {issues.length} issues
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
