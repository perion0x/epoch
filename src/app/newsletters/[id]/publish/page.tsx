'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IssuePublishingForm } from '@/components/IssuePublishingForm';
import { useNewsletterDetail } from '@/hooks/useNewsletterDetail';
import { useWallet } from '@/hooks/useWallet';
import { ContentSection } from '@/services/content';

/**
 * Issue Publishing Page
 * Implements Requirements 2.1, 2.2
 * 
 * Features:
 * - Rich text editor for content
 * - Section markers for public/premium content
 * - Content preview
 * - Publishing progress tracking
 */
export default function PublishIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { newsletter, loading, error, publishIssue } = useNewsletterDetail(id, address);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Handle publish
  const handlePublish = async (title: string, sections: ContentSection[]) => {
    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    if (!isConnected || !address) {
      throw new Error('Please connect your wallet to publish');
    }

    // Verify user is the creator
    if (newsletter.creator !== address) {
      throw new Error('Only the newsletter creator can publish issues');
    }

    try {
      setPublishError(null);
      await publishIssue(title, sections);
      
      // Redirect to newsletter detail page after successful publish
      setTimeout(() => {
        router.push(`/newsletters/${id}`);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish issue';
      setPublishError(errorMessage);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <main>
        <header className="app-header">
          <h1>Publish Issue</h1>
          <Link href={`/newsletters/${id}`} className="back-link">
            ← Back to Newsletter
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

  // Error state
  if (error || !newsletter) {
    return (
      <main>
        <header className="app-header">
          <h1>Publish Issue</h1>
          <Link href={`/newsletters/${id}`} className="back-link">
            ← Back to Newsletter
          </Link>
        </header>
        <div className="content">
          <div className="error-state">
            <p className="error-message">
              {error || 'Newsletter not found'}
            </p>
            <Link href={`/newsletters/${id}`} className="retry-button">
              Go Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <main>
        <header className="app-header">
          <h1>Publish Issue</h1>
          <Link href={`/newsletters/${id}`} className="back-link">
            ← Back to Newsletter
          </Link>
        </header>
        <div className="content">
          <div className="auth-required">
            <div className="auth-icon">🔐</div>
            <h2>Wallet Connection Required</h2>
            <p>Please connect your wallet to publish issues.</p>
            <Link href={`/newsletters/${id}`} className="back-button">
              Go Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Not creator state
  if (newsletter.creator !== address) {
    return (
      <main>
        <header className="app-header">
          <h1>Publish Issue</h1>
          <Link href={`/newsletters/${id}`} className="back-link">
            ← Back to Newsletter
          </Link>
        </header>
        <div className="content">
          <div className="auth-required">
            <div className="auth-icon">🚫</div>
            <h2>Access Denied</h2>
            <p>Only the newsletter creator can publish issues.</p>
            <div className="creator-info">
              <p>
                <strong>Creator:</strong> {newsletter.creator}
              </p>
              <p>
                <strong>Your Address:</strong> {address}
              </p>
            </div>
            <Link href={`/newsletters/${id}`} className="back-button">
              Go Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="app-header">
        <h1>Publish Issue</h1>
        <Link href={`/newsletters/${id}`} className="back-link">
          ← Back to Newsletter
        </Link>
      </header>

      <div className="content">
        <IssuePublishingForm newsletter={newsletter} onPublish={handlePublish} />
        
        {publishError && (
          <div className="page-error">
            <span className="error-icon">⚠️</span>
            {publishError}
          </div>
        )}
      </div>
    </main>
  );
}
