// Walrus client implementation for decentralized storage
// Implements Requirements 2.1, 3.1, 8.3

import { BlobId } from '@/types';

import { NewsletterError, ErrorCode, ErrorSeverity, retryWithBackoff } from './errors';

export class WalrusError extends NewsletterError {
  constructor(message: string, cause?: Error) {
    super(message, ErrorCode.WALRUS_ERROR, {
      severity: ErrorSeverity.HIGH,
      retryable: true,
      cause,
    });
    this.name = 'WalrusError';
  }
}

interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

export class WalrusClient {
  private aggregatorUrl: string;
  private publisherUrl: string;
  private retryOptions: RetryOptions;

  constructor(
    aggregatorUrl: string,
    publisherUrl: string,
    retryOptions: Partial<RetryOptions> = {}
  ) {
    this.aggregatorUrl = aggregatorUrl.replace(/\/$/, ''); // Remove trailing slash
    this.publisherUrl = publisherUrl.replace(/\/$/, '');
    this.retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  }

  /**
   * Store content on Walrus with retry logic
   * Implements Requirements 2.1, 8.3
   */
  async store(content: Uint8Array): Promise<BlobId> {
    return this.withRetry(async () => {
      try {
        const url = `${this.publisherUrl}/v1/blobs?epochs=5`;
        console.log(`📡 Walrus store URL: ${url}`);
        console.log(`📦 Content size: ${content.length} bytes`);
        
        // Walrus requires epochs parameter - store for 5 epochs (~1 day on testnet)
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: content as BodyInit,
        });

        console.log(`📊 Walrus response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(`❌ Walrus error response: ${errorText}`);
          throw new WalrusError(
            `Failed to store content on Walrus: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const result = await response.json();
        
        // Walrus returns different response formats depending on whether content is new or already exists
        if (result.newlyCreated) {
          return result.newlyCreated.blobObject.blobId as BlobId;
        } else if (result.alreadyCertified) {
          return result.alreadyCertified.blobId as BlobId;
        } else {
          throw new WalrusError('Unexpected response format from Walrus store API');
        }
      } catch (error) {
        if (error instanceof WalrusError) {
          throw error;
        }
        throw new WalrusError('Network error while storing content on Walrus', error);
      }
    }, 'store');
  }

  /**
   * Retrieve content from Walrus with retry logic
   * Implements Requirements 3.1, 8.3
   */
  async retrieve(blobId: BlobId): Promise<Uint8Array> {
    return this.withRetry(async () => {
      try {
        const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`);

        if (response.status === 404) {
          const error = new WalrusError(`Blob not found: ${blobId}`);
          // Mark as non-retryable by adding a flag
          (error as any).noRetry = true;
          throw error;
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new WalrusError(
            `Failed to retrieve content from Walrus: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      } catch (error) {
        if (error instanceof WalrusError) {
          throw error;
        }
        throw new WalrusError('Network error while retrieving content from Walrus', error);
      }
    }, 'retrieve');
  }

  /**
   * Check if a blob exists on Walrus
   * Implements Requirements 8.3
   */
  async exists(blobId: BlobId): Promise<boolean> {
    try {
      return await this.withRetry(async () => {
        const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`, {
          method: 'HEAD',
        });

        return response.ok;
      }, 'exists');
    } catch (error) {
      // Network errors during existence check should return false
      // rather than throwing, as the blob effectively doesn't exist
      // if we can't reach the network
      return false;
    }
  }

  /**
   * Execute an operation with exponential backoff retry logic
   * Handles Walrus node failures gracefully
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;
    let delay = this.retryOptions.initialDelayMs;

    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain errors
        if (error instanceof WalrusError) {
          // Check for non-retryable flag
          if ((error as any).noRetry) {
            throw error;
          }
          // Don't retry 404s, client errors, or unexpected format errors
          if (
            error.message.includes('not found') ||
            error.message.includes('400') ||
            error.message.includes('Unexpected response format')
          ) {
            throw error;
          }
        }

        // If this was the last attempt, throw the error
        if (attempt === this.retryOptions.maxRetries) {
          break;
        }

        // Wait before retrying with exponential backoff
        await this.sleep(delay);
        delay = Math.min(
          delay * this.retryOptions.backoffMultiplier,
          this.retryOptions.maxDelayMs
        );
      }
    }

    throw new WalrusError(
      `Operation '${operationName}' failed after ${this.retryOptions.maxRetries + 1} attempts`,
      lastError
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
