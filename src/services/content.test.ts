// Tests for content processing layer
// Requirements: 2.5, 3.2

import { describe, it, expect } from 'vitest';
import {
  splitContent,
  serializeContent,
  deserializeContent,
  calculateBoundaries,
  extractPublicContent,
  extractPremiumContent,
  mergeContent,
  validateBoundaries,
  ContentError,
  ContentSection,
} from './content';
import { StoredContent } from '@/types';

describe('Content Processing', () => {
  describe('splitContent', () => {
    it('should split content into public and premium sections', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Public intro', format: 'plain' },
        { type: 'premium', content: 'Premium content', format: 'plain' },
        { type: 'public', content: 'Public outro', format: 'plain' },
      ];

      const result = splitContent(sections);

      expect(result.publicSections).toHaveLength(2);
      expect(result.premiumSections).toHaveLength(1);
      expect(result.publicSections[0].content).toBe('Public intro');
      expect(result.premiumSections[0].content).toBe('Premium content');
    });

    it('should handle all public sections', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Section 1', format: 'plain' },
        { type: 'public', content: 'Section 2', format: 'plain' },
      ];

      const result = splitContent(sections);

      expect(result.publicSections).toHaveLength(2);
      expect(result.premiumSections).toHaveLength(0);
    });

    it('should handle all premium sections', () => {
      const sections: ContentSection[] = [
        { type: 'premium', content: 'Premium 1', format: 'plain' },
        { type: 'premium', content: 'Premium 2', format: 'plain' },
      ];

      const result = splitContent(sections);

      expect(result.publicSections).toHaveLength(0);
      expect(result.premiumSections).toHaveLength(2);
    });

    it('should throw error for empty sections', () => {
      expect(() => splitContent([])).toThrow(ContentError);
      expect(() => splitContent([])).toThrow('Content sections cannot be empty');
    });
  });

  describe('serializeContent and deserializeContent', () => {
    it('should serialize and deserialize content correctly', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Hello world', format: 'plain' },
        { type: 'premium', content: 'Secret content', format: 'markdown' },
      ];

      const serialized = serializeContent(sections);
      expect(serialized).toBeInstanceOf(Uint8Array);
      expect(serialized.length).toBeGreaterThan(0);

      const deserialized = deserializeContent(serialized);
      expect(deserialized.version).toBe(1);
      expect(deserialized.sections).toHaveLength(2);
      expect(deserialized.sections[0].type).toBe('public');
      expect(deserialized.sections[1].type).toBe('premium');

      // Verify content is preserved
      const content0 = new TextDecoder().decode(deserialized.sections[0].content);
      const content1 = new TextDecoder().decode(deserialized.sections[1].content);
      expect(content0).toBe('Hello world');
      expect(content1).toBe('Secret content');
    });

    it('should preserve format metadata', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: '# Title', format: 'markdown' },
        { type: 'premium', content: '<p>HTML</p>', format: 'html' },
      ];

      const serialized = serializeContent(sections);
      const deserialized = deserializeContent(serialized);

      expect(deserialized.sections[0].metadata.format).toBe('markdown');
      expect(deserialized.sections[1].metadata.format).toBe('html');
    });

    it('should default to plain format when not specified', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Plain text' },
      ];

      const serialized = serializeContent(sections);
      const deserialized = deserializeContent(serialized);

      expect(deserialized.sections[0].metadata.format).toBe('plain');
    });

    it('should throw error for empty content during serialization', () => {
      expect(() => serializeContent([])).toThrow(ContentError);
    });

    it('should throw error for empty data during deserialization', () => {
      expect(() => deserializeContent(new Uint8Array())).toThrow(ContentError);
    });

    it('should throw error for invalid JSON during deserialization', () => {
      const invalidData = new TextEncoder().encode('not valid json');
      expect(() => deserializeContent(invalidData)).toThrow(ContentError);
    });

    it('should throw error for missing version in deserialization', () => {
      const invalidData = new TextEncoder().encode(JSON.stringify({ sections: [] }));
      expect(() => deserializeContent(invalidData)).toThrow('Invalid content format');
    });
  });

  describe('calculateBoundaries', () => {
    it('should calculate boundaries for mixed content', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Public intro' },
        { type: 'premium', content: 'Premium content' },
      ];

      const serialized = serializeContent(sections);
      const storedContent = deserializeContent(serialized);
      const boundaries = calculateBoundaries(storedContent);

      expect(boundaries.publicRanges).toHaveLength(1);
      expect(boundaries.encryptedRanges).toHaveLength(1);

      // Verify ranges are non-overlapping and sequential
      expect(boundaries.publicRanges[0].start).toBe(0);
      expect(boundaries.publicRanges[0].end).toBeGreaterThan(0);
      expect(boundaries.encryptedRanges[0].start).toBeGreaterThan(0);
      expect(boundaries.encryptedRanges[0].end).toBeGreaterThan(boundaries.encryptedRanges[0].start);
    });

    it('should handle all public content', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Section 1' },
        { type: 'public', content: 'Section 2' },
      ];

      const serialized = serializeContent(sections);
      const storedContent = deserializeContent(serialized);
      const boundaries = calculateBoundaries(storedContent);

      expect(boundaries.publicRanges).toHaveLength(2);
      expect(boundaries.encryptedRanges).toHaveLength(0);
    });

    it('should handle all premium content', () => {
      const sections: ContentSection[] = [
        { type: 'premium', content: 'Premium 1' },
        { type: 'premium', content: 'Premium 2' },
      ];

      const serialized = serializeContent(sections);
      const storedContent = deserializeContent(serialized);
      const boundaries = calculateBoundaries(storedContent);

      expect(boundaries.publicRanges).toHaveLength(0);
      expect(boundaries.encryptedRanges).toHaveLength(2);
    });

    it('should throw error for empty content', () => {
      const emptyContent: StoredContent = { version: 1, sections: [] };
      expect(() => calculateBoundaries(emptyContent)).toThrow(ContentError);
    });
  });

  describe('extractPublicContent', () => {
    it('should extract only public sections', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Public 1', format: 'plain' },
        { type: 'premium', content: 'Premium 1', format: 'plain' },
        { type: 'public', content: 'Public 2', format: 'markdown' },
      ];

      const serialized = serializeContent(sections);
      const storedContent = deserializeContent(serialized);
      const publicSections = extractPublicContent(storedContent);

      expect(publicSections).toHaveLength(2);
      expect(publicSections[0].content).toBe('Public 1');
      expect(publicSections[1].content).toBe('Public 2');
      expect(publicSections[0].type).toBe('public');
      expect(publicSections[1].type).toBe('public');
    });

    it('should return empty array when no public sections exist', () => {
      const sections: ContentSection[] = [
        { type: 'premium', content: 'Premium only' },
      ];

      const serialized = serializeContent(sections);
      const storedContent = deserializeContent(serialized);
      const publicSections = extractPublicContent(storedContent);

      expect(publicSections).toHaveLength(0);
    });

    it('should throw error for invalid content', () => {
      expect(() => extractPublicContent({} as StoredContent)).toThrow(ContentError);
    });
  });

  describe('extractPremiumContent', () => {
    it('should extract only premium sections', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Public 1', format: 'plain' },
        { type: 'premium', content: 'Premium 1', format: 'plain' },
        { type: 'premium', content: 'Premium 2', format: 'html' },
      ];

      const serialized = serializeContent(sections);
      const storedContent = deserializeContent(serialized);
      const premiumSections = extractPremiumContent(storedContent);

      expect(premiumSections).toHaveLength(2);
      expect(premiumSections[0].content).toBe('Premium 1');
      expect(premiumSections[1].content).toBe('Premium 2');
      expect(premiumSections[0].type).toBe('premium');
      expect(premiumSections[1].type).toBe('premium');
    });

    it('should return empty array when no premium sections exist', () => {
      const sections: ContentSection[] = [
        { type: 'public', content: 'Public only' },
      ];

      const serialized = serializeContent(sections);
      const storedContent = deserializeContent(serialized);
      const premiumSections = extractPremiumContent(storedContent);

      expect(premiumSections).toHaveLength(0);
    });

    it('should throw error for invalid content', () => {
      expect(() => extractPremiumContent({} as StoredContent)).toThrow(ContentError);
    });
  });

  describe('mergeContent', () => {
    it('should merge public and premium sections', () => {
      const publicSections: ContentSection[] = [
        { type: 'public', content: 'Public 1' },
        { type: 'public', content: 'Public 2' },
      ];

      const premiumSections: ContentSection[] = [
        { type: 'premium', content: 'Premium 1' },
      ];

      const merged = mergeContent(publicSections, premiumSections);

      expect(merged).toHaveLength(3);
      expect(merged[0].type).toBe('public');
      expect(merged[1].type).toBe('public');
      expect(merged[2].type).toBe('premium');
    });

    it('should handle empty premium sections', () => {
      const publicSections: ContentSection[] = [
        { type: 'public', content: 'Public only' },
      ];

      const merged = mergeContent(publicSections, []);

      expect(merged).toHaveLength(1);
      expect(merged[0].type).toBe('public');
    });

    it('should handle empty public sections', () => {
      const premiumSections: ContentSection[] = [
        { type: 'premium', content: 'Premium only' },
      ];

      const merged = mergeContent([], premiumSections);

      expect(merged).toHaveLength(1);
      expect(merged[0].type).toBe('premium');
    });
  });

  describe('validateBoundaries', () => {
    it('should validate correct boundaries', () => {
      const boundaries = {
        publicRanges: [{ start: 0, end: 10 }],
        encryptedRanges: [{ start: 10, end: 20 }],
      };

      expect(validateBoundaries(boundaries, 20)).toBe(true);
    });

    it('should reject boundaries exceeding content length', () => {
      const boundaries = {
        publicRanges: [{ start: 0, end: 30 }],
        encryptedRanges: [],
      };

      expect(validateBoundaries(boundaries, 20)).toBe(false);
    });

    it('should reject negative start positions', () => {
      const boundaries = {
        publicRanges: [{ start: -5, end: 10 }],
        encryptedRanges: [],
      };

      expect(validateBoundaries(boundaries, 20)).toBe(false);
    });

    it('should reject ranges where start >= end', () => {
      const boundaries = {
        publicRanges: [{ start: 10, end: 10 }],
        encryptedRanges: [],
      };

      expect(validateBoundaries(boundaries, 20)).toBe(false);
    });

    it('should reject overlapping ranges', () => {
      const boundaries = {
        publicRanges: [{ start: 0, end: 15 }],
        encryptedRanges: [{ start: 10, end: 20 }],
      };

      expect(validateBoundaries(boundaries, 20)).toBe(false);
    });

    it('should accept adjacent non-overlapping ranges', () => {
      const boundaries = {
        publicRanges: [{ start: 0, end: 10 }, { start: 20, end: 30 }],
        encryptedRanges: [{ start: 10, end: 20 }],
      };

      expect(validateBoundaries(boundaries, 30)).toBe(true);
    });
  });
});
