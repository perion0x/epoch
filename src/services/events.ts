/**
 * Event indexing service for newsletter platform
 * Implements Task 13.1 - Add event indexing service
 * 
 * Features:
 * - Index NewsletterCreated events
 * - Index IssuePublished events
 * - Index NFTMinted events
 * - Index Subscribed/Unsubscribed events
 * - Store in database for querying
 */

import { SuiClient, SuiEvent } from '@mysten/sui/client';

/**
 * Event types from the blockchain
 */
export enum EventType {
  NEWSLETTER_CREATED = 'NewsletterCreated',
  ISSUE_PUBLISHED = 'IssuePublished',
  NFT_MINTED = 'NFTMinted',
  NFT_TRANSFERRED = 'NFTTransferred',
  SUBSCRIBED = 'Subscribed',
  UNSUBSCRIBED = 'Unsubscribed',
}

/**
 * Base indexed event
 */
export interface IndexedEvent {
  id: string;
  type: EventType;
  timestamp: number;
  transactionDigest: string;
  sender: string;
  data: Record<string, unknown>;
}

/**
 * Newsletter created event
 */
export interface NewsletterCreatedEvent extends IndexedEvent {
  type: EventType.NEWSLETTER_CREATED;
  data: {
    newsletterId: string;
    creator: string;
    title: string;
    accessModel: {
      isFree: boolean;
      isNftGated: boolean;
      isHybrid: boolean;
    };
  };
}

/**
 * Issue published event
 */
export interface IssuePublishedEvent extends IndexedEvent {
  type: EventType.ISSUE_PUBLISHED;
  data: {
    issueId: string;
    newsletterId: string;
    walrusBlobId: string;
    hasPremium: boolean;
    publishedAt: number;
  };
}

/**
 * NFT minted event
 */
export interface NFTMintedEvent extends IndexedEvent {
  type: EventType.NFT_MINTED;
  data: {
    nftId: string;
    newsletterId: string;
    recipient: string;
  };
}

/**
 * NFT transferred event
 */
export interface NFTTransferredEvent extends IndexedEvent {
  type: EventType.NFT_TRANSFERRED;
  data: {
    nftId: string;
    from: string;
    to: string;
  };
}

/**
 * Subscribed event
 */
export interface SubscribedEvent extends IndexedEvent {
  type: EventType.SUBSCRIBED;
  data: {
    subscriptionId: string;
    newsletterId: string;
    subscriber: string;
  };
}

/**
 * Unsubscribed event
 */
export interface UnsubscribedEvent extends IndexedEvent {
  type: EventType.UNSUBSCRIBED;
  data: {
    subscriptionId: string;
    newsletterId: string;
    subscriber: string;
  };
}

/**
 * Union type for all events
 */
export type NewsletterEvent =
  | NewsletterCreatedEvent
  | IssuePublishedEvent
  | NFTMintedEvent
  | NFTTransferredEvent
  | SubscribedEvent
  | UnsubscribedEvent;

/**
 * Event indexer configuration
 */
export interface EventIndexerConfig {
  packageId: string;
  pollIntervalMs?: number;
  batchSize?: number;
}

/**
 * Event storage interface
 */
export interface EventStorage {
  saveEvent(event: NewsletterEvent): Promise<void>;
  getEvents(filter?: EventFilter): Promise<NewsletterEvent[]>;
  getEventsByType(type: EventType): Promise<NewsletterEvent[]>;
  getEventsByNewsletter(newsletterId: string): Promise<NewsletterEvent[]>;
  getEventsByAddress(address: string): Promise<NewsletterEvent[]>;
  getLatestCursor(): Promise<string | null>;
  saveCursor(cursor: string): Promise<void>;
}

/**
 * Event filter
 */
export interface EventFilter {
  type?: EventType;
  newsletterId?: string;
  address?: string;
  fromTimestamp?: number;
  toTimestamp?: number;
  limit?: number;
}

/**
 * In-memory event storage (for development/testing)
 */
export class InMemoryEventStorage implements EventStorage {
  private events: NewsletterEvent[] = [];
  private cursor: string | null = null;

