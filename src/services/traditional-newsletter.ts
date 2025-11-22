/**
 * Traditional Newsletter Service
 * Handles database-backed newsletters that don't require blockchain interaction
 */

import { Newsletter, Issue, AccessModel, NewsletterType, TraditionalNewsletter } from '@/types';
import { getDatabase } from './database';
import { ErrorCode } from './errors';

export interface CreateTraditionalNewsletterParams {
  creator: string;  // Email or username
  title: string;
  description: string;
  accessModel: AccessModel;
}

export interface PublishTraditionalIssueParams {
  newsletterId: string;
  title: string;
  content: string;
  hasPremium?: boolean;
}

export interface UpdateNewsletterParams {
  title?: string;
  description?: string;
  accessModel?: AccessModel;
}

export interface UpdateIssueParams {
  title?: string;
  content?: string;
  hasPremium?: boolean;
}

export class TraditionalNewsletterService {
  private db = getDatabase();

  /**
   * Create a new traditional newsletter (no wallet required)
   */
  async createNewsletter(params: CreateTraditionalNewsletterParams): Promise<TraditionalNewsletter> {
    const { creator, title, description, accessModel } = params;

    // Validate that it's a free newsletter (traditional newsletters can't be NFT-gated)
    if (accessModel.isNftGated || accessModel.isHybrid) {
      throw new Error(ErrorCode.INVALID_ACCESS_MODEL);
    }

    const now = Date.now();
    const newsletter: Newsletter = {
      id: this.generateId(),
      type: NewsletterType.TRADITIONAL,
      creator,
      title,
      description,
      accessModel,
      createdAt: now,
      updatedAt: now,
      issueCount: 0,
    };

    await this.db.createNewsletter(newsletter);
    return newsletter as TraditionalNewsletter;
  }

  /**
   * Publish an issue to a traditional newsletter (stored in database)
   */
  async publishIssue(params: PublishTraditionalIssueParams): Promise<Issue> {
    const { newsletterId, title, content, hasPremium = false } = params;

    // Verify newsletter exists and is traditional
    const newsletter = await this.db.getNewsletter(newsletterId);
    if (!newsletter) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }

    if (newsletter.type !== NewsletterType.TRADITIONAL) {
      throw new Error('Cannot publish traditional issue to blockchain newsletter');
    }

    const now = Date.now();
    const issue: Issue = {
      id: this.generateId(),
      newsletterId,
      title,
      content,
      publishedAt: now,
      updatedAt: now,
      hasPremium,
    };

    await this.db.createIssue(issue);

    // Update newsletter issue count
    await this.db.updateNewsletter(newsletterId, {
      issueCount: newsletter.issueCount + 1,
    });

    return issue;
  }

  /**
   * Update newsletter metadata
   */
  async updateNewsletter(id: string, updates: UpdateNewsletterParams): Promise<Newsletter> {
    const newsletter = await this.db.getNewsletter(id);
    if (!newsletter) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }

    if (newsletter.type !== NewsletterType.TRADITIONAL) {
      throw new Error('Cannot update blockchain newsletter through traditional service');
    }

    // Validate access model if being updated
    if (updates.accessModel && (updates.accessModel.isNftGated || updates.accessModel.isHybrid)) {
      throw new Error(ErrorCode.INVALID_ACCESS_MODEL);
    }

    const updated = await this.db.updateNewsletter(id, updates);
    if (!updated) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }

    return updated;
  }

  /**
   * Update issue content (only for traditional newsletters)
   */
  async updateIssue(id: string, updates: UpdateIssueParams): Promise<Issue> {
    const issue = await this.db.getIssue(id);
    if (!issue) {
      throw new Error(ErrorCode.ISSUE_NOT_FOUND);
    }

    // Verify the newsletter is traditional
    const newsletter = await this.db.getNewsletter(issue.newsletterId);
    if (!newsletter || newsletter.type !== NewsletterType.TRADITIONAL) {
      throw new Error('Cannot update blockchain issue through traditional service');
    }

    const updated = await this.db.updateIssue(id, updates);
    if (!updated) {
      throw new Error(ErrorCode.ISSUE_NOT_FOUND);
    }

    return updated;
  }

  /**
   * Delete a traditional newsletter and all its issues
   */
  async deleteNewsletter(id: string): Promise<void> {
    const newsletter = await this.db.getNewsletter(id);
    if (!newsletter) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }

    if (newsletter.type !== NewsletterType.TRADITIONAL) {
      throw new Error('Cannot delete blockchain newsletter');
    }

    const deleted = await this.db.deleteNewsletter(id);
    if (!deleted) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }
  }

  /**
   * Delete a traditional issue
   */
  async deleteIssue(id: string): Promise<void> {
    const issue = await this.db.getIssue(id);
    if (!issue) {
      throw new Error(ErrorCode.ISSUE_NOT_FOUND);
    }

    // Verify the newsletter is traditional
    const newsletter = await this.db.getNewsletter(issue.newsletterId);
    if (!newsletter || newsletter.type !== NewsletterType.TRADITIONAL) {
      throw new Error('Cannot delete blockchain issue');
    }

    const deleted = await this.db.deleteIssue(id);
    if (!deleted) {
      throw new Error(ErrorCode.ISSUE_NOT_FOUND);
    }

    // Update newsletter issue count
    await this.db.updateNewsletter(newsletter.id, {
      issueCount: Math.max(0, newsletter.issueCount - 1),
    });
  }

  /**
   * Get a newsletter by ID
   */
  async getNewsletter(id: string): Promise<Newsletter | null> {
    return this.db.getNewsletter(id);
  }

  /**
   * Get an issue by ID
   */
  async getIssue(id: string): Promise<Issue | null> {
    return this.db.getIssue(id);
  }

  /**
   * List all issues for a newsletter
   */
  async listIssues(newsletterId: string): Promise<Issue[]> {
    return this.db.listIssues(newsletterId);
  }

  /**
   * List all traditional newsletters
   */
  async listNewsletters(creator?: string): Promise<Newsletter[]> {
    return this.db.listNewsletters({
      type: NewsletterType.TRADITIONAL,
      creator,
    });
  }

  /**
   * Mark a newsletter as migrated to blockchain
   */
  async markAsMigrated(id: string, blockchainId: string): Promise<void> {
    const newsletter = await this.db.getNewsletter(id);
    if (!newsletter) {
      throw new Error(ErrorCode.NEWSLETTER_NOT_FOUND);
    }

    await this.db.updateNewsletter(id, {
      type: NewsletterType.BLOCKCHAIN,
      blockchainId,
    });
  }

  /**
   * Generate a unique ID for newsletters and issues
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
