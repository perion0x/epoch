'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useNewsletterDetail } from '@/hooks/useNewsletterDetail';
import { MintNFTForm } from '@/components/MintNFTForm';
import { NFTList } from '@/components/NFTList';
import { NewsletterAccessNFT } from '@/types';

/**
 * NFT Management Interface
 * Implements Requirements 5.1, 5.3
 * 
 * Features:
 * - Display creator's newsletters
 * - Implement mint NFT form (recipient address)
 * - Show minted NFTs and their holders
 * - Display subscriber's owned NFTs
 */
export default function NFTManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { address, isConnected } = useWallet();
  const { newsletter, loading, error } = useNewsletterDetail(id, address);
  
  const [mintedNFTs, setMintedNFTs] = useState<NewsletterAccessNFT[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<NewsletterAccessNFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);

  const isCreator = newsletter && address && newsletter.creator === address;

  // Load NFTs when component mounts or newsletter changes
  useEffect(() => {
    if (newsletter) {
      loadNFTs();
    }
  }, [newsletter, address]);

  const loadNFTs = async () => {
    if (!newsletter) return;

    setLoadingNFTs(true);
    try {
      // For now, return empty arrays since we need backend indexing for full implementation
      // In a real implementation, this would query an indexer service
      setMintedNFTs([]);
      setOwnedNFTs([]);
    } catch (err) {
      console.error('Failed to load NFTs:', err);
    } finally {
      setLoadingNFTs(false);
    }
  };

  const handleNFTMinted = (nft: NewsletterAccessNFT) => {
    setMintedNFTs(prev => [nft, ...prev]);
    loadNFTs(); // Refresh the list
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main>
        <header className="app-header">
          <h1>NFT Management</h1>
          <Link href={`/newsletters/${id}`} className="back-link">
            ← Back to Newsletter
          </Link>
        </header>
        <div className="content">
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !newsletter) {
    return (
      <main>
        <header className="app-header">
          <h1>NFT Management</h1>
          <Link href={`/newsletters/${id}`} className="back-link">
            ← Back to Newsletter
          </Link>
        </header>
        <div className="content">
          <div className="error-state">
            <p className="error-message">
              {error || 'Newsletter not found'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Check if newsletter supports NFTs
  const supportsNFTs = newsletter.accessModel.isNftGated || newsletter.accessModel.isHybrid;

  if (!supportsNFTs) {
    return (
      <main>
        <header className="app-header">
          <h1>NFT Management</h1>
          <Link href={`/newsletters/${id}`} className="back-link">
            ← Back to Newsletter
          </Link>
        </header>
        <div className="content">
          <div className="info-message">
            <p>This newsletter does not use NFT-based access control.</p>
            <p>Only NFT-gated or hybrid newsletters support access NFTs.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="app-header">
        <h1>NFT Management</h1>
        <Link href={`/newsletters/${id}`} className="back-link">
          ← Back to Newsletter
        </Link>
      </header>

      <div className="content">
        {/* Newsletter Info */}
        <div className="newsletter-info-card">
          <h2 className="newsletter-title">{newsletter.title}</h2>
          <div className="newsletter-meta">
            <span className="meta-item">
              <span className="meta-label">Creator:</span>
              <span className="meta-value">{formatAddress(newsletter.creator)}</span>
            </span>
            {newsletter.nftCollection && (
              <span className="meta-item">
                <span className="meta-label">NFT Collection:</span>
                <span className="meta-value">{formatAddress(newsletter.nftCollection)}</span>
              </span>
            )}
          </div>
        </div>

        {!isConnected && (
          <div className="warning-message">
            <p>Please connect your wallet to manage NFTs</p>
          </div>
        )}

        {/* Creator Section - Mint NFT Form */}
        {isCreator && isConnected && (
          <section className="nft-section">
            <h3 className="section-title">Mint Access NFT</h3>
            <p className="section-description">
              Mint a new access NFT to grant premium content access to a subscriber.
            </p>
            <MintNFTForm
              newsletterId={newsletter.id}
              onNFTMinted={handleNFTMinted}
            />
          </section>
        )}

        {/* Creator Section - Minted NFTs List */}
        {isCreator && isConnected && (
          <section className="nft-section">
            <h3 className="section-title">
              Minted NFTs ({mintedNFTs.length})
            </h3>
            <p className="section-description">
              All access NFTs minted for this newsletter and their current holders.
            </p>
            {loadingNFTs ? (
              <div className="loading-state">
                <p>Loading NFTs...</p>
              </div>
            ) : (
              <NFTList
                nfts={mintedNFTs}
                emptyMessage="No NFTs have been minted yet."
                showHolder={true}
              />
            )}
          </section>
        )}

        {/* Subscriber Section - Owned NFTs */}
        {!isCreator && isConnected && (
          <section className="nft-section">
            <h3 className="section-title">
              Your Access NFTs ({ownedNFTs.length})
            </h3>
            <p className="section-description">
              Access NFTs you own for this newsletter.
            </p>
            {loadingNFTs ? (
              <div className="loading-state">
                <p>Loading your NFTs...</p>
              </div>
            ) : (
              <NFTList
                nfts={ownedNFTs}
                emptyMessage="You don't own any access NFTs for this newsletter."
                showHolder={false}
              />
            )}
          </section>
        )}

        {/* Both Creator and Subscriber can see general info */}
        {isConnected && (
          <section className="nft-section info-section">
            <h3 className="section-title">About Access NFTs</h3>
            <div className="info-content">
              <p>
                Access NFTs grant holders the ability to read premium content in this newsletter.
              </p>
              <ul className="info-list">
                <li>NFTs are transferable - you can send them to other addresses</li>
                <li>Only the current holder can access premium content</li>
                <li>NFTs are stored on the Sui blockchain</li>
                <li>Each NFT is unique and linked to this specific newsletter</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
