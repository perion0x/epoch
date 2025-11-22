/**
 * Analytics service for newsletter platform
 * Implements Task 13.2 - Create analytics dashboard
 * 
 * Features:
 * - Display issue view counts
 * - Show subscriber growth charts
 * - Display NFT distribution
 * - Show publication frequency
 */

import {
  EventIndexer,
  EventType,
  NewsletterEvent,
  IssuePublishedEvent,
  SubscribedEvent,
  UnsubscribedEvent,
  NFTMintedEvent,
} from './events';

/**
 * Analytics data for a newsletter
 */
export interface NewsletterAnalytics {
  newsletterId: string;
  totalIssues: number;
  totalSubscribers: number;
  totalNFTsMinted: number;
  issueViewCounts: Record<string, number>;
  subscriberGrowth: SubscriberGrowthData[];
  nftDistribution: NFTDistributionData[];
  publicationFrequency: PublicationFrequencyData[];
  recentActivity: ActivityData[];
}

/**
 * Subscriber growth data point
 */
export interface SubscriberGrowthData {
  date: string;
  count: number;
  cumulative: number;
}

/**
 * NFT distribution data
 */
export interface NFTDistributionData {
  holder: string;
  count: number;
}

/**
 * Publication frequency data
 */
export interface PublicationFrequencyData {
  period: string;
  count: number;
}

/**
 * Activity data
 */
export interface ActivityData {
  type: string;
  timestamp: number;
  description: string;
  data: Record<string, unknown>;
}

/**
 * Platform-wide analytics
 */
export interface PlatformAnalytics {
  totalNewsletters: number;
  totalIssues: number;
  totalSubscribers: number;
  totalNFTs: number;
  activeNewsletters: number;
  topNewsletters: TopNewsletterData[];
  recentActivity: ActivityData[];
}

/**
 * Top newsletter data
 */
export interface TopNewsletterData {
  newsletterId: string;
  title: string;
  issueCount: number;
  subscriberCount: number;
  nftCount: number;
}

/**
 * Analytics service
 */
export class AnalyticsService {
  private eventIndexer: EventIndexer;

  constructor(eventIndexer: EventIndexer) {
    this.eventIndexer = eventIndexer;
  }

  /**
   * Get analytics for a specific newsletter
   */
  async getNewsletterAnalytics(newsletterId: string): Promise<NewsletterAnalytics> {
    const events = await this.eventIndexer.getEventsByNewsletter(newsletterId);

    const issueEvents = events.filter(
      (e) => e.type === EventType.ISSUE_PUBLISHED
    ) as IssuePublishedEvent[];

    const subscribeEvents = events.filter(
      (e) => e.type === EventType.SUBSCRIBED
    ) as SubscribedEvent[];

    const unsubscribeEvents = events.filter(
      (e) => e.type === EventType.UNSUBSCRIBED
    ) as UnsubscribedEvent[];

    const nftEvents = events.filter(
      (e) => e.type === EventType.NFT_MINTED
    ) as NFTMintedEvent[];

    return {
      newsletterId,
      totalIssues: issueEvents.length,
      totalSubscribers: this.calculateCurrentSubscribers(
        subscribeEvents,
        unsubscribeEvents
      ),
      totalNFTsMinted: nftEvents.length,
      issueViewCounts: this.calculateIssueViewCounts(events),
      subscriberGrowth: this.calculateSubscriberGrowth(
        subscribeEvents,
        unsubscribeEvents
      ),
      nftDistribution: this.calculateNFTDistribution(nftEvents),
      publicationFrequency: this.calculatePublicationFrequency(issueEvents),
      recentActivity: this.getRecentActivity(events, 10),
    };
  }

  /**
   * Get platform-wide analytics
   */
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const allEvents = await this.eventIndexer.getEvents();

    const newsletterEvents = allEvents.filter(
      (e) => e.type === EventType.NEWSLETTER_CREATED
    );

    const issueEvents = allEvents.filter(
      (e) => e.type === EventType.ISSUE_PUBLISHED
    ) as IssuePublishedEvent[];

    const subscribeEvents = allEvents.filter(
      (e) => e.type === EventType.SUBSCRIBED
    ) as SubscribedEvent[];

    const unsubscribeEvents = allEvents.filter(
      (e) => e.type === EventType.UNSUBSCRIBED
    ) as UnsubscribedEvent[];

    const nftEvents = allEvents.filter(
      (e) => e.type === EventType.NFT_MINTED
    ) as NFTMintedEvent[];

    // Calculate active newsletters (published in last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentIssues = issueEvents.filter((e) => e.timestamp >= thirtyDaysAgo);
    const activeNewsletterIds = new Set(
      recentIssues.map((e) => e.data.newsletterId)
    );