  async saveEvent(event: NewsletterEvent): Promise<void> {
    this.events.push(event);
  }

  async getEvents(filter?: EventFilter): Promise<NewsletterEvent[]> {
    let filtered = [...this.events];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter((e) => e.type === filter.type);
      }
      if (filter.newsletterId) {
        filtered = filtered.filter(
          (e) =>
            'newsletterId' in e.data && e.data.newsletterId === filter.newsletterId
        );
      }
      if (filter.address) {
        filtered = filtered.filter(
          (e) =>
            e.sender === filter.address ||
            ('creator' in e.data && e.data.creator === filter.address) ||
            ('subscriber' in e.data && e.data.subscriber === filter.address) ||
            ('recipient' in e.data && e.data.recipient === filter.address)
        );
      }
      if (filter.fromTimestamp) {
        filtered = filtered.filter((e) => e.timestamp >= filter.fromTimestamp!);
      }
      if (filter.toTimestamp) {
        filtered = filtered.filter((e) => e.timestamp <= filter.toTimestamp!);
      }
      if (filter.limit) {
        filtered = filtered.slice(0, filter.limit);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getEventsByType(type: EventType): Promise<NewsletterEvent[]> {
    return this.getEvents({ type });
  }

  async getEventsByNewsletter(newsletterId: string): Promise<NewsletterEvent[]> {
    return this.getEvents({ newsletterId });
  }

  async getEventsByAddress(address: string): Promise<NewsletterEvent[]> {
    return this.getEvents({ address });
  }

  async getLatestCursor(): Promise<string | null> {
    return this.cursor;
  }

  async saveCursor(cursor: string): Promise<void> {
    this.cursor = cursor;
  }

  // Helper methods for testing
  clear(): void {
    this.events = [];
    this.cursor = null;
  }

  getAll(): NewsletterEvent[] {
    return [...this.events];
  }
}

/**
 * Event indexer service
 */
export class EventIndexer {
  private suiClient: SuiClient;
  private storage: EventStorage;
  private config: Required<EventIndexerConfig>;
  private isRunning = false;
  private pollTimeout?: NodeJS.Timeout;

  constructor(
    suiClient: SuiClient,
    storage: EventStorage,
    config: EventIndexerConfig
  ) {
    this.suiClient = suiClient;
    this.storage = storage;
    this.config = {
      packageId: config.packageId,
      pollIntervalMs: config.pollIntervalMs || 5000,
      batchSize: config.batchSize || 100,
    };
  }

  /**
   * Start indexing events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Event indexer is already running');
      return;
    }

    this.isRunning = true;
    console.log('Event indexer started');
    await this.poll();
  }

  /**
   * Stop indexing events
   */
  stop(): void {
    this.isRunning = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = undefined;
    }
    console.log('Event indexer stopped');
  }

