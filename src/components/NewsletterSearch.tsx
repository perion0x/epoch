'use client';

/**
 * Newsletter search and filter component
 * Implements Requirements 6.1 - search and filtering functionality
 */
interface NewsletterSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  accessFilter: 'all' | 'free' | 'nft-gated' | 'hybrid';
  onAccessFilterChange: (filter: 'all' | 'free' | 'nft-gated' | 'hybrid') => void;
}

export function NewsletterSearch({
  searchQuery,
  onSearchChange,
  accessFilter,
  onAccessFilterChange,
}: NewsletterSearchProps) {
  return (
    <div className="newsletter-search">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search newsletters by title, description, or creator..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          aria-label="Search newsletters"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="clear-search-button"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-section">
        <label htmlFor="access-filter" className="filter-label">
          Access Model:
        </label>
        <select
          id="access-filter"
          value={accessFilter}
          onChange={(e) =>
            onAccessFilterChange(e.target.value as 'all' | 'free' | 'nft-gated' | 'hybrid')
          }
          className="filter-select"
        >
          <option value="all">All Newsletters</option>
          <option value="free">Free Only</option>
          <option value="nft-gated">NFT Gated Only</option>
          <option value="hybrid">Hybrid Only</option>
        </select>
      </div>
    </div>
  );
}
