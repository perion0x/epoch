'use client';

import { useState, useEffect, useCallback } from 'react';
import { Newsletter, Issue, Subscription } from '@/types';
import { ContentSection } from '@/services/content';
import { cacheService } from '@/services/cache';

/**
 * Hook for fetching newsletter details, issues, and subscription status
 * Implements Requirements 6.2, 6.3, 6.5, 10.1, 10.3, 2.1, 2.2
 * Enhanced with caching (Task 11.1)
 */
export function useNewsletterDetail(newsletterId: string, userAddress?: string) {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasAccessNFT, setHasAccessNFT] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsletterDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get newsletter from cache first
      const cachedNewsletter = cacheService.getNewsletter(newsletterId);
      if (cachedNewsletter) {
        setNewsletter(cachedNewsletter);
      }

      // Try to get issues from cache
      const cachedIssues = cacheService.getIssues(newsletterId);
      if (cachedIssues) {
        setIssues(cachedIssues);
        // If we have both cached, we can show data immediately
        if (cachedNewsletter) {
          setLoading(false);
        }
      }
      // In a real implementation, this would query the Sui blockchain
      // For now, we'll use mock data for demonstration
      
      // TODO: Replace with actual Sui query when contracts are deployed
      // const suiClient = new SuiClient({ url: config.sui.rpcUrl });
      // const newsletterService = new NewsletterService(...);
      // const newsletter = await newsletterService.getNewsletter(newsletterId);

      // Mock newsletter data - matches the ID from useNewsletters
      const mockNewsletter: Newsletter = newsletterId === '0xdemo9999testdata' ? {
        id: newsletterId,
        creator: '0xabcdef1234567890abcdef1234567890abcdef12',
        title: 'Sui Ecosystem Updates',
        description: 'Everything happening in the Sui ecosystem. Protocol updates, new dApps, developer resources, and community highlights.',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xsealxyz',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        issueCount: 15,
      } : {
        id: newsletterId,
        creator: '0xabcdef1234567890abcdef1234567890abcdef12',
        title: 'Demo Newsletter',
        description: 'A demo newsletter for testing',
        accessModel: {
          isFree: false,
          isNftGated: false,
          isHybrid: true,
        },
        nftCollection: '0xnft123',
        sealPackageId: '0xseal123',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        issueCount: 12,
      };

      // Mock issues data (sorted in reverse chronological order - Requirement 6.2)
      const mockIssues: Issue[] = newsletterId === '0xdemo9999testdata' ? [
        {
          id: '0xsuiissue1',
          newsletterId,
          title: 'Sui Foundation Appoints Renée Berman as Strategic Advisor',
          walrusBlobId: '0xsuiblob1',
          content: 'Sui Foundation today announced the appointment of institutional finance leader Renée Berman as a key Strategic Advisor. Berman brings decades of leadership across capital markets, fintech innovation, and institutional blockchain adoption to Sui\'s Advisory Board at a time when the industry is shifting toward tokenized financial infrastructure, with Sui at the forefront of these efforts.\n\nMost recently, Berman drove strategic initiatives in digital asset securities as a Managing Director at the Depository Trust & Clearing Corporation (DTCC), where she led the development of a risk and control framework for digital asset securities, which has become a key reference point across the industry. She later extended this work through partnerships with the Global Blockchain Business Council (GBBC) and Oliver Wyman, developing a comprehensive risk framework for issuing securities on public blockchains.',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 2000 }],
            encryptedRanges: [],
          },
          publishedAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
          hasPremium: false,
        },
        {
          id: '0xsuiissue2',
          newsletterId,
          title: 'New dApps Launching on Sui This Week',
          walrusBlobId: '0xsuiblob2',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 1500 }],
            encryptedRanges: [],
          },
          publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
          hasPremium: false,
        },
        {
          id: '0xsuiissue3',
          newsletterId,
          title: 'Sui Move: Best Practices for Smart Contract Development',
          walrusBlobId: '0xsuiblob3',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 1800 }],
            encryptedRanges: [],
          },
          publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
          hasPremium: false,
        },
      ] : [
        {
          id: '0xissue1',
          newsletterId,
          title: 'Bitcoin ETF Approval: What It Means for Crypto',
          walrusBlobId: '0xblob1',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 1000 }],
            encryptedRanges: [{ start: 1000, end: 3000 }],
          },
          publishedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
          hasPremium: true, // Requirement 6.3 - premium content indicator
        },
        {
          id: '0xissue2',
          newsletterId,
          title: 'DeFi Protocols: A Comprehensive Analysis',
          walrusBlobId: '0xblob2',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 800 }],
            encryptedRanges: [{ start: 800, end: 2500 }],
          },
          publishedAt: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9 days ago
          hasPremium: true,
        },
        {
          id: '0xissue3',
          newsletterId,
          title: 'Layer 2 Solutions: Scaling Ethereum',
          walrusBlobId: '0xblob3',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 1500 }],
            encryptedRanges: [],
          },
          publishedAt: Date.now() - 16 * 24 * 60 * 60 * 1000, // 16 days ago
          hasPremium: false,
        },
        {
          id: '0xissue4',
          newsletterId,
          title: 'NFT Market Trends Q4 2024',
          walrusBlobId: '0xblob4',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 900 }],
            encryptedRanges: [{ start: 900, end: 2800 }],
          },
          publishedAt: Date.now() - 23 * 24 * 60 * 60 * 1000, // 23 days ago
          hasPremium: true,
        },
      ];

      // Cache the fetched data
      cacheService.cacheNewsletter(mockNewsletter);
      cacheService.cacheIssues(newsletterId, mockIssues);

      setNewsletter(mockNewsletter);
      setIssues(mockIssues);

      // Check subscription status if user is connected (Requirement 6.5)
      if (userAddress) {
        // TODO: Query actual subscription from blockchain
        // const subscriptions = await newsletterService.getSubscriptions(userAddress);
        // const userSubscription = subscriptions.find(s => s.newsletterId === newsletterId);
        
        // Mock subscription check
        const mockSubscription: Subscription | null = Math.random() > 0.5 ? {
          id: '0xsub123',
          subscriber: userAddress,
          newsletterId,
          subscribedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        } : null;

        setSubscription(mockSubscription);

        // Check if user has access NFT (Requirement 6.5)
        // TODO: Query actual NFT ownership from blockchain
        // const hasNFT = await checkNFTOwnership(userAddress, mockNewsletter.nftCollection);
        
        // Mock NFT ownership check
        const mockHasNFT = Math.random() > 0.7;
        setHasAccessNFT(mockHasNFT);
      }
    } catch (err) {
      console.error('Error fetching newsletter detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch newsletter details');
    } finally {
      setLoading(false);
    }
  }, [newsletterId, userAddress]);

  useEffect(() => {
    if (newsletterId) {
      fetchNewsletterDetail();
    }
  }, [newsletterId, fetchNewsletterDetail]);

  const refreshDetail = useCallback(() => {
    // Invalidate cache before fetching fresh data
    cacheService.invalidateNewsletter(newsletterId);
    cacheService.invalidateIssues(newsletterId);
    fetchNewsletterDetail();
  }, [fetchNewsletterDetail, newsletterId]);

  // Subscribe to newsletter (Requirement 10.1)
  const subscribe = useCallback(async () => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // TODO: Call actual newsletter service
      // const newsletterService = new NewsletterService(...);
      // const newSubscription = await newsletterService.subscribe(newsletterId, userAddress);
      
      // Mock subscription creation
      const newSubscription: Subscription = {
        id: '0xsub' + Math.random().toString(16).substring(2, 10),
        subscriber: userAddress,
        newsletterId,
        subscribedAt: Date.now(),
      };

      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      console.error('Error subscribing:', err);
      throw err;
    }
  }, [newsletterId, userAddress]);

  // Unsubscribe from newsletter (Requirement 10.3)
  const unsubscribe = useCallback(async () => {
    if (!userAddress || !subscription) {
      throw new Error('No active subscription');
    }

    try {
      // TODO: Call actual newsletter service
      // const newsletterService = new NewsletterService(...);
      // await newsletterService.unsubscribe(subscription.id, userAddress);
      
      // Mock unsubscribe
      setSubscription(null);
    } catch (err) {
      console.error('Error unsubscribing:', err);
      throw err;
    }
  }, [subscription, userAddress]);

  // Publish issue (Requirements 2.1, 2.2)
  const publishIssue = useCallback(async (title: string, sections: ContentSection[]) => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    try {
      // TODO: Call actual newsletter service
      // const suiClient = new SuiClient({ url: config.sui.rpcUrl });
      // const walrusClient = new WalrusClient(...);
      // const sealClient = new SealClient(...);
      // const newsletterService = new NewsletterService(suiClient, walrusClient, sealClient, packageId);
      // const newIssue = await newsletterService.publishIssue({ newsletterId, title, sections }, newsletter);
      
      // Mock issue creation
      const hasPremium = sections.some(s => s.type === 'premium');
      const newIssue: Issue = {
        id: '0xissue' + Math.random().toString(16).substring(2, 10),
        newsletterId,
        title,
        walrusBlobId: '0xblob' + Math.random().toString(16).substring(2, 10),
        contentBoundaries: {
          publicRanges: [{ start: 0, end: 1000 }],
          encryptedRanges: hasPremium ? [{ start: 1000, end: 3000 }] : [],
        },
        publishedAt: Date.now(),
        hasPremium,
      };

      // Add new issue to the list (at the beginning for reverse chronological order)
      setIssues(prevIssues => {
        const updatedIssues = [newIssue, ...prevIssues];
        // Invalidate and update cache
        cacheService.cacheIssues(newsletterId, updatedIssues);
        return updatedIssues;
      });
      
      // Update newsletter issue count
      if (newsletter) {
        const updatedNewsletter = {
          ...newsletter,
          issueCount: newsletter.issueCount + 1,
        };
        setNewsletter(updatedNewsletter);
        // Update cache
        cacheService.cacheNewsletter(updatedNewsletter);
      }

      return newIssue;
    } catch (err) {
      console.error('Error publishing issue:', err);
      throw err;
    }
  }, [newsletterId, userAddress, newsletter]);

  return {
    newsletter,
    issues,
    subscription,
    hasAccessNFT,
    loading,
    error,
    refreshDetail,
    subscribe,
    unsubscribe,
    publishIssue,
  };
}
