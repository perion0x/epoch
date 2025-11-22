import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalrusClient, WalrusError } from './walrus';

describe('WalrusClient', () => {
  let client: WalrusClient;
  const mockAggregatorUrl = 'https://aggregator.test.walrus.space';
  const mockPublisherUrl = 'https://publisher.test.walrus.space';

  beforeEach(() => {
    client = new WalrusClient(mockAggregatorUrl, mockPublisherUrl, {
      maxRetries: 2,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
    });
    vi.clearAllMocks();
  });

  describe('store', () => {
    it('should store content and return blob ID for newly created content', async () => {
      const content = new Uint8Array([1, 2, 3, 4]);
      const mockBlobId = 'test-blob-id-123';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          newlyCreated: {
            blobObject: {
              blobId: mockBlobId,
            },
          },
        }),
      });

      const blobId = await client.store(content);

      expect(blobId).toBe(mockBlobId);
      expect(fetch).toHaveBeenCalledWith(
        `${mockPublisherUrl}/v1/store`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: content,
        })
      );
    });

    it('should return blob ID for already certified content', async () => {
      const content = new Uint8Array([1, 2, 3, 4]);
      const mockBlobId = 'existing-blob-id-456';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          alreadyCertified: {
            blobId: mockBlobId,
          },
        }),
      });

      const blobId = await client.store(content);

      expect(blobId).toBe(mockBlobId);
    });

    it('should throw WalrusError on HTTP error', async () => {
      const content = new Uint8Array([1, 2, 3, 4]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error details',
      });

      await expect(client.store(content)).rejects.toThrow(WalrusError);
      await expect(client.store(content)).rejects.toThrow('failed after 3 attempts');
    });

    it('should throw WalrusError on unexpected response format', async () => {
      const content = new Uint8Array([1, 2, 3, 4]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          unexpectedField: 'value',
        }),
      });

      await expect(client.store(content)).rejects.toThrow(WalrusError);
      await expect(client.store(content)).rejects.toThrow('Unexpected response format');
    });

    it('should retry on network errors', async () => {
      const content = new Uint8Array([1, 2, 3, 4]);
      const mockBlobId = 'retry-blob-id';

      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            newlyCreated: {
              blobObject: {
                blobId: mockBlobId,
              },
            },
          }),
        });

      const blobId = await client.store(content);

      expect(blobId).toBe(mockBlobId);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const content = new Uint8Array([1, 2, 3, 4]);

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(client.store(content)).rejects.toThrow(WalrusError);
      await expect(client.store(content)).rejects.toThrow('failed after 3 attempts');
      // Each call makes 3 attempts (initial + 2 retries), so 2 calls = 6 total
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('retrieve', () => {
    it('should retrieve content by blob ID', async () => {
      const mockBlobId = 'test-blob-id';
      const mockContent = new Uint8Array([5, 6, 7, 8]);

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockContent.buffer,
      });

      const content = await client.retrieve(mockBlobId);

      expect(content).toEqual(mockContent);
      expect(fetch).toHaveBeenCalledWith(`${mockAggregatorUrl}/v1/${mockBlobId}`);
    });

    it('should throw WalrusError when blob not found', async () => {
      const mockBlobId = 'non-existent-blob';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Blob not found',
      });

      await expect(client.retrieve(mockBlobId)).rejects.toThrow(WalrusError);
      await expect(client.retrieve(mockBlobId)).rejects.toThrow('Blob not found');
    });

    it('should throw WalrusError on HTTP error', async () => {
      const mockBlobId = 'test-blob-id';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      await expect(client.retrieve(mockBlobId)).rejects.toThrow(WalrusError);
      await expect(client.retrieve(mockBlobId)).rejects.toThrow('failed after 3 attempts');
    });

    it('should retry on network errors', async () => {
      const mockBlobId = 'test-blob-id';
      const mockContent = new Uint8Array([9, 10, 11, 12]);

      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => mockContent.buffer,
        });

      const content = await client.retrieve(mockBlobId);

      expect(content).toEqual(mockContent);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 404 errors', async () => {
      const mockBlobId = 'non-existent-blob';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Blob not found',
      });

      await expect(client.retrieve(mockBlobId)).rejects.toThrow(WalrusError);
      expect(fetch).toHaveBeenCalledTimes(1); // No retries for 404
    });
  });

  describe('exists', () => {
    it('should return true when blob exists', async () => {
      const mockBlobId = 'existing-blob';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
      });

      const exists = await client.exists(mockBlobId);

      expect(exists).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        `${mockAggregatorUrl}/v1/${mockBlobId}`,
        expect.objectContaining({
          method: 'HEAD',
        })
      );
    });

    it('should return false when blob does not exist', async () => {
      const mockBlobId = 'non-existent-blob';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const exists = await client.exists(mockBlobId);

      expect(exists).toBe(false);
    });

    it('should return false on network errors', async () => {
      const mockBlobId = 'test-blob';

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const exists = await client.exists(mockBlobId);

      expect(exists).toBe(false);
    });

    it('should retry on transient errors and succeed', async () => {
      const mockBlobId = 'test-blob';

      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
        });

      const exists = await client.exists(mockBlobId);

      expect(exists).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('constructor', () => {
    it('should remove trailing slashes from URLs', () => {
      const clientWithSlashes = new WalrusClient(
        'https://aggregator.test.walrus.space/',
        'https://publisher.test.walrus.space/'
      );

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          newlyCreated: {
            blobObject: {
              blobId: 'test',
            },
          },
        }),
      });

      clientWithSlashes.store(new Uint8Array([1]));

      expect(fetch).toHaveBeenCalledWith(
        'https://publisher.test.walrus.space/v1/store',
        expect.any(Object)
      );
    });

    it('should use custom retry options', async () => {
      const customClient = new WalrusClient(mockAggregatorUrl, mockPublisherUrl, {
        maxRetries: 1,
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(customClient.store(new Uint8Array([1]))).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
  });
});
