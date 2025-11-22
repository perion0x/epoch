/**
 * Analytics Dashboard Component
 * Implements Task 13.2 - Create analytics dashboard
 * 
 * Features:
 * - Display issue view counts
 * - Show subscriber growth charts
 * - Display NFT distribution
 * - Show publication frequency
 */

'use client';

import { useState, useEffect } from 'react';
import {
  NewsletterAnalytics,
  PlatformAnalytics,
} from '@/services/analytics';

interface AnalyticsDashboardProps {
  newsletterId?: string;
  analytics: NewsletterAnalytics | PlatformAnalytics;
  loading?: boolean;
}

export function AnalyticsDashboard({
  newsletterId,
  analytics,
  loading,
}: AnalyticsDashboardProps) {
  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const isNewsletterAnalytics = 'newsletterId' in analytics;

  return (
    <div className="analytics-dashboard">
      <h2 className="analytics-title">
        {isNewsletterAnalytics ? 'Newsletter Analytics' : 'Platform Analytics'}
      </h2>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        {isNewsletterAnalytics ? (
          <NewsletterMetrics analytics={analytics as NewsletterAnalytics} />
        ) : (
          <PlatformMetrics analytics={analytics as PlatformAnalytics} />
        )}
      </div>

      {/* Charts and Details */}
      {isNewsletterAnalytics && (
        <NewsletterCharts analytics={analytics as NewsletterAnalytics} />
      )}

      {!isNewsletterAnalytics && (
        <PlatformCharts analytics={analytics as PlatformAnalytics} />
      )}

      {/* Recent Activity */}
      <RecentActivity
        activities={analytics.recentActivity}
        title="Recent Activity"
      />
    </div>
  );
}

function NewsletterMetrics({ analytics }: { analytics: NewsletterAnalytics }) {
  return (
    <>
      <MetricCard
        title="Total Issues"
        value={analytics.totalIssues}
        icon="📄"
        color="blue"
      />
      <MetricCard
        title="Subscribers"
        value={analytics.totalSubscribers}
        icon="👥"
        color="green"
      />
      <MetricCard
        title="NFTs Minted"
        value={analytics.totalNFTsMinted}
        icon="🎫"
        color="purple"
      />
    </>
  );
}

function PlatformMetrics({ analytics }: { analytics: PlatformAnalytics }) {
  return (
    <>
      <MetricCard
        title="Total Newsletters"
        value={analytics.totalNewsletters}
        icon="📰"
        color="blue"
      />
      <MetricCard
        title="Active Newsletters"
        value={analytics.activeNewsletters}
        icon="✨"
        color="green"
      />
      <MetricCard
        title="Total Issues"
        value={analytics.totalIssues}
        icon="📄"
        color="purple"
      />
      <MetricCard
        title="Total Subscribers"
        value={analytics.totalSubscribers}
        icon="👥"
        color="orange"
      />
    </>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value.toLocaleString()}</div>
        <div className="metric-title">{title}</div>
      </div>
    </div>
  );
}

function NewsletterCharts({ analytics }: { analytics: NewsletterAnalytics }) {
  return (
    <div className="analytics-charts">
      {/* Subscriber Growth */}
      {analytics.subscriberGrowth.length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">Subscriber Growth</h3>
          <div className="chart-content">
            <SimpleLineChart data={analytics.subscriberGrowth} />
          </div>
        </div>
      )}

      {/* Publication Frequency */}
      {analytics.publicationFrequency.length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">Publication Frequency</h3>
          <div className="chart-content">
            <SimpleBarChart data={analytics.publicationFrequency} />
          </div>
        </div>
      )}

      {/* NFT Distribution */}
      {analytics.nftDistribution.length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">NFT Distribution</h3>
          <div className="chart-content">
            <NFTDistributionList data={analytics.nftDistribution} />
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformCharts({ analytics }: { analytics: PlatformAnalytics }) {
  return (
    <div className="analytics-charts">
      {/* Top Newsletters */}
      {analytics.topNewsletters.length > 0 && (
        <div className="chart-card full-width">
          <h3 className="chart-title">Top Newsletters</h3>
          <div className="chart-content">
            <TopNewslettersList data={analytics.topNewsletters} />
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleLineChart({
  data,
}: {
  data: Array<{ date: string; cumulative: number }>;
}) {
  const maxValue = Math.max(...data.map((d) => d.cumulative));

  return (
    <div className="simple-chart">
      {data.map((point, index) => (
        <div key={point.date} className="chart-bar">
          <div
            className="chart-bar-fill line"
            style={{ height: `${(point.cumulative / maxValue) * 100}%` }}
          />
          <div className="chart-bar-label">{point.date.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

function SimpleBarChart({
  data,
}: {
  data: Array<{ period: string; count: number }>;
}) {
  const maxValue = Math.max(...data.map((d) => d.count));

  return (
    <div className="simple-chart">
      {data.map((point) => (
        <div key={point.period} className="chart-bar">
          <div
            className="chart-bar-fill bar"
            style={{ height: `${(point.count / maxValue) * 100}%` }}
          />
          <div className="chart-bar-label">{point.period.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

function NFTDistributionList({
  data,
}: {
  data: Array<{ holder: string; count: number }>;
}) {
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div className="distribution-list">
      {data.slice(0, 10).map((item, index) => (
        <div key={item.holder} className="distribution-item">
          <div className="distribution-rank">#{index + 1}</div>
          <div className="distribution-holder">{formatAddress(item.holder)}</div>
          <div className="distribution-count">{item.count} NFTs</div>
        </div>
      ))}
    </div>
  );
}

function TopNewslettersList({
  data,
}: {
  data: Array<{
    newsletterId: string;
    title: string;
    issueCount: number;
    subscriberCount: number;
    nftCount: number;
  }>;
}) {
  return (
    <div className="top-newsletters-list">
      {data.map((newsletter, index) => (
        <div key={newsletter.newsletterId} className="top-newsletter-item">
          <div className="newsletter-rank">#{index + 1}</div>
          <div className="newsletter-info">
            <div className="newsletter-name">{newsletter.title}</div>
            <div className="newsletter-stats">
              <span>{newsletter.issueCount} issues</span>
              <span>•</span>
              <span>{newsletter.subscriberCount} subscribers</span>
              <span>•</span>
              <span>{newsletter.nftCount} NFTs</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivity({
  activities,
  title,
}: {
  activities: Array<{
    type: string;
    timestamp: number;
    description: string;
  }>;
  title: string;
}) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="recent-activity">
      <h3 className="activity-title">{title}</h3>
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="activity-empty">No recent activity</div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-description">{activity.description}</div>
                <div className="activity-time">{formatTime(activity.timestamp)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'NewsletterCreated':
      return '📰';
    case 'IssuePublished':
      return '📄';
    case 'NFTMinted':
      return '🎫';
    case 'NFTTransferred':
      return '🔄';
    case 'Subscribed':
      return '➕';
    case 'Unsubscribed':
      return '➖';
    default:
      return '📊';
  }
}