    return {
      totalNewsletters: newsletterEvents.length,
      totalIssues: issueEvents.length,
      totalSubscribers: this.calculateCurrentSubscribers(
        subscribeEvents,
        unsubscribeEvents
      ),
      totalNFTs: nftEvents.length,
      activeNewsletters: activeNewsletterIds.size,
      topNewsletters: await this.getTopNewsletters(5),
      recentActivity: this.getRecentActivity(allEvents, 20),
    };
  }

  /**
   * Calculate current subscriber count
   */
  private calculateCurrentSubscribers(
    subscribeEvents: SubscribedEvent[],
    unsubscribeEvents: UnsubscribedEvent[]
  ): number {
    const subscribers = new Set<string>();

    // Add all subscribers
    subscribeEvents.forEach((e) => subscribers.add(e.data.subscriber));

    // Remove unsubscribers
    unsubscribeEvents.forEach((e) => subscribers.delete(e.data.subscriber));

    return subscribers.size;
  }

  /**
   * Calculate issue view counts
   * Note: This is a placeholder - actual view tracking would require additional events
   */
  private calculateIssueViewCounts(
    events: NewsletterEvent[]
  ): Record<string, number> {
    const viewCounts: Record<string, number> = {};

    // For now, we'll use issue published events as a proxy
    // In a real implementation, you'd track actual view events
    events
      .filter((e) => e.type === EventType.ISSUE_PUBLISHED)
      .forEach((e) => {
        const issueId = (e as IssuePublishedEvent).data.issueId;
        viewCounts[issueId] = 0; // Placeholder
      });

    return viewCounts;
  }

  /**
   * Calculate subscriber growth over time
   */
  private calculateSubscriberGrowth(
    subscribeEvents: SubscribedEvent[],
    unsubscribeEvents: UnsubscribedEvent[]
  ): SubscriberGrowthData[] {
    // Combine and sort all events by timestamp
    const allEvents = [
      ...subscribeEvents.map((e) => ({ ...e, delta: 1 })),
      ...unsubscribeEvents.map((e) => ({ ...e, delta: -1 })),
    ].sort((a, b) => a.timestamp - b.timestamp);

    const growthData: SubscriberGrowthData[] = [];
    let cumulative = 0;
    const dailyCounts: Record<string, number> = {};

    allEvents.forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + event.delta;
    });

    Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        cumulative += count;
        growthData.push({ date, count, cumulative });
      });

    return growthData;
  }

  /**
   * Calculate NFT distribution
   */
  private calculateNFTDistribution(
    nftEvents: NFTMintedEvent[]
  ): NFTDistributionData[] {
    const distribution: Record<string, number> = {};

    nftEvents.forEach((e) => {
      const holder = e.data.recipient;
      distribution[holder] = (distribution[holder] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([holder, count]) => ({ holder, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate publication frequency
   */
  private calculatePublicationFrequency(
    issueEvents: IssuePublishedEvent[]
  ): PublicationFrequencyData[] {
    const frequency: Record<string, number> = {};

    issueEvents.forEach((e) => {
      // Group by month
      const period = new Date(e.timestamp).toISOString().slice(0, 7); // YYYY-MM
      frequency[period] = (frequency[period] || 0) + 1;
    });

    return Object.entries(frequency)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get recent activity
   */
  private getRecentActivity(
    events: NewsletterEvent[],
    limit: number
  ): ActivityData[] {
    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map((e) => ({
        type: e.type,
        timestamp: e.timestamp,
        description: this.getActivityDescription(e),
        data: e.data,
      }));
  }

  /**
   * Get activity description
   */
  private getActivityDescription(event: NewsletterEvent): string {
    switch (event.type) {
      case EventType.NEWSLETTER_CREATED:
        return `Newsletter "${event.data.title}" created`;
      case EventType.ISSUE_PUBLISHED:
        return 'New issue published';
      case EventType.NFT_MINTED:
        return 'Access NFT minted';
      case EventType.NFT_TRANSFERRED:
        return 'NFT transferred';
      case EventType.SUBSCRIBED:
        return 'New subscriber';
      case EventType.UNSUBSCRIBED:
        return 'Subscriber left';
      default:
        return 'Activity';
    }
  }

  /**
   * Get top newsletters by various metrics
   */
  private async getTopNewsletters(limit: number): Promise<TopNewsletterData[]> {
    const allEvents = await this.eventIndexer.getEvents();

    // Group events by newsletter
    const newsletterData: Record<
      string,
      {
        title: string;
        issueCount: number;
        subscriberCount: number;
        nftCount: number;
      }
    > = {};

    allEvents.forEach((e) => {
      if (e.type === EventType.NEWSLETTER_CREATED) {
        const newsletterId = e.data.newsletterId as string;
        newsletterData[newsletterId] = {
          title: e.data.title as string,
          issueCount: 0,
          subscriberCount: 0,
          nftCount: 0,
        };
      }
    });

    // Count issues, subscribers, and NFTs per newsletter
    allEvents.forEach((e) => {
      let newsletterId: string | undefined;

      if ('newsletterId' in e.data) {
        newsletterId = e.data.newsletterId as string;
      }

      if (newsletterId && newsletterData[newsletterId]) {
        if (e.type === EventType.ISSUE_PUBLISHED) {
          newsletterData[newsletterId].issueCount++;
        } else if (e.type === EventType.SUBSCRIBED) {
          newsletterData[newsletterId].subscriberCount++;
        } else if (e.type === EventType.NFT_MINTED) {
          newsletterData[newsletterId].nftCount++;
        }
      }
    });

    // Convert to array and sort by total activity
    return Object.entries(newsletterData)
      .map(([newsletterId, data]) => ({
        newsletterId,
        ...data,
      }))
      .sort(
        (a, b) =>
          b.issueCount +
          b.subscriberCount +
          b.nftCount -
          (a.issueCount + a.subscriberCount + a.nftCount)
      )
      .slice(0, limit);
  }
}
