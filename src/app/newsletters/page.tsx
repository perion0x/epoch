'use client';

import { useState, useEffect } from 'react';
import { Newsletter } from '@/types';
import { NewsletterCard } from '@/components/NewsletterCard';
import { NewsletterSearch } from '@/components/NewsletterSearch';
import { useNewsletters } from '@/hooks/useNewsletters';
import Link from 'next/link';

/**
 * Newsletter browsing page
 * Implements Requirements 6.1, 6.5
 * 
 * Features:
 * - Display list of newsletters with metadata
 * - Search and filtering functionality
 * - Access model indicators
 * - Links to individual newsletter pages
 */
export default function NewslettersPage() {
  const { newsletters, loading, error, refreshNewsletters } = useNewsletters();
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'nft-gated' | 'hybrid'>('all');
  const [filteredNewsletters, setFilteredNewsletters] = useState<Newsletter[]>([]);

  // Apply search and filters
  useEffect(() => {
    let filtered = newsletters;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (newsletter) =>
          newsletter.title.toLowerCase().includes(query) ||
          newsletter.description.toLowerCase().includes(query) ||
          newsletter.creator.toLowerCase().includes(query)
      );
    }

    // Apply access model filter
    if (accessFilter !== 'all') {
      filtered = filtered.filter((newsletter) => {
        switch (accessFilter) {
          case 'free':
            return newsletter.accessModel.isFree;
          case 'nft-gated':
            return newsletter.accessModel.isNftGated && !newsletter.accessModel.isHybrid;
          case 'hybrid':
            return newsletter.accessModel.isHybrid;
          default:
            return true;
        }
      });
    }

    setFilteredNewsletters(filtered);
  }, [newsletters, searchQuery, accessFilter]);

  if (loading) {
    return (
      <main>
        <header className="app-header">
          <h1>Browse Newsletters</h1>
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
        </header>
        <div className="content">
          <div className="loading-state">
            <p>Loading newsletters...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <header className="app-header">
          <h1>Browse Newsletters</h1>
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
        </header>
        <div className="content">
          <div className="error-state">
            <p className="error-message">Error loading newsletters: {error}</p>
            <button onClick={refreshNewsletters} className="retry-button">
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
        <h1>Browse Newsletters</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
          <Link href="/newsletters/create" className="create-button">
            Create Newsletter
          </Link>
        </div>
      </header>

      <div className="content">
        <NewsletterSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          accessFilter={accessFilter}
          onAccessFilterChange={setAccessFilter}
        />

        {filteredNewsletters.length === 0 ? (
          <div className="empty-state">
            {searchQuery || accessFilter !== 'all' ? (
              <>
                <p>No newsletters match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setAccessFilter('all');
                  }}
                  className="clear-filters-button"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <p>No newsletters available yet. Be the first to create one!</p>
            )}
          </div>
        ) : (
          <>
            <div className="results-summary">
              <p>
                Showing {filteredNewsletters.length} of {newsletters.length} newsletters
              </p>
            </div>
            <div className="newsletter-grid">
              {filteredNewsletters.map((newsletter) => (
                <NewsletterCard key={newsletter.id} newsletter={newsletter} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
