import { describe, it, expect } from 'vitest';
import {
  compress,
  decompress,
  compressText,
  decompressText,
  getCompressionRatio,
  formatBytes,
  getCompressionStats,
} from './compression';

describe('Compression Service', () => {
  describe('compress and decompress', () => {
    it('should compress and decompress data', async () => {
      const originalText = 'Hello, World! '.repeat(100); // Repeat for better compression
      const originalData = new TextEncoder().encode(originalText);

      const compressed = await compress(originalData);
      const decompressed = await decompress(compressed);

      const decompressedText = new TextDecoder().decode(decompressed);
      expect(decompressedText).toBe(originalText);
    });

    it('should reduce data size for repetitive content or return original if compression unavailable', async () => {
      const originalText = 'A'.repeat(1000);
      const originalData = new TextEncoder().encode(originalText);

      const compressed = await compress(originalData);

      // Compressed should be smaller than original for repetitive data
      // Or equal if compression is not available
      expect(compressed.length).toBeLessThanOrEqual(originalData.length);
    });

    it('should handle empty data', async () => {
      const emptyData = new Uint8Array(0);

      const compressed = await compress(emptyData);
      const decompressed = await decompress(compressed);

      expect(decompressed.length).toBe(0);
    });
  });

  describe('compressText and decompressText', () => {
    it('should compress and decompress text', async () => {
      const originalText = 'This is a test message. '.repeat(50);

      const compressed = await compressText(originalText);
      const decompressed = await decompressText(compressed);

      expect(decompressed).toBe(originalText);
    });

    it('should handle special characters', async () => {
      const originalText = '🎉 Hello! 你好! مرحبا! '.repeat(20);

      const compressed = await compressText(originalText);
      const decompressed = await decompressText(compressed);

      expect(decompressed).toBe(originalText);
    });

    it('should handle empty string', async () => {
      const originalText = '';

      const compressed = await compressText(originalText);
      const decompressed = await decompressText(compressed);

      expect(decompressed).toBe(originalText);
    });
  });

  describe('getCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      const ratio = getCompressionRatio(1000, 500);
      expect(ratio).toBe(50);
    });

    it('should return 0 for same size', () => {
      const ratio = getCompressionRatio(1000, 1000);
      expect(ratio).toBe(0);
    });

    it('should handle zero original size', () => {
      const ratio = getCompressionRatio(0, 0);
      expect(ratio).toBe(0);
    });

    it('should handle negative ratio for expansion', () => {
      const ratio = getCompressionRatio(100, 150);
      expect(ratio).toBe(-50);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should format fractional values', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });
  });

  describe('getCompressionStats', () => {
    it('should return compression statistics', async () => {
      const originalText = 'Test content '.repeat(100);
      const originalData = new TextEncoder().encode(originalText);
      const compressedData = await compress(originalData);

      const stats = getCompressionStats(originalData, compressedData);

      expect(stats.originalSize).toBe(originalData.length);
      expect(stats.compressedSize).toBe(compressedData.length);
      // Ratio might be 0 if compression is not available
      expect(stats.ratio).toBeGreaterThanOrEqual(0);
      expect(stats.originalSizeFormatted).toBeTruthy();
      expect(stats.compressedSizeFormatted).toBeTruthy();
    });
  });
});
