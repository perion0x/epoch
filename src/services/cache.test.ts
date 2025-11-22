import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from './cache';
import { Newsletter, Issue } from '@/types';
import { ContentSection } from './content';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    cacheService = new CacheService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Newsletter Caching', () => {
    it('should cache and retrieve newsletter', () => {
      const newsletter: Newsletter = {
        id: '0x123',
        creator: '0xabc',
        title: 'Test Newsletter',
        description: 'Test Description',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xseal',
        createdAt: Date.now(),
        issueCount: 5,
      };

      cacheService.cacheNewsletter(newsletter);
      const cached = cacheService.getNewsletter('0x123');

      expect(cached).toEqual(newsletter);
    });

    it('should return null for non-existent newsletter', () => {
      const cached = cacheService.getNewsletter('0xnonexistent');
      expect(cached).toBeNull();
    });

    it('should invalidate newsletter cache', () => {
      const newsletter: Newsletter = {
        id: '0x123',
        creator: '0xabc',
        title: 'Test Newsletter',
        description: 'Test Description',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xseal',
        createdAt: Date.now(),
        issueCount: 5,
      };

      cacheService.cacheNewsletter(newsletter);
      cacheService.invalidateNewsletter('0x123');
      const cached = cacheService.getNewsletter('0x123');

      expect(cached).toBeNull();
    });

    it('should expire newsletter after TTL', () => {
      const newsletter: Newsletter = {
        id: '0x123',
        creator: '0xabc',
        title: 'Test Newsletter',
        description: 'Test Description',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xseal',
        createdAt: Date.now(),
        issueCount: 5,
      };

      // Cache with 1ms TTL
      cacheService.cacheNewsletter(newsletter, 1);

      // Wait for expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cached = cacheService.getNewsletter('0x123');
          expect(cached).toBeNull();
          resolve();
        }, 10);
      });
    });
  });

  describe('Issues Caching', () => {
    it('should cache and retrieve issues', () => {
      const issues: Issue[] = [
        {
          id: '0xissue1',
          newsletterId: '0x123',
          title: 'Issue 1',
          walrusBlobId: '0xblob1',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 100 }],
            encryptedRanges: [],
          },
          publishedAt: Date.now(),
          hasPremium: false,
        },
        {
          id: '0xissue2',
          newsletterId: '0x123',
          title: 'Issue 2',
          walrusBlobId: '0xblob2',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 200 }],
            encryptedRanges: [{ start: 200, end: 400 }],
          },
          publishedAt: Date.now(),
          hasPremium: true,
        },
      ];

      cacheService.cacheIssues('0x123', issues);
      const cached = cacheService.getIssues('0x123');

      expect(cached).toEqual(issues);
    });

    it('should invalidate issues cache', () => {
      const issues: Issue[] = [
        {
          id: '0xissue1',
          newsletterId: '0x123',
          title: 'Issue 1',
          walrusBlobId: '0xblob1',
          contentBoundaries: {
            publicRanges: [{ start: 0, end: 100 }],
            encryptedRanges: [],
          },
          publishedAt: Date.now(),
          hasPremium: false,
        },
      ];

      cacheService.cacheIssues('0x123', issues);
      cacheService.invalidateIssues('0x123');
      const cached = cacheService.getIssues('0x123');

      expect(cached).toBeNull();
    });
  });

  describe('Decrypted Content Caching', () => {
    it('should cache and retrieve decrypted content in memory', () => {
      const content: ContentSection[] = [
        {
          type: 'premium',
          content: 'Decrypted premium content',
          format: 'markdown',
        },
      ];

      cacheService.cacheDecryptedContent('0xissue1', content);
      const cached = cacheService.getDecryptedContent('0xissue1');

      expect(cached).toEqual(content);
    });

    it('should invalidate decrypted content', () => {
      const content: ContentSection[] = [
        {
          type: 'premium',
          content: 'Decrypted premium content',
          format: 'markdown',
        },
      ];

      cacheService.cacheDecryptedContent('0xissue1', content);
      cacheService.invalidateDecryptedContent('0xissue1');
      const cached = cacheService.getDecryptedContent('0xissue1');

      expect(cached).toBeNull();
    });

    it('should not persist decrypted content to localStorage', () => {
      const content: ContentSection[] = [
        {
          type: 'premium',
          content: 'Decrypted premium content',
          format: 'markdown',
        },
      ];

      cacheService.cacheDecryptedContent('0xissue1', content);

      // Check that it's not in localStorage
      const keys = Object.keys(localStorage);
      const hasDecryptedKey = keys.some(key => key.includes('decrypted'));
      expect(hasDecryptedKey).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache', () => {
      const newsletter: Newsletter = {
        id: '0x123',
        creator: '0xabc',
        title: 'Test Newsletter',
        description: 'Test Description',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xseal',
        createdAt: Date.now(),
        issueCount: 5,
      };

      const content: ContentSection[] = [
        {
          type: 'premium',
          content: 'Decrypted content',
          format: 'markdown',
        },
      ];

      cacheService.cacheNewsletter(newsletter);
      cacheService.cacheDecryptedContent('0xissue1', content);

      cacheService.clearAll();

      expect(cacheService.getNewsletter('0x123')).toBeNull();
      expect(cacheService.getDecryptedContent('0xissue1')).toBeNull();
    });

    it('should get cache statistics', () => {
      const newsletter: Newsletter = {
        id: '0x123',
        creator: '0xabc',
        title: 'Test Newsletter',
        description: 'Test Description',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xseal',
        createdAt: Date.now(),
        issueCount: 5,
      };

      const content: ContentSection[] = [
        {
          type: 'premium',
          content: 'Decrypted content',
          format: 'markdown',
        },
      ];

      cacheService.cacheNewsletter(newsletter);
      cacheService.cacheDecryptedContent('0xissue1', content);

      const stats = cacheService.getStats();

      expect(stats.localStorageEntries).toBeGreaterThan(0);
      expect(stats.memoryEntries).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should clear expired entries', () => {
      const newsletter: Newsletter = {
        id: '0x123',
        creator: '0xabc',
        title: 'Test Newsletter',
        description: 'Test Description',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xseal',
        createdAt: Date.now(),
        issueCount: 5,
      };

      // Cache with 1ms TTL
      cacheService.cacheNewsletter(newsletter, 1);

      // Wait for expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          cacheService.clearExpired();
          const cached = cacheService.getNewsletter('0x123');
          expect(cached).toBeNull();
          resolve();
        }, 10);
      });
    });
  });

  describe('Version Management', () => {
    it('should clear cache on version change', () => {
      const newsletter: Newsletter = {
        id: '0x123',
        creator: '0xabc',
        title: 'Test Newsletter',
        description: 'Test Description',
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
        sealPackageId: '0xseal',
        createdAt: Date.now(),
        issueCount: 5,
      };

      cacheService.cacheNewsletter(newsletter);

      // Simulate version change by creating new cache service
      // with different version in localStorage
      localStorage.setItem('newsletter_cache_version', '0.0.1');
      const newCacheService = new CacheService();

      const cached = newCacheService.getNewsletter('0x123');
      expect(cached).toBeNull();
    });
  });
});
