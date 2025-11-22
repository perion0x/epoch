'use client';

import { useState, useEffect, useCallback } from 'react';
import { Newsletter } from '@/types';

/**
 * Hook for fetching and managing newsletters
 * Implements Requirements 6.1 - display list of newsletters with metadata
 */
export function useNewsletters() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsletters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Query all Newsletter objects from the blockchain
      // In a real implementation, this would query the Sui blockchain
      // For now, we'll use mock data for demonstration
      
      // TODO: Replace with actual Sui query when contracts are deployed
      // const suiClient = new SuiClient({ url: config.sui.rpcUrl });
      // const response = await suiClient.queryEvents({
      //   query: { MoveEventType: `${config.contracts.newsletterPackageId}::newsletter::NewsletterCreated` },
      // });

      // Mock data for demonstration - Rich demo content
      const mockNewsletters: Newsletter[] = [
        {
          id: '0xdemo9999testdata',
          creator: '0xabcdef1234567890abcdef1234567890abcdef12',
          title: 'Sui Ecosystem Updates',
          description: 'Everything happening in the Sui ecosystem. Protocol updates, new dApps, developer resources, and community highlights.',
          accessModel: {
            isFree: true,
            isNftGated: false,
            isHybrid: false,
          },
          sealPackageId: '0xsealxyz',
          createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
          issueCount: 15,
        },
        {
          id: '0xfedcba0987654321',
          creator: '0x1234567890abcdef1234567890abcdef12345678',
          title: 'Premium DeFi Insights',
          description: 'Exclusive DeFi strategies and market analysis for NFT holders. Advanced trading strategies, yield farming opportunities, and protocol deep-dives.',
          accessModel: {
            isFree: false,
            isNftGated: true,
            isHybrid: false,
          },
          nftCollection: '0xnft456',
          sealPackageId: '0xseal456',
          createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
          issueCount: 8,
        },
        {
          id: '0x9876543210fedcba',
          creator: '0xfedcba0987654321fedcba0987654321fedcba09',
          title: 'Web3 Builder Journal',
          description: 'Free tutorials with premium deep-dives for supporters. Learn smart contract development, dApp architecture, and blockchain fundamentals.',
          accessModel: {
            isFree: false,
            isNftGated: false,
            isHybrid: true,
          },
          nftCollection: '0xnft789',
          sealPackageId: '0xseal789',
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
          issueCount: 5,
        },
      ];

      setNewsletters(mockNewsletters);
    } catch (err) {
      console.error('Error fetching newsletters:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch newsletters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  const refreshNewsletters = useCallback(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  return {
    newsletters,
    loading,
    error,
    refreshNewsletters,
  };
}
