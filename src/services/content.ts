// Content processing layer for newsletter platform
// Implements content parsing, serialization, and boundary calculation
// Requirements: 2.5, 3.2

import { StoredContent, ContentBoundaries, Range } from '@/types';

export class ContentError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ContentError';
  }
}

export interface ContentSection {
  type: 'public' | 'premium';
  content: string;
  format?: 'markdown' | 'html' | 'plain';
}

/**
 * Split content into public and premium sections
 * Requirements: 2.5
 */
export function splitContent(sections: ContentSection[]): {
  publicSections: ContentSection[];
  premiumSections: ContentSection[];
} {
  if (!sections || sections.length === 0) {
    throw new ContentError('Content sections cannot be empty');
  }

  const publicSections = sections.filter((s) => s.type === 'public');
  const premiumSections = sections.filter((s) => s.type === 'premium');

  return { publicSections, premiumSections };
}

/**
 * Serialize content for Walrus storage
 * Converts structured content into a binary format
 * Requirements: 2.5
 */
export function serializeContent(sections: ContentSection[]): Uint8Array {
  if (!sections || sections.length === 0) {
    throw new ContentError('Content sections cannot be empty');
  }

  // Create StoredContent structure
  const storedContent: StoredContent = {
    version: 1,
    sections: [],
  };

  let currentOffset = 0;

  // Convert each section to binary format
  for (const section of sections) {
    const contentBytes = new TextEncoder().encode(section.content);
    const format = section.format || 'plain';

    storedContent.sections.push({
      type: section.type,
      content: contentBytes,
      metadata: {
        format,
        byteRange: {
          start: currentOffset,
          end: currentOffset + contentBytes.length,
        },
      },
    });

    currentOffset += contentBytes.length;
  }

  // Serialize to JSON then to bytes
  const jsonString = JSON.stringify({
    version: storedContent.version,
    sections: storedContent.sections.map((s) => ({
      type: s.type,
      content: Array.from(s.content),
      metadata: s.metadata,
    })),
  });

  return new TextEncoder().encode(jsonString);
}

/**
 * Deserialize content from Walrus storage
 * Converts binary format back to structured content
 * Requirements: 3.2
 */
export function deserializeContent(data: Uint8Array): StoredContent {
  if (!data || data.length === 0) {
    throw new ContentError('Cannot deserialize empty data');
  }

  try {
    const jsonString = new TextDecoder().decode(data);
    const parsed = JSON.parse(jsonString);

    if (!parsed.version || !parsed.sections) {
      throw new ContentError('Invalid content format: missing version or sections');
    }

    const storedContent: StoredContent = {
      version: parsed.version,
      sections: parsed.sections.map((s: any) => ({
        type: s.type,
        content: new Uint8Array(s.content),
        metadata: s.metadata,
      })),
    };

    return storedContent;
  } catch (error) {
    if (error instanceof ContentError) {
      throw error;
    }
    throw new ContentError('Failed to deserialize content', error);
  }
}

/**
 * Calculate content boundaries for public and encrypted sections
 * Requirements: 2.5
 */
export function calculateBoundaries(storedContent: StoredContent): ContentBoundaries {
  if (!storedContent || !storedContent.sections || storedContent.sections.length === 0) {
    throw new ContentError('Cannot calculate boundaries for empty content');
  }

  const publicRanges: Range[] = [];
  const encryptedRanges: Range[] = [];

  for (const section of storedContent.sections) {
    const range: Range = {
      start: section.metadata.byteRange.start,
      end: section.metadata.byteRange.end,
    };

    if (section.type === 'public') {
      publicRanges.push(range);
    } else if (section.type === 'premium') {
      encryptedRanges.push(range);
    }
  }

  return {
    publicRanges,
    encryptedRanges,
  };
}

/**
 * Extract public sections from stored content
 * Requirements: 3.2
 */
export function extractPublicContent(storedContent: StoredContent): ContentSection[] {
  if (!storedContent || !storedContent.sections) {
    throw new ContentError('Invalid stored content');
  }

  return storedContent.sections
    .filter((s) => s.type === 'public')
    .map((s) => ({
      type: s.type,
      content: new TextDecoder().decode(s.content),
      format: s.metadata.format,
    }));
}

/**
 * Extract premium sections from stored content
 * Requirements: 3.2
 */
export function extractPremiumContent(storedContent: StoredContent): ContentSection[] {
  if (!storedContent || !storedContent.sections) {
    throw new ContentError('Invalid stored content');
  }

  return storedContent.sections
    .filter((s) => s.type === 'premium')
    .map((s) => ({
      type: s.type,
      content: new TextDecoder().decode(s.content),
      format: s.metadata.format,
    }));
}

/**
 * Merge public and premium sections back into complete content
 */
export function mergeContent(
  publicSections: ContentSection[],
  premiumSections: ContentSection[]
): ContentSection[] {
  return [...publicSections, ...premiumSections];
}

/**
 * Validate content boundaries against stored content
 */
export function validateBoundaries(
  boundaries: ContentBoundaries,
  contentLength: number
): boolean {
  // Check that all ranges are within content bounds
  const allRanges = [...boundaries.publicRanges, ...boundaries.encryptedRanges];

  for (const range of allRanges) {
    if (range.start < 0 || range.end > contentLength || range.start >= range.end) {
      return false;
    }
  }

  // Check that ranges don't overlap
  const sortedRanges = allRanges.sort((a, b) => a.start - b.start);
  for (let i = 0; i < sortedRanges.length - 1; i++) {
    if (sortedRanges[i].end > sortedRanges[i + 1].start) {
      return false;
    }
  }

  return true;
}
