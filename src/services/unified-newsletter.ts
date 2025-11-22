/**
 * Unified Newsletter Service
 * Routes operations to appropriate backend (traditional or blockchain)
 * Implements Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 14.1, 14.2, 14.3, 14.4
 */

import { SuiClient } from '@mysten/sui/client';
import { Newsletter, Issue, NewsletterAccessNFT, Subscription, NewsletterType, isTraditionalNewsletter, isBlockchainNewsletter } from '@/types';
import { BlockchainNewsletterService, CreateBlockchainNewsletterParams, PublishBlockchainIssueParams, IssueContent } from './blockchain-newsletter';
import { TraditionalNewsletterService, CreateTraditionalNewsletterParams, PublishTraditionalIssueParams } from './traditional-newsletter';
import { WalrusClient } from './walrus';
import { SealClient } from './seal';
import { ContentSection } from './content';
import { getDatabase, Migration } from './database';
import { ErrorCode } from './errors';

export interface CreateNewsletterParams {
  title: string;
  description: string;
  accessModel: {
    isFree: boolean;
    isNftGated: boolean;
    isHybrid: boolean;
  };
  nftCollection?: string;
  sealPackageId?: string;
  creator: string;  // Email/username for traditional, address for blockchain
  requireBlockchain?: boolean;  // Force blockchain even for free newsletters
}

export interface PublishIssueParams {
  newsletterId: string;
  title: string;
  content?: string;  // For traditional newsletters
  sections?: ContentSection[];  // For blockchain newsletters
}

export class UnifiedNewsletterService {
  private blockchainService: BlockchainNewsletterService;
  private traditionalService: TraditionalNewsletterService;
  private db = getDatabase();

  constructor(
    suiClient: SuiClient,
    walrusClient: WalrusClient,
    sealClient: SealClient,
    packageId: string
  ) {
    this.blockchainService = new BlockchainNewsletterService(
      suiClient,
      walrusClient,
      sealClient,
      packageId
    );
    this.traditionalService = new TraditionalNewsletterService();
  }

  /**
   * Create a newsletter (routes to appropriate backend)
   * Implements Requirements 11.1, 11.2
   */
  async createNewsletter(params: CreateNewsletterParams): Promise<Newsletter> {
    const { accessModel, requireBlockchain = false } = params;

    // Route based on access model and requirements
    // Traditional: free newsletters without blockchain requirement
    // Blockchain: NFT-gated, hybrid, or explicitly requested
    const useBlockchain = requireBlockchain || accessModel.isNftGated || accessModel.isHybrid;

    if (useBlockchain) {
      // Validate blockchain-specific requirements
      if (!params.sealPackageId) {
        throw new Error('Seal package ID is required for blockchain newsletters');
      }

      const blockchainParams: CreateBlockchainNewsletterParams = {
        title: params.title,
        description: params.description,
        accessModel: params.accessModel,
        nftCollection: params.nftCollection,
        sealPackageId: params.sealPackageId,
      };

      return this.blockchainService.createNewsletter(blockchainParams, params.creator);
    } else {
      // Create traditional newsletter
      const traditionalParams: CreateTraditionalNewsletterParams = {
        creator: params.creator,
        title: params.title,
        description: params.description,
        accessModel: params.accessModel,
      };

      return this.traditionalService.createNewsletter(traditionalParams);
    }
  }

  /**
   * Publish an issue (routes to appropriate backend)
   * Implements Requirements 11.3, 14.2
   */
  async publishIssue(params: PublishIssueParams): Promise<Issue> {
    const { newsletterId } = params;

    // Get newsletter to determine type
    const newsletter = await this.getNewsletter(newsletterId);

    if (isTraditionalNewsletter(newsletter)) {
      // Publish to traditional backend
      if (!params.content) {
        throw new Error('Content is required for traditional newsletter issues');
      }

      const traditionalParams: PublishTraditionalIssueParams = {
        newsletterId,
        title: params.title,
        content: params.content,
        hasPremium: false,  // Traditional newsletters don't support premium content
      };

      return this.traditionalService.publishIssue(traditionalParams);
    } else if (isBlockchainNewsletter(newsletter)) {
      // Publish to blockchain backend
      if (!params.sections) {
        throw new Error('Sections are required for blockchain newsletter issues');
      }

      const blockchainParams: PublishBlockchainIssueParams = {
        newsletterId: newsletter.blockchainId,
        title: params.title,
        sections: params.sections,
      };

      return this.blockchainService.publishIssue(blockchainParams, newsletter);
    } else {
      throw new Error('Invalid newsletter type');
    }
  }

