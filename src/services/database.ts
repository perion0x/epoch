/**
 * Database client for traditional newsletter storage
 * Uses in-memory storage for development (can be extended to use SQLite/PostgreSQL)
 */

import { Newsletter, Issue, NewsletterType } from '@/types';

export interface Migration {
  id: string;
  newsletterId: string;
  fromType: NewsletterType;
  toType: NewsletterType;
  blockchainTxDigest?: string;
  migratedAt: number;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * In-memory database implementation
 * For production, this should be replaced with a real database (PostgreSQL, SQLite, etc.)
 */
class DatabaseClient {
  private newsletters: Map<string, Newsletter> = new Map();
  private issues: Map<string, Issue> = new Map();
  private migrations: Map<string, Migration> = new Map();
  private issuesByNewsletter: Map<string, Set<string>> = new Map();

  // Newsletter operations
  async createNewsletter(newsletter: Newsletter): Promise<Newsletter> {
    this.newsletters.set(newsletter.id, newsletter);
    this.issuesByNewsletter.set(newsletter.id, new Set());
    return newsletter;
  }

  async getNewsletter(id: string): Promise<Newsletter | null> {
    return this.newsletters.get(id) || null;
  }

  async updateNewsletter(id: string, updates: Partial<Newsletter>): Promise<Newsletter | null> {
    const newsletter = this.newsletters.get(id);
    if (!newsletter) return null;

    const updated = { ...newsletter, ...updates, updatedAt: Date.now() };
    this.newsletters.set(id, updated);
    return updated;
  }

  async deleteNewsletter(id: string): Promise<boolean> {
    const deleted = this.newsletters.delete(id);
    if (deleted) {
      // Delete all associated issues
      const issueIds = this.issuesByNewsletter.get(id);
      if (issueIds) {
        issueIds.forEach(issueId => this.issues.delete(issueId));
        this.issuesByNewsletter.delete(id);
      }
    }
    return deleted;
  }

  async listNewsletters(filters?: { type?: NewsletterType; creator?: string }): Promise<Newsletter[]> {
    let newsletters = Array.from(this.newsletters.values());
    
    if (filters?.type) {
      newsletters = newsletters.filter(n => n.type === filters.type);
    }
    
    if (filters?.creator) {
      newsletters = newsletters.filter(n => n.creator === filters.creator);
    }
    
    return newsletters.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Issue operations
  async createIssue(issue: Issue): Promise<Issue> {
    this.issues.set(issue.id, issue);
    
    // Add to newsletter's issue list
    const issueSet = this.issuesByNewsletter.get(issue.newsletterId);
    if (issueSet) {
      issueSet.add(issue.id);
    }
    
    return issue;
  }

  async getIssue(id: string): Promise<Issue | null> {
    return this.issues.get(id) || null;
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
    const issue = this.issues.get(id);
    if (!issue) return null;

    const updated = { ...issue, ...updates, updatedAt: Date.now() };
    this.issues.set(id, updated);
    return updated;
  }

  async deleteIssue(id: string): Promise<boolean> {
    const issue = this.issues.get(id);
    if (!issue) return false;

    // Remove from newsletter's issue list
    const issueSet = this.issuesByNewsletter.get(issue.newsletterId);
    if (issueSet) {
      issueSet.delete(id);
    }

    return this.issues.delete(id);
  }

  async listIssues(newsletterId: string): Promise<Issue[]> {
    const issueIds = this.issuesByNewsletter.get(newsletterId);
    if (!issueIds) return [];

    const issues = Array.from(issueIds)
      .map(id => this.issues.get(id))
      .filter((issue): issue is Issue => issue !== undefined);

    return issues.sort((a, b) => b.publishedAt - a.publishedAt);
  }

  // Migration operations
  async createMigration(migration: Migration): Promise<Migration> {
    this.migrations.set(migration.id, migration);
    return migration;
  }

  async getMigration(id: string): Promise<Migration | null> {
    return this.migrations.get(id) || null;
  }

  async getMigrationByNewsletterId(newsletterId: string): Promise<Migration | null> {
    const migrations = Array.from(this.migrations.values());
    return migrations.find(m => m.newsletterId === newsletterId) || null;
  }

  async updateMigration(id: string, updates: Partial<Migration>): Promise<Migration | null> {
    const migration = this.migrations.get(id);
    if (!migration) return null;

    const updated = { ...migration, ...updates };
    this.migrations.set(id, updated);
    return updated;
  }

  // Utility methods
  async clear(): Promise<void> {
    this.newsletters.clear();
    this.issues.clear();
    this.migrations.clear();
    this.issuesByNewsletter.clear();
  }

  async getStats(): Promise<{
    newsletterCount: number;
    issueCount: number;
    migrationCount: number;
  }> {
    return {
      newsletterCount: this.newsletters.size,
      issueCount: this.issues.size,
      migrationCount: this.migrations.size,
    };
  }
}

// Singleton instance
let dbInstance: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
  if (!dbInstance) {
    dbInstance = new DatabaseClient();
  }
  return dbInstance;
}

// For testing purposes
export function resetDatabase(): void {
  dbInstance = new DatabaseClient();
}

export type { DatabaseClient };
