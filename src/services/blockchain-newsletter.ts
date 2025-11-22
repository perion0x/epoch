/**
 * Blockchain Newsletter Service
 * Handles Sui blockchain-backed newsletters with Walrus storage and Seal encryption
 * This is the renamed version of the original NewsletterService
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Newsletter, Issue, NewsletterAccessNFT, Subscription, NewsletterType, BlockchainNewsletter } from '@/types';
import { WalrusClient } from './walrus';
import { SealClient, SessionKey } from './seal';
import { serializeContent, deserializeContent, calculateBoundaries, ContentSection } from './content';
import { ErrorCode } from './errors';

export interface CreateBlockchainNewsletterParams {
  title: string;
  description: string;
  accessModel: {
    isFree: boolean;
    isNftGated: boolean;
    isHybrid: boolean;
  };
  nftCollection?: string;
  sealPackageId: string;
}

export interface PublishBlockchainIssueParams {
  newsletterId: string;
  title: string;
  sections: ContentSection[];
}

export interface IssueContent {
  publicSections: ContentSection[];
  premiumSections: ContentSection[];
  hasPremium: boolean;
}

export class BlockchainNewsletterError extends Error {
  constructor(message: string, public readonly code: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'BlockchainNewsletterError';
  }
}

export class BlockchainNewsletterService {
  private suiClient: SuiClient;
  private walrusClient: WalrusClient;
  private sealClient: SealClient;
  private packageId: string;

  constructor(
    suiClient: SuiClient,
    walrusClient: WalrusClient,
    sealClient: SealClient,
    packageId: string
  ) {
    this.suiClient = suiClient;
    this.walrusClient = walrusClient;
    this.sealClient = sealClient;
    this.packageId = packageId;
  }

  /**
   * Create a new blockchain newsletter
   * Implements Requirements 1.1, 1.2, 1.3, 1.4, 1.5
   */
  async createNewsletter(params: CreateBlockchainNewsletterParams, senderAddress: string): Promise<BlockchainNewsletter> {
    const { title, description, accessModel, nftCollection, sealPackageId } = params;

    // Validate parameters
    if (!title || title.trim().length === 0) {
      throw new BlockchainNewsletterError('Title is required', ErrorCode.INVALID_TITLE);
    }

    if (!description || description.trim().length === 0) {
      throw new BlockchainNewsletterError('Description is required', 'INVALID_DESCRIPTION');
    }

    if (!sealPackageId || sealPackageId.length === 0) {
      throw new BlockchainNewsletterError('Seal package ID is required', 'INVALID_SEAL_PACKAGE');
    }

    // Validate access model
    if (accessModel.isNftGated || accessModel.isHybrid) {
      if (!nftCollection || nftCollection.length === 0) {
        throw new BlockchainNewsletterError(
          'NFT collection address is required for NFT-gated or hybrid access models',
          'MISSING_NFT_COLLECTION'
        );
      }
    }

    try {
      // Create transaction to call create_newsletter on Sui
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::newsletter::create_newsletter`,
        arguments: [
          tx.pure.string(title),
          tx.pure.string(description),
          tx.pure.bool(accessModel.isFree),
          tx.pure.bool(accessModel.isNftGated),
          tx.pure.bool(accessModel.isHybrid),
          tx.pure.vector('address', nftCollection ? [nftCollection] : []),
          tx.pure.address(sealPackageId),
        ],
      });

      // Execute transaction (in real implementation, this would be signed by wallet)
      const blockchainId = this.generateId();
      const now = Date.now();
      
      const newsletter: BlockchainNewsletter = {
        id: blockchainId,
        type: NewsletterType.BLOCKCHAIN,
        blockchainId,
        creator: senderAddress,
        title,
        description,
        accessModel,
        nftCollection,
        sealPackageId,
        createdAt: now,
        updatedAt: now,
        issueCount: 0,
      };

      return newsletter;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to create newsletter',
        ErrorCode.CREATION_FAILED,
        error
      );
    }
  }

  /**
   * Publish a new issue with content stored on Walrus
   * Orchestrates Walrus storage, Seal encryption, and Sui transaction
   * Implements Requirements 2.1, 2.2, 2.4, 2.5, 2.6
   */
  async publishIssue(params: PublishBlockchainIssueParams, newsletter: BlockchainNewsletter): Promise<Issue> {
    const { newsletterId, title, sections } = params;

    // Validate parameters
    if (!title || title.trim().length === 0) {
      throw new BlockchainNewsletterError('Issue title is required', ErrorCode.INVALID_TITLE);
    }

    if (!sections || sections.length === 0) {
      throw new BlockchainNewsletterError('Issue content cannot be empty', ErrorCode.INVALID_CONTENT);
    }

    try {
      // Separate public and premium sections
      const publicSections = sections.filter(s => s.type === 'public');
      const premiumSections = sections.filter(s => s.type === 'premium');
      const hasPremium = premiumSections.length > 0;

      // Encrypt premium sections if they exist
      const processedSections = [...publicSections];
      
      if (hasPremium) {
        // Create identity for Seal encryption: [newsletter_id][issue_id]
        const issueId = this.generateId();
        const identity = `${newsletterId}:${issueId}`;

        // Encrypt each premium section
        for (const premiumSection of premiumSections) {
          const contentBytes = new TextEncoder().encode(premiumSection.content);
          
          const { encryptedObject } = await this.sealClient.encrypt({
            threshold: 2, // 2-of-3 threshold
            packageId: newsletter.sealPackageId!,
            id: identity,
            data: contentBytes,
          });

          // Add encrypted section
          processedSections.push({
            type: 'premium',
            content: new TextDecoder().decode(encryptedObject),
            format: premiumSection.format,
          });
        }
      }

      // Serialize content for Walrus storage
      const serializedContent = serializeContent(processedSections);

      // Store content on Walrus
      const blobId = await this.walrusClient.store(serializedContent);

      // Deserialize to calculate boundaries
      const storedContent = deserializeContent(serializedContent);
      const boundaries = calculateBoundaries(storedContent);

      const now = Date.now();
      
      // Create Issue object on Sui
      const issue: Issue = {
        id: this.generateId(),
        newsletterId,
        title,
        walrusBlobId: blobId,
        contentBoundaries: boundaries,
        publishedAt: now,
        updatedAt: now,
        hasPremium,
      };

      return issue;
    } catch (error) {
      if (error instanceof BlockchainNewsletterError) {
        throw error;
      }
      throw new BlockchainNewsletterError(
        'Failed to publish issue',
        ErrorCode.PUBLISH_FAILED,
        error
      );
    }
  }

  /**
   * Mint an access NFT for a newsletter
   * Implements Requirements 5.1, 5.2, 5.3
   */
  async mintAccessNFT(newsletterId: string, recipient: string): Promise<NewsletterAccessNFT> {
    // Validate parameters
    if (!newsletterId || newsletterId.length === 0) {
      throw new BlockchainNewsletterError('Newsletter ID is required', 'INVALID_NEWSLETTER_ID');
    }

    if (!recipient || recipient.length === 0) {
      throw new BlockchainNewsletterError('Recipient address is required', 'INVALID_RECIPIENT');
    }

    try {
      // Create transaction to mint NFT
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::nft::mint_access_nft`,
        arguments: [
          tx.pure.address(newsletterId),
          tx.pure.address(recipient),
          tx.pure.u8(1), // access level
        ],
      });

      // Execute transaction (in real implementation, this would be signed by wallet)
      const nft: NewsletterAccessNFT = {
        id: this.generateId(),
        newsletterId,
        accessLevel: 1,
        issuedAt: Date.now(),
      };

      return nft;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to mint access NFT',
        ErrorCode.MINT_FAILED,
        error
      );
    }
  }

  /**
   * Get newsletter by ID
   * Implements Requirements 6.1
   */
  async getNewsletter(id: string): Promise<BlockchainNewsletter> {
    if (!id || id.length === 0) {
      throw new BlockchainNewsletterError('Newsletter ID is required', 'INVALID_NEWSLETTER_ID');
    }

    try {
      // Query Sui for newsletter object
      const response = await this.suiClient.getObject({
        id,
        options: {
          showContent: true,
        },
      });

      if (!response.data) {
        throw new BlockchainNewsletterError('Newsletter not found', ErrorCode.NOT_FOUND);
      }

      // Parse newsletter data from response
      const content = response.data.content as any;
      const fields = content.fields;

      const newsletter: BlockchainNewsletter = {
        id: fields.id.id,
        type: NewsletterType.BLOCKCHAIN,
        blockchainId: fields.id.id,
        creator: fields.creator,
        title: fields.title,
        description: fields.description,
        accessModel: {
          isFree: fields.access_model.fields.is_free,
          isNftGated: fields.access_model.fields.is_nft_gated,
          isHybrid: fields.access_model.fields.is_hybrid,
        },
        nftCollection: fields.nft_collection,
        sealPackageId: fields.seal_package_id,
        createdAt: parseInt(fields.created_at),
        updatedAt: parseInt(fields.created_at), // Blockchain newsletters don't have updatedAt on-chain
        issueCount: parseInt(fields.issue_count),
      };

      return newsletter;
    } catch (error) {
      if (error instanceof BlockchainNewsletterError) {
        throw error;
      }
      throw new BlockchainNewsletterError(
        'Failed to get newsletter',
        'FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Get issue by ID
   * Implements Requirements 6.2
   */
  async getIssue(id: string): Promise<Issue> {
    if (!id || id.length === 0) {
      throw new BlockchainNewsletterError('Issue ID is required', 'INVALID_ISSUE_ID');
    }

    try {
      // Query Sui for issue object
      const response = await this.suiClient.getObject({
        id,
        options: {
          showContent: true,
        },
      });

      if (!response.data) {
        throw new BlockchainNewsletterError('Issue not found', ErrorCode.NOT_FOUND);
      }

      // Parse issue data from response
      const content = response.data.content as any;
      const fields = content.fields;

      const issue: Issue = {
        id: fields.id.id,
        newsletterId: fields.newsletter_id,
        title: fields.title,
        walrusBlobId: fields.walrus_blob_id,
        contentBoundaries: {
          publicRanges: fields.content_boundaries.fields.public_ranges,
          encryptedRanges: fields.content_boundaries.fields.encrypted_ranges,
        },
        publishedAt: parseInt(fields.published_at),
        updatedAt: parseInt(fields.published_at), // Blockchain issues don't have updatedAt on-chain
        hasPremium: fields.has_premium,
      };

      return issue;
    } catch (error) {
      if (error instanceof BlockchainNewsletterError) {
        throw error;
      }
      throw new BlockchainNewsletterError(
        'Failed to get issue',
        'FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Get issue content from Walrus
   * Implements Requirements 3.1, 3.2
   */
  async getIssueContent(issue: Issue): Promise<IssueContent> {
    if (!issue.walrusBlobId) {
      throw new BlockchainNewsletterError('Issue does not have Walrus blob ID', 'INVALID_ISSUE');
    }

    try {
      // Retrieve content from Walrus
      const contentBytes = await this.walrusClient.retrieve(issue.walrusBlobId);

      // Deserialize content
      const storedContent = deserializeContent(contentBytes);

      // Extract public and premium sections
      const publicSections: ContentSection[] = [];
      const premiumSections: ContentSection[] = [];

      for (const section of storedContent.sections) {
        const contentSection: ContentSection = {
          type: section.type,
          content: new TextDecoder().decode(section.content),
          format: section.metadata.format,
        };

        if (section.type === 'public') {
          publicSections.push(contentSection);
        } else {
          premiumSections.push(contentSection);
        }
      }

      return {
        publicSections,
        premiumSections,
        hasPremium: issue.hasPremium,
      };
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to get issue content',
        'CONTENT_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Subscribe to a newsletter
   * Implements Requirements 10.1
   */
  async subscribe(newsletterId: string, subscriberAddress: string): Promise<Subscription> {
    // Validate parameters
    if (!newsletterId || newsletterId.length === 0) {
      throw new BlockchainNewsletterError('Newsletter ID is required', 'INVALID_NEWSLETTER_ID');
    }

    if (!subscriberAddress || subscriberAddress.length === 0) {
      throw new BlockchainNewsletterError('Subscriber address is required', 'INVALID_SUBSCRIBER');
    }

    try {
      // Verify newsletter exists
      await this.getNewsletter(newsletterId);

      // Create transaction to subscribe
      const tx = new Transaction();
      tx.setSender(subscriberAddress);

      tx.moveCall({
        target: `${this.packageId}::subscription::subscribe`,
        arguments: [
          tx.pure.address(newsletterId),
        ],
      });

      // Execute transaction (in real implementation, this would be signed by wallet)
      const subscription: Subscription = {
        id: this.generateId(),
        subscriber: subscriberAddress,
        newsletterId,
        subscribedAt: Date.now(),
      };

      return subscription;
    } catch (error) {
      if (error instanceof BlockchainNewsletterError) {
        throw error;
      }
      throw new BlockchainNewsletterError(
        'Failed to subscribe to newsletter',
        ErrorCode.SUBSCRIBE_FAILED,
        error
      );
    }
  }

  /**
   * Unsubscribe from a newsletter
   * Implements Requirements 10.3
   */
  async unsubscribe(subscriptionId: string, subscriberAddress: string): Promise<void> {
    // Validate parameters
    if (!subscriptionId || subscriptionId.length === 0) {
      throw new BlockchainNewsletterError('Subscription ID is required', 'INVALID_SUBSCRIPTION_ID');
    }

    if (!subscriberAddress || subscriberAddress.length === 0) {
      throw new BlockchainNewsletterError('Subscriber address is required', 'INVALID_SUBSCRIBER');
    }

    try {
      // Verify subscription exists and belongs to subscriber
      const subscription = await this.getSubscription(subscriptionId);
      
      if (subscription.subscriber !== subscriberAddress) {
        throw new BlockchainNewsletterError(
          'Subscription does not belong to subscriber',
          ErrorCode.UNAUTHORIZED
        );
      }

      // Create transaction to unsubscribe
      const tx = new Transaction();
      tx.setSender(subscriberAddress);

      tx.moveCall({
        target: `${this.packageId}::subscription::unsubscribe`,
        arguments: [
          tx.object(subscriptionId),
        ],
      });

      // Execute transaction (in real implementation, this would be signed by wallet)
      // Subscription object is deleted on-chain
    } catch (error) {
      if (error instanceof BlockchainNewsletterError) {
        throw error;
      }
      throw new BlockchainNewsletterError(
        'Failed to unsubscribe from newsletter',
        ErrorCode.UNSUBSCRIBE_FAILED,
        error
      );
    }
  }

  /**
   * Get subscriptions for a subscriber
   * Implements Requirements 10.4
   */
  async getSubscriptions(subscriber: string): Promise<Subscription[]> {
    // Validate parameters
    if (!subscriber || subscriber.length === 0) {
      throw new BlockchainNewsletterError('Subscriber address is required', 'INVALID_SUBSCRIBER');
    }

    try {
      // Query Sui for all subscription objects owned by subscriber
      const response = await this.suiClient.getOwnedObjects({
        owner: subscriber,
        filter: {
          StructType: `${this.packageId}::subscription::Subscription`,
        },
        options: {
          showContent: true,
        },
      });

      const subscriptions: Subscription[] = [];

      for (const item of response.data) {
        if (!item.data || !item.data.content) {
          continue;
        }

        const content = item.data.content as any;
        const fields = content.fields;

        subscriptions.push({
          id: fields.id.id,
          subscriber: fields.subscriber,
          newsletterId: fields.newsletter_id,
          subscribedAt: parseInt(fields.subscribed_at),
        });
      }

      return subscriptions;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to get subscriptions',
        'FETCH_SUBSCRIPTIONS_FAILED',
        error
      );
    }
  }

  /**
   * Get a single subscription by ID
   * Helper method for unsubscribe
   */
  private async getSubscription(id: string): Promise<Subscription> {
    try {
      const response = await this.suiClient.getObject({
        id,
        options: {
          showContent: true,
        },
      });

      if (!response.data) {
        throw new BlockchainNewsletterError('Subscription not found', ErrorCode.NOT_FOUND);
      }

      const content = response.data.content as any;
      const fields = content.fields;

      return {
        id: fields.id.id,
        subscriber: fields.subscriber,
        newsletterId: fields.newsletter_id,
        subscribedAt: parseInt(fields.subscribed_at),
      };
    } catch (error) {
      if (error instanceof BlockchainNewsletterError) {
        throw error;
      }
      throw new BlockchainNewsletterError(
        'Failed to get subscription',
        'FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Decrypt premium content for NFT holders
   * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.6
   */
  async decryptPremiumContent(
    issue: Issue,
    newsletter: BlockchainNewsletter,
    nft: NewsletterAccessNFT,
    userAddress: string
  ): Promise<ContentSection[]> {
    try {
      // Step 1: Verify NFT ownership (Requirement 4.1)
      const hasAccess = await this.verifyNFTOwnership(nft, newsletter.id, userAddress);
      
      if (!hasAccess) {
        throw new BlockchainNewsletterError(
          'NFT ownership verification failed',
          ErrorCode.ACCESS_DENIED
        );
      }

      // Step 2: Create session key for decryption (Requirement 4.3)
      const sessionKey = await this.createSessionKey(userAddress, newsletter.sealPackageId!);

      // Step 3: Retrieve issue content from Walrus
      const issueContent = await this.getIssueContent(issue);

      if (!issueContent.hasPremium || issueContent.premiumSections.length === 0) {
        return [];
      }

      // Step 4: Construct Seal approval transaction (Requirement 4.2)
      const approvalTxBytes = await this.constructSealApprovalTx(
        issue,
        newsletter,
        nft,
        userAddress
      );

      // Step 5: Decrypt premium sections (Requirement 4.4)
      const decryptedSections: ContentSection[] = [];

      for (const premiumSection of issueContent.premiumSections) {
        try {
          const encryptedBytes = new TextEncoder().encode(premiumSection.content);
          
          const decryptedBytes = await this.sealClient.decrypt({
            data: encryptedBytes,
            sessionKey,
            txBytes: approvalTxBytes,
          });

          decryptedSections.push({
            type: 'premium',
            content: new TextDecoder().decode(decryptedBytes),
            format: premiumSection.format,
          });
        } catch (error) {
          // Handle decryption failures gracefully (Requirement 4.6)
          throw new BlockchainNewsletterError(
            'Failed to decrypt premium content section',
            ErrorCode.DECRYPTION_FAILED,
            error
          );
        }
      }

      return decryptedSections;
    } catch (error) {
      if (error instanceof BlockchainNewsletterError) {
        throw error;
      }
      throw new BlockchainNewsletterError(
        'Failed to decrypt premium content',
        'DECRYPTION_WORKFLOW_FAILED',
        error
      );
    }
  }

  /**
   * Verify NFT ownership for premium content access
   * Implements Requirement 4.1
   */
  private async verifyNFTOwnership(
    nft: NewsletterAccessNFT,
    newsletterId: string,
    userAddress: string
  ): Promise<boolean> {
    try {
      // Verify NFT is for the correct newsletter
      if (nft.newsletterId !== newsletterId) {
        return false;
      }

      // Query current NFT ownership on-chain
      const nftObject = await this.suiClient.getObject({
        id: nft.id,
        options: {
          showOwner: true,
          showContent: true,
        },
      });

      if (!nftObject.data) {
        return false;
      }

      // Verify the NFT is owned by the user
      const owner = nftObject.data.owner;
      if (!owner || typeof owner !== 'object' || !('AddressOwner' in owner)) {
        return false;
      }

      return (owner as any).AddressOwner === userAddress;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to verify NFT ownership',
        'VERIFICATION_FAILED',
        error
      );
    }
  }

  /**
   * Create session key for Seal decryption
   * Implements Requirement 4.3
   */
  private async createSessionKey(
    userAddress: string,
    sealPackageId: string
  ): Promise<SessionKey> {
    try {
      const sessionKey = await this.sealClient.createSessionKey({
        address: userAddress,
        packageId: sealPackageId,
        ttlMin: 10, // 10 minute TTL
      });

      return sessionKey;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to create session key',
        'SESSION_KEY_FAILED',
        error
      );
    }
  }

  /**
   * Construct Seal approval transaction with NFT proof
   * Implements Requirement 4.2
   */
  private async constructSealApprovalTx(
    issue: Issue,
    newsletter: BlockchainNewsletter,
    nft: NewsletterAccessNFT,
    userAddress: string
  ): Promise<Uint8Array> {
    try {
      // Create identity for this issue: [newsletter_id][issue_id]
      const identity = `${newsletter.id}:${issue.id}`;

      // Build transaction that calls seal_approve_nft
      const tx = new Transaction();
      tx.setSender(userAddress);

      tx.moveCall({
        target: `${newsletter.sealPackageId}::access_policy::seal_approve_nft`,
        arguments: [
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(identity))),
          tx.object(nft.id),
        ],
      });

      // Build transaction bytes (in real implementation, this would be signed)
      const txBytes = await tx.build({ client: this.suiClient });

      return txBytes;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to construct Seal approval transaction',
        'APPROVAL_TX_FAILED',
        error
      );
    }
  }

  /**
   * Get all NFTs minted for a newsletter
   * Implements Requirement 5.1
   */
  async getNewsletterNFTs(newsletterId: string): Promise<NewsletterAccessNFT[]> {
    if (!newsletterId || newsletterId.length === 0) {
      throw new BlockchainNewsletterError('Newsletter ID is required', 'INVALID_NEWSLETTER_ID');
    }

    try {
      // Query Sui for all NFTs with this newsletter_id
      // Note: This requires indexing or querying by dynamic field
      // For now, we'll return empty array as this requires backend indexing
      
      // In a real implementation, you would:
      // 1. Use an indexer service to track NFT minting events
      // 2. Query the indexer for NFTs with matching newsletter_id
      // 3. Fetch current ownership from Sui for each NFT
      
      return [];
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to get newsletter NFTs',
        'FETCH_NFTS_FAILED',
        error
      );
    }
  }

  /**
   * Get NFTs owned by a specific address for a newsletter
   * Implements Requirement 5.3
   */
  async getOwnedNFTs(ownerAddress: string, newsletterId: string): Promise<NewsletterAccessNFT[]> {
    if (!ownerAddress || ownerAddress.length === 0) {
      throw new BlockchainNewsletterError('Owner address is required', 'INVALID_OWNER');
    }

    if (!newsletterId || newsletterId.length === 0) {
      throw new BlockchainNewsletterError('Newsletter ID is required', 'INVALID_NEWSLETTER_ID');
    }

    try {
      // Query Sui for all NFTs owned by this address
      const response = await this.suiClient.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::nft::NewsletterAccessNFT`,
        },
        options: {
          showContent: true,
        },
      });

      const nfts: NewsletterAccessNFT[] = [];

      for (const item of response.data) {
        if (!item.data || !item.data.content) {
          continue;
        }

        const content = item.data.content as any;
        const fields = content.fields;

        // Filter by newsletter ID
        if (fields.newsletter_id === newsletterId) {
          nfts.push({
            id: fields.id.id,
            newsletterId: fields.newsletter_id,
            accessLevel: parseInt(fields.access_level),
            issuedAt: parseInt(fields.issued_at),
          });
        }
      }

      return nfts;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to get owned NFTs',
        'FETCH_OWNED_NFTS_FAILED',
        error
      );
    }
  }

  /**
   * Get the current holder of an NFT
   * Implements Requirement 5.4
   */
  async getNFTHolder(nftId: string): Promise<string | null> {
    if (!nftId || nftId.length === 0) {
      throw new BlockchainNewsletterError('NFT ID is required', 'INVALID_NFT_ID');
    }

    try {
      const response = await this.suiClient.getObject({
        id: nftId,
        options: {
          showOwner: true,
        },
      });

      if (!response.data || !response.data.owner) {
        return null;
      }

      const owner = response.data.owner;
      if (typeof owner === 'object' && 'AddressOwner' in owner) {
        return (owner as any).AddressOwner;
      }

      return null;
    } catch (error) {
      throw new BlockchainNewsletterError(
        'Failed to get NFT holder',
        'FETCH_HOLDER_FAILED',
        error
      );
    }
  }

  /**
   * Generate a unique ID (placeholder - in real implementation would use Sui object IDs)
   */
  private generateId(): string {
    return `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`;
  }
}