  /**
   * Get a newsletter by ID (unified interface)
   * Implements Requirements 14.1, 14.3
   */
  async getNewsletter(id: string): Promise<Newsletter> {
    // Try traditional first (faster)
    const traditionalNewsletter = await this.traditionalService.getNewsletter(id);
    if (traditionalNewsletter) {
      return traditionalNewsletter;
    }

    // Try blockchain
    try {
      const blockchainNewsletter = await this.blockchainService.getNewsletter(id);
      return blockchainNewsletter;
    } catch (error) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }
  }

  /**
   * Get an issue by ID (unified interface)
   * Implements Requirements 14.1, 14.3
   */
  async getIssue(id: string): Promise<Issue> {
    // Try traditional first
    const traditionalIssue = await this.traditionalService.getIssue(id);
    if (traditionalIssue) {
      return traditionalIssue;
    }

    // Try blockchain
    try {
      const blockchainIssue = await this.blockchainService.getIssue(id);
      return blockchainIssue;
    } catch (error) {
      throw new Error(ErrorCode.ISSUE_NOT_FOUND);
    }
  }

  /**
   * Get issue content (unified interface)
   * Implements Requirements 14.2, 14.3
   */
  async getIssueContent(issue: Issue): Promise<IssueContent | { content: string }> {
    // Check if it's a traditional issue (has content field)
    if (issue.content) {
      return { content: issue.content };
    }

    // Otherwise it's a blockchain issue
    return this.blockchainService.getIssueContent(issue);
  }

  /**
   * List issues for a newsletter (unified interface)
   * Implements Requirements 14.1
   */
  async listIssues(newsletterId: string): Promise<Issue[]> {
    const newsletter = await this.getNewsletter(newsletterId);

    if (isTraditionalNewsletter(newsletter)) {
      return this.traditionalService.listIssues(newsletterId);
    } else {
      // For blockchain newsletters, we would need to query events or use an indexer
      // For now, return empty array
      return [];
    }
  }

  /**
   * Update newsletter (only for traditional)
   * Implements Requirements 13.1, 13.4
   */
  async updateNewsletter(id: string, updates: { title?: string; description?: string }): Promise<Newsletter> {
    const newsletter = await this.getNewsletter(id);

    if (isTraditionalNewsletter(newsletter)) {
      return this.traditionalService.updateNewsletter(id, updates);
    } else {
      throw new Error('Cannot update blockchain newsletter - content is immutable');
    }
  }

  /**
   * Update issue (only for traditional)
   * Implements Requirements 13.2, 13.4
   */
  async updateIssue(id: string, updates: { title?: string; content?: string }): Promise<Issue> {
    const issue = await this.getIssue(id);
    const newsletter = await this.getNewsletter(issue.newsletterId);

    if (isTraditionalNewsletter(newsletter)) {
      return this.traditionalService.updateIssue(id, updates);
    } else {
      throw new Error('Cannot update blockchain issue - content is immutable');
    }
  }

  /**
   * Delete newsletter (only for traditional)
   * Implements Requirements 13.3, 13.5
   */
  async deleteNewsletter(id: string): Promise<void> {
    const newsletter = await this.getNewsletter(id);

    if (isTraditionalNewsletter(newsletter)) {
      return this.traditionalService.deleteNewsletter(id);
    } else {
      throw new Error('Cannot delete blockchain newsletter - content is immutable');
    }
  }

  /**
   * Delete issue (only for traditional)
   * Implements Requirements 13.3, 13.5
   */
  async deleteIssue(id: string): Promise<void> {
    const issue = await this.getIssue(id);
    const newsletter = await this.getNewsletter(issue.newsletterId);

    if (isTraditionalNewsletter(newsletter)) {
      return this.traditionalService.deleteIssue(id);
    } else {
      throw new Error('Cannot delete blockchain issue - content is immutable');
    }
  }

  /**
   * Upgrade a traditional newsletter to blockchain
   * Implements Requirements 12.1, 12.2, 12.3, 12.4, 12.5
   */
  async upgradeToBlockchain(
    newsletterId: string,
    params: {
      senderAddress: string;
      sealPackageId: string;
      nftCollection?: string;
      migrateIssues?: boolean;
    }
  ): Promise<Newsletter> {
    const { senderAddress, sealPackageId, nftCollection, migrateIssues = false } = params;

    // Get the traditional newsletter
    const traditionalNewsletter = await this.traditionalService.getNewsletter(newsletterId);
    if (!traditionalNewsletter) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }

    if (traditionalNewsletter.type !== NewsletterType.TRADITIONAL) {
      throw new Error('Newsletter is already on blockchain');
    }

    // Create migration record
    const migrationId = this.generateId();
    const migration: Migration = {
      id: migrationId,
      newsletterId,
      fromType: NewsletterType.TRADITIONAL,
      toType: NewsletterType.BLOCKCHAIN,
      migratedAt: Date.now(),
      status: 'pending',
    };

    await this.db.createMigration(migration);

    try {
      // Step 1: Create blockchain newsletter
      const blockchainParams: CreateBlockchainNewsletterParams = {
        title: traditionalNewsletter.title,
        description: traditionalNewsletter.description,
        accessModel: traditionalNewsletter.accessModel,
        nftCollection,
        sealPackageId,
      };

      const blockchainNewsletter = await this.blockchainService.createNewsletter(
        blockchainParams,
        senderAddress
      );

      // Step 2: Optionally migrate issues
      if (migrateIssues) {
        const issues = await this.traditionalService.listIssues(newsletterId);
        
        for (const issue of issues) {
          if (issue.content) {
            // Convert content to sections
            const sections: ContentSection[] = [{
              type: 'public',
              content: issue.content,
              format: 'markdown',
            }];

            await this.blockchainService.publishIssue(
              {
                newsletterId: blockchainNewsletter.blockchainId,
                title: issue.title,
                sections,
              },
              blockchainNewsletter
            );
          }
        }
      }

      // Step 3: Mark traditional newsletter as migrated
      await this.traditionalService.markAsMigrated(newsletterId, blockchainNewsletter.blockchainId);

      // Step 4: Update migration status
      await this.db.updateMigration(migrationId, {
        status: 'completed',
        blockchainTxDigest: blockchainNewsletter.blockchainId,
      });

      return blockchainNewsletter;
    } catch (error) {
      // Mark migration as failed
      await this.db.updateMigration(migrationId, {
        status: 'failed',
      });

      throw new Error(`Failed to upgrade newsletter to blockchain: ${error}`);
    }
  }

  /**
   * Check if a newsletter can be edited
   * Implements Requirements 13.4, 13.5, 14.5
   */
  async canEdit(newsletterId: string): Promise<boolean> {
    const newsletter = await this.getNewsletter(newsletterId);
    return isTraditionalNewsletter(newsletter);
  }

  /**
   * Check if an issue can be edited
   * Implements Requirements 13.4, 13.5
   */
  async canEditIssue(issueId: string): Promise<boolean> {
    const issue = await this.getIssue(issueId);
    const newsletter = await this.getNewsletter(issue.newsletterId);
    return isTraditionalNewsletter(newsletter);
  }

  /**
   * Blockchain-only operations
   * These methods delegate directly to the blockchain service
   */

  async mintAccessNFT(newsletterId: string, recipient: string): Promise<NewsletterAccessNFT> {
    const newsletter = await this.getNewsletter(newsletterId);
    
    if (!isBlockchainNewsletter(newsletter)) {
      throw new Error('NFTs can only be minted for blockchain newsletters');
    }

    return this.blockchainService.mintAccessNFT(newsletter.blockchainId, recipient);
  }

  async subscribe(newsletterId: string, subscriberAddress: string): Promise<Subscription> {
    const newsletter = await this.getNewsletter(newsletterId);
    
    if (!isBlockchainNewsletter(newsletter)) {
      throw new Error('Subscriptions are only available for blockchain newsletters');
    }

    return this.blockchainService.subscribe(newsletter.blockchainId, subscriberAddress);
  }

  async unsubscribe(subscriptionId: string, subscriberAddress: string): Promise<void> {
    return this.blockchainService.unsubscribe(subscriptionId, subscriberAddress);
  }

  async getSubscriptions(subscriber: string): Promise<Subscription[]> {
    return this.blockchainService.getSubscriptions(subscriber);
  }

  async decryptPremiumContent(
    issue: Issue,
    nft: NewsletterAccessNFT,
    userAddress: string
  ): Promise<ContentSection[]> {
    const newsletter = await this.getNewsletter(issue.newsletterId);
    
    if (!isBlockchainNewsletter(newsletter)) {
      throw new Error('Premium content decryption is only available for blockchain newsletters');
    }

    return this.blockchainService.decryptPremiumContent(issue, newsletter, nft, userAddress);
  }

  async getOwnedNFTs(ownerAddress: string, newsletterId: string): Promise<NewsletterAccessNFT[]> {
    const newsletter = await this.getNewsletter(newsletterId);
    
    if (!isBlockchainNewsletter(newsletter)) {
      return [];
    }

    return this.blockchainService.getOwnedNFTs(ownerAddress, newsletter.blockchainId);
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