  /**
   * Poll for new events
   */
  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.indexEvents();
    } catch (error) {
      console.error('Error indexing events:', error);
    }

    // Schedule next poll
    this.pollTimeout = setTimeout(() => this.poll(), this.config.pollIntervalMs);
  }

  /**
   * Index events from the blockchain
   */
  async indexEvents(): Promise<number> {
    try {
      const cursor = await this.storage.getLatestCursor();
      
      // Query events from Sui
      const response = await this.suiClient.queryEvents({
        query: {
          MoveModule: {
            package: this.config.packageId,
            module: 'newsletter',
          },
        },
        cursor: cursor || undefined,
        limit: this.config.batchSize,
      });

      let indexed = 0;

      for (const suiEvent of response.data) {
        const event = this.parseEvent(suiEvent);
        if (event) {
          await this.storage.saveEvent(event);
          indexed++;
        }
      }

      // Save cursor for next query
      if (response.nextCursor) {
        await this.storage.saveCursor(response.nextCursor);
      }

      if (indexed > 0) {
        console.log(`Indexed ${indexed} events`);
      }

      return indexed;
    } catch (error) {
      console.error('Failed to index events:', error);
      return 0;
    }
  }

  /**
   * Parse Sui event into our event format
   */
  private parseEvent(suiEvent: SuiEvent): NewsletterEvent | null {
    try {
      const eventType = this.getEventType(suiEvent.type);
      if (!eventType) return null;

      const baseEvent: Omit<IndexedEvent, 'type' | 'data'> = {
        id: suiEvent.id.txDigest + '_' + suiEvent.id.eventSeq,
        timestamp: parseInt(suiEvent.timestampMs || '0'),
        transactionDigest: suiEvent.id.txDigest,
        sender: suiEvent.sender || '',
      };

      const parsedFields = suiEvent.parsedJson as Record<string, unknown>;

      switch (eventType) {
        case EventType.NEWSLETTER_CREATED:
          return {
            ...baseEvent,
            type: EventType.NEWSLETTER_CREATED,
            data: {
              newsletterId: parsedFields.newsletter_id as string,
              creator: parsedFields.creator as string,
              title: parsedFields.title as string,
              accessModel: parsedFields.access_model as any,
            },
          };

        case EventType.ISSUE_PUBLISHED:
          return {
            ...baseEvent,
            type: EventType.ISSUE_PUBLISHED,
            data: {
              issueId: parsedFields.issue_id as string,
              newsletterId: parsedFields.newsletter_id as string,
              walrusBlobId: parsedFields.walrus_blob_id as string,
              hasPremium: parsedFields.has_premium as boolean,
              publishedAt: parseInt(parsedFields.published_at as string),
            },
          };

        case EventType.NFT_MINTED:
          return {
            ...baseEvent,
            type: EventType.NFT_MINTED,
            data: {
              nftId: parsedFields.nft_id as string,
              newsletterId: parsedFields.newsletter_id as string,
              recipient: parsedFields.recipient as string,
            },
          };

        case EventType.NFT_TRANSFERRED:
          return {
            ...baseEvent,
            type: EventType.NFT_TRANSFERRED,
            data: {
              nftId: parsedFields.nft_id as string,
              from: parsedFields.from as string,
              to: parsedFields.to as string,
            },
          };

        case EventType.SUBSCRIBED:
          return {
            ...baseEvent,
            type: EventType.SUBSCRIBED,
            data: {
              subscriptionId: parsedFields.subscription_id as string,
              newsletterId: parsedFields.newsletter_id as string,
              subscriber: parsedFields.subscriber as string,
            },
          };

        case EventType.UNSUBSCRIBED:
          return {
            ...baseEvent,
            type: EventType.UNSUBSCRIBED,
            data: {
              subscriptionId: parsedFields.subscription_id as string,
              newsletterId: parsedFields.newsletter_id as string,
              subscriber: parsedFields.subscriber as string,
            },
          };

        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to parse event:', error);
      return null;
    }
  }

  /**
   * Get event type from Sui event type string
   */
  private getEventType(typeString: string): EventType | null {
    if (typeString.includes('::NewsletterCreated')) {
      return EventType.NEWSLETTER_CREATED;
    }
    if (typeString.includes('::IssuePublished')) {
      return EventType.ISSUE_PUBLISHED;
    }
    if (typeString.includes('::NFTMinted')) {
      return EventType.NFT_MINTED;
    }
    if (typeString.includes('::NFTTransferred')) {
      return EventType.NFT_TRANSFERRED;
    }
    if (typeString.includes('::Subscribed')) {
      return EventType.SUBSCRIBED;
    }
    if (typeString.includes('::Unsubscribed')) {
      return EventType.UNSUBSCRIBED;
    }
    return null;
  }

  /**
   * Get events from storage
   */
  async getEvents(filter?: EventFilter): Promise<NewsletterEvent[]> {
    return this.storage.getEvents(filter);
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: EventType): Promise<NewsletterEvent[]> {
    return this.storage.getEventsByType(type);
  }

  /**
   * Get events by newsletter
   */
  async getEventsByNewsletter(newsletterId: string): Promise<NewsletterEvent[]> {
    return this.storage.getEventsByNewsletter(newsletterId);
  }

  /**
   * Get events by address
   */
  async getEventsByAddress(address: string): Promise<NewsletterEvent[]> {
    return this.storage.getEventsByAddress(address);
  }
}
