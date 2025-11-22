/**
 * Lazy loading component for premium content
 * Implements Task 11.2 - Lazy decrypt premium sections on demand
 */

'use client';

import { useState, useEffect } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { ContentSection } from '@/services/content';
import { cacheService } from '@/services/cache';

interface LazyPremiumContentProps {
  issueId: string;
  sections: ContentSection[];
  onDecrypt: () => Promise<ContentSection[]>;
  hasAccess: boolean;
}

export function LazyPremiumContent({
  issueId,
  sections,
  onDecrypt,
  hasAccess,
}: LazyPremiumContentProps) {
  const { elementRef, isVisible } = useLazyLoad<HTMLDivElement>();
  const [decryptedContent, setDecryptedContent] = useState<ContentSection[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only decrypt when visible and has access
    if (!isVisible || !hasAccess) return;
    if (decryptedContent) return; // Already decrypted

    // Check cache first
    const cached = cacheService.getDecryptedContent(issueId);
    if (cached) {
      setDecryptedContent(cached);
      return;
    }

    // Decrypt on demand
    const decrypt = async () => {
      setLoading(true);
      setError(null);

      try {
        const decrypted = await onDecrypt();
        setDecryptedContent(decrypted);
        // Cache the decrypted content in memory
        cacheService.cacheDecryptedContent(issueId, decrypted);
      } catch (err) {
        console.error('Failed to decrypt content:', err);
        setError(err instanceof Error ? err.message : 'Failed to decrypt content');
      } finally {
        setLoading(false);
      }
    };

    decrypt();
  }, [isVisible, hasAccess, issueId, onDecrypt, decryptedContent]);

  if (!hasAccess) {
    return (
      <div ref={elementRef} className="premium-locked">
        <div className="locked-icon">🔒</div>
        <h3>Premium Content</h3>
        <p>This content is only available to NFT holders.</p>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div ref={elementRef} className="lazy-load-placeholder">
        <p>Loading premium content...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div ref={elementRef} className="premium-loading">
        <div className="spinner"></div>
        <p>Decrypting premium content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div ref={elementRef} className="premium-error">
        <p className="error-message">{error}</p>
        <button onClick={() => setDecryptedContent(null)} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!decryptedContent) {
    return (
      <div ref={elementRef} className="lazy-load-placeholder">
        <p>Premium content will load when you scroll here...</p>
      </div>
    );
  }

  return (
    <div ref={elementRef} className="premium-content">
      {decryptedContent.map((section, index) => (
        <div key={index} className="content-section">
          <div className="section-badge premium">Premium</div>
          <div className="section-content">
            {section.format === 'markdown' ? (
              <div className="markdown-content">{section.content}</div>
            ) : section.format === 'html' ? (
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            ) : (
              <pre className="plain-content">{section.content}</pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
