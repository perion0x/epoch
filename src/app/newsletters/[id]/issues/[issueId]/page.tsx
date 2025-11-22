'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Issue, Newsletter, NewsletterAccessNFT } from '@/types';
import { ContentSection } from '@/services/content';

/**
 * Issue Reading Page
 * Implements Requirements 3.1, 3.2, 3.3, 4.1, 4.4, 4.6
 * 
 * Features:
 * - Fetch and display issue content from Walrus
 * - Render public sections immediately
 * - Show locked premium sections for non-holders
 * - Implement "Unlock Premium" button for NFT holders
 * - Handle decryption and render premium content
 * - Display loading states and errors
 */
export default function IssueReadingPage() {
  const params = useParams();
  const newsletterId = params.id as string;
  const issueId = params.issueId as string;
  const { address, isConnected } = useWallet();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [publicSections, setPublicSections] = useState<ContentSection[]>([]);
  const [premiumSections, setPremiumSections] = useState<ContentSection[]>([]);
  const [decryptedSections, setDecryptedSections] = useState<ContentSection[]>([]);
  const [hasAccessNFT, setHasAccessNFT] = useState(false);
  const [userNFT, setUserNFT] = useState<NewsletterAccessNFT | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // Fetch issue and newsletter metadata
  useEffect(() => {
    const fetchIssueData = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual Sui query when contracts are deployed
        // const suiClient = new SuiClient({ url: config.sui.rpcUrl });
        // const newsletterService = new NewsletterService(...);
        // const issue = await newsletterService.getIssue(issueId);
        // const newsletter = await newsletterService.getNewsletter(newsletterId);

        // Mock issue data
        const mockIssue: Issue = {
          id: issueId,
          newsletterId,
          title: 'Sui Foundation Appoints Renée Berman as Strategic Advisor',
          walrusBlobId: '0xblob1',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 1000 }],
            encryptedRanges: [{ start: 1000, end: 3000 }],
          },
          publishedAt: Date.now() - 1 * 60 * 60 * 1000,
          hasPremium: false,
        };

        const mockNewsletter: Newsletter = {
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
        };

        setIssue(mockIssue);
        setNewsletter(mockNewsletter);
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch issue');
      } finally {
        setLoading(false);
      }
    };

    if (issueId && newsletterId) {
      fetchIssueData();
    }
  }, [issueId, newsletterId]);

  // Fetch issue content from Walrus (Requirement 3.1)
  useEffect(() => {
    const fetchContent = async () => {
      if (!issue) return;

      setContentLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual Walrus retrieval
        // const walrusClient = new WalrusClient(...);
        // const contentBytes = await walrusClient.retrieve(issue.walrusBlobId);
        // const storedContent = deserializeContent(contentBytes);

        // Mock content retrieval
        const mockPublicSections: ContentSection[] = [
          {
            type: 'public',
            content: `# ${issue.title}\n\n*Published ${new Date(issue.publishedAt).toLocaleDateString()}*\n\n## Major Leadership Announcement\n\nSui Foundation today announced the appointment of institutional finance leader Renée Berman as a key Strategic Advisor. Berman brings decades of leadership across capital markets, fintech innovation, and institutional blockchain adoption to Sui's Advisory Board at a time when the industry is shifting toward tokenized financial infrastructure, with Sui at the forefront of these efforts.\n\n## Background and Experience\n\nMost recently, Berman drove strategic initiatives in digital asset securities as a Managing Director at the Depository Trust & Clearing Corporation (DTCC), where she led the development of a risk and control framework for digital asset securities, which has become a key reference point across the industry.\n\n### Key Achievements:\n\n- **DTCC Leadership**: Developed industry-standard risk frameworks for digital asset securities\n- **Strategic Partnerships**: Extended work through collaborations with the Global Blockchain Business Council (GBBC) and Oliver Wyman\n- **Public Blockchain Innovation**: Created comprehensive risk framework for issuing securities on public blockchains\n- **Institutional Adoption**: Decades of experience driving blockchain adoption in traditional finance\n\n## Impact on Sui Ecosystem\n\nBerman's appointment comes at a crucial time as Sui continues to lead in:\n\n- High-performance blockchain infrastructure\n- Institutional-grade security and compliance\n- Tokenized asset innovation\n- Developer-friendly smart contract platform\n\n## What This Means for Builders\n\nWith Berman's expertise in institutional finance and regulatory frameworks, Sui is well-positioned to:\n\n- Bridge traditional finance and DeFi\n- Attract institutional capital and partnerships\n- Set industry standards for compliant tokenization\n- Expand enterprise adoption of Sui technology\n\n---\n\n*Stay tuned for more updates on Sui's ecosystem growth and institutional partnerships.*`,
            format: 'markdown',
          },
        ];

        const mockPremiumSections: ContentSection[] = issue.hasPremium ? [
          {
            type: 'premium',
            content: '[ENCRYPTED CONTENT - This section contains exclusive analysis, price predictions, and investment strategies available only to premium subscribers]',
            format: 'markdown',
          },
        ] : [];

        // Render public sections immediately (Requirement 3.3)
        setPublicSections(mockPublicSections);
        setPremiumSections(mockPremiumSections);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch content from Walrus');
      } finally {
        setContentLoading(false);
      }
    };

    fetchContent();
  }, [issue]);

  // Check NFT ownership when wallet is connected (Requirement 4.1)
  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (!isConnected || !address || !newsletter) return;

      try {
        // TODO: Replace with actual NFT ownership check
        // const suiClient = new SuiClient({ url: config.sui.rpcUrl });
        // Query user's NFTs and check if they own an access NFT for this newsletter
        
        // Mock NFT ownership check
        const mockHasNFT = Math.random() > 0.5;
        setHasAccessNFT(mockHasNFT);

        if (mockHasNFT) {
          const mockNFT: NewsletterAccessNFT = {
            id: '0xnft' + Math.random().toString(16).substring(2, 10),
            newsletterId: newsletter.id,
            accessLevel: 1,
            issuedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
          };
          setUserNFT(mockNFT);
        }
      } catch (err) {
        console.error('Error checking NFT ownership:', err);
      }
    };

    checkNFTOwnership();
  }, [isConnected, address, newsletter]);

  // Decrypt premium content (Requirements 4.1, 4.4, 4.6)
  const unlockPremiumContent = useCallback(async () => {
    if (!issue || !newsletter || !userNFT || !address) {
      setDecryptError('Missing required data for decryption');
      return;
    }

    setDecrypting(true);
    setDecryptError(null);

    try {
      // TODO: Replace with actual decryption workflow
      // const suiClient = new SuiClient({ url: config.sui.rpcUrl });
      // const walrusClient = new WalrusClient(...);
      // const sealClient = new SealClient(...);
      // const newsletterService = new NewsletterService(suiClient, walrusClient, sealClient, packageId);
      // const decrypted = await newsletterService.decryptPremiumContent(issue, newsletter, userNFT, address);

      // Simulate decryption delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock decrypted content
      const mockDecryptedSections: ContentSection[] = [
        {
          type: 'premium',
          content: `## 🔓 Premium Analysis\n\n### Deep Dive: Institutional Adoption\n\nOur analysis of institutional trading patterns reveals several key insights:\n\n1. **Hedge Fund Activity**: Major hedge funds have increased their Bitcoin exposure by an average of 23% following the ETF approval.\n\n2. **Pension Fund Interest**: Several state pension funds are now exploring Bitcoin ETF allocations, representing potentially billions in new capital.\n\n3. **Corporate Treasury Diversification**: Public companies are beginning to view Bitcoin ETFs as a viable treasury diversification strategy.\n\n### Price Predictions\n\nBased on our proprietary models and historical ETF approval patterns in other asset classes:\n\n- **Short-term (3 months)**: $52,000 - $58,000\n- **Medium-term (6 months)**: $60,000 - $75,000\n- **Long-term (12 months)**: $80,000 - $120,000\n\n*Note: These are projections based on current market conditions and historical patterns. Cryptocurrency investments carry significant risk.*\n\n### Investment Strategies\n\n#### For Conservative Investors\n\n- Allocate 2-5% of portfolio to Bitcoin ETF\n- Dollar-cost average over 6-12 months\n- Rebalance quarterly\n\n#### For Aggressive Investors\n\n- Consider 10-15% allocation\n- Use options strategies for downside protection\n- Monitor on-chain metrics for entry/exit signals\n\n### Regulatory Outlook\n\nOur Washington sources indicate that Ethereum ETF approval may follow within 6-9 months. This could trigger another wave of institutional adoption.\n\n### Exclusive Data\n\n**Institutional Flow Analysis** (Last 7 Days):\n- Net inflows: $1.2B\n- Average trade size: $4.3M\n- Number of new institutional accounts: 147\n\n### Conclusion\n\nThe Bitcoin ETF approval represents a paradigm shift in cryptocurrency adoption. While short-term volatility is expected, the long-term trajectory appears strongly positive. Investors should consider their risk tolerance and investment horizon when making allocation decisions.\n\n---\n\n*This premium analysis is updated weekly. Next update: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}*`,
          format: 'markdown',
        },
      ];

      setDecryptedSections(mockDecryptedSections);
    } catch (err) {
      console.error('Error decrypting content:', err);
      // Handle decryption failures gracefully (Requirement 4.6)
      setDecryptError(
        err instanceof Error 
          ? err.message 
          : 'Failed to decrypt premium content. Please try again or contact support.'
      );
    } finally {
      setDecrypting(false);
    }
  }, [issue, newsletter, userNFT, address]);

  // Render markdown content
  const renderContent = (content: string) => {
    // Simple markdown rendering (in production, use a proper markdown library)
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-3xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(4)}</h3>;
      } else if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-xl font-bold mt-3 mb-2">{line.substring(5)}</h4>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-1">{line.substring(2)}</li>;
      } else if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={index} className="italic text-gray-600 mb-2">{line.substring(1, line.length - 1)}</p>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-bold mb-2">{line.substring(2, line.length - 2)}</p>;
      } else if (line === '---') {
        return <hr key={index} className="my-6 border-gray-300" />;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2 leading-relaxed">{line}</p>;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Issue</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back navigation */}
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
        >
          ← Back to Newsletter
        </button>

        {/* Newsletter header */}
        {newsletter && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">{newsletter.title}</p>
          </div>
        )}

        {/* Issue content container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Content loading state */}
          {contentLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading content from Walrus...</p>
            </div>
          ) : (
            <div className="p-8">
              {/* Public sections - rendered immediately (Requirement 3.3) */}
              {publicSections.map((section, index) => (
                <div key={`public-${index}`} className="prose prose-lg max-w-none mb-8">
                  {renderContent(section.content)}
                </div>
              ))}

              {/* Premium sections */}
              {issue?.hasPremium && premiumSections.length > 0 && (
                <div className="mt-8">
                  {decryptedSections.length > 0 ? (
                    // Render decrypted premium content (Requirement 4.4)
                    <div className="border-t-4 border-yellow-400 pt-8">
                      {decryptedSections.map((section, index) => (
                        <div key={`decrypted-${index}`} className="prose prose-lg max-w-none">
                          {renderContent(section.content)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Show locked premium sections for non-holders (Requirement 3.3, 4.6)
                    <div className="border-t-4 border-gray-300 pt-8">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Premium Content Locked
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          This issue contains exclusive premium content available only to NFT holders.
                          Unlock in-depth analysis, price predictions, and investment strategies.
                        </p>

                        {!isConnected ? (
                          // Show connect wallet prompt
                          <div className="space-y-3">
                            <p className="text-sm text-gray-500">
                              Connect your wallet to check if you have access
                            </p>
                            <button
                              onClick={() => {
                                // Trigger wallet connection
                                // In production, this would open the wallet selector
                                alert('Wallet connection would be triggered here');
                              }}
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Connect Wallet
                            </button>
                          </div>
                        ) : hasAccessNFT ? (
                          // Show unlock button for NFT holders (Requirement 4.1)
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                              <span className="text-2xl">✓</span>
                              <span className="font-medium">You have access to this content</span>
                            </div>
                            <button
                              onClick={unlockPremiumContent}
                              disabled={decrypting}
                              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                              {decrypting ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  Decrypting...
                                </>
                              ) : (
                                <>
                                  🔓 Unlock Premium Content
                                </>
                              )}
                            </button>
                            {decryptError && (
                              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800 text-sm">{decryptError}</p>
                                <button
                                  onClick={unlockPremiumContent}
                                  className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                  Try Again
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Show purchase/acquire NFT prompt (Requirement 4.6)
                          <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-4">
                              You don't have an access NFT for this newsletter
                            </p>
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={() => {
                                  // Navigate to NFT purchase/acquisition page
                                  alert('Navigate to NFT acquisition page');
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                Get Access NFT
                              </button>
                              <button
                                onClick={() => window.history.back()}
                                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                              >
                                Back to Newsletter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Issue metadata footer */}
        {issue && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Published {new Date(issue.publishedAt).toLocaleString()}</p>
            {issue.hasPremium && (
              <p className="mt-1">
                <span className="inline-flex items-center gap-1">
                  <span className="text-yellow-600">⭐</span>
                  Contains premium content
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
