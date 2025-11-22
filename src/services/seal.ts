// Seal SDK integration for decentralized secrets management
// Implements encryption/decryption with threshold cryptography
//
// Usage example:
//
// const sealClient = new SealClient('https://seal-testnet.sui.io');
//
// // Encrypt premium content
// const { encryptedObject, key } = await sealClient.encrypt({
//   threshold: 2,
//   packageId: '0x123...',
//   id: 'newsletter_id:issue_id',
//   data: premiumContent
// });
//
// // Create session key for decryption
// const sessionKey = await sealClient.createSessionKey({
//   address: userAddress,
//   packageId: '0x123...',
//   ttlMin: 10
// });
//
// // Decrypt premium content
// const decryptedContent = await sealClient.decrypt({
//   data: encryptedObject,
//   sessionKey,
//   txBytes: approvalTxBytes
// });

export interface SessionKey {
  key: Uint8Array;
  expiresAt: number;
}

export interface EncryptParams {
  threshold: number;
  packageId: string;
  id: string;
  data: Uint8Array;
}

export interface DecryptParams {
  data: Uint8Array;
  sessionKey: SessionKey;
  txBytes: Uint8Array;
}

export interface CreateSessionKeyParams {
  address: string;
  packageId: string;
  ttlMin: number;
}

import { NewsletterError, ErrorCode, ErrorSeverity } from './errors';

export class SealError extends NewsletterError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, ErrorCode.SEAL_ERROR, {
      severity: ErrorSeverity.HIGH,
      retryable: code !== 'INVALID_THRESHOLD' && code !== 'INVALID_PACKAGE_ID',
      cause,
      context: { sealCode: code },
    });
    this.name = 'SealError';
  }
}

export class SealClient {
  private keyServerUrl: string;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(
    keyServerUrl: string,
    options: { maxRetries?: number; retryDelayMs?: number } = {}
  ) {
    this.keyServerUrl = keyServerUrl;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 1000;
  }

  /**
   * Encrypt content using Seal's threshold encryption
   * Requirements: 2.2, 2.3
   */
  async encrypt(params: EncryptParams): Promise<{
    encryptedObject: Uint8Array;
    key: Uint8Array;
  }> {
    const { threshold, packageId, id, data } = params;

    // Validate parameters
    if (threshold < 1) {
      throw new SealError(
        'Threshold must be at least 1',
        'INVALID_THRESHOLD'
      );
    }

    if (!packageId || packageId.length === 0) {
      throw new SealError(
        'Package ID is required',
        'INVALID_PACKAGE_ID'
      );
    }

    if (!id || id.length === 0) {
      throw new SealError(
        'Identity is required',
        'INVALID_IDENTITY'
      );
    }

    if (!data || data.length === 0) {
      throw new SealError(
        'Data to encrypt cannot be empty',
        'INVALID_DATA'
      );
    }

    return this.withRetry(async () => {
      try {
        // Call Seal key server to encrypt data
        const response = await fetch(`${this.keyServerUrl}/encrypt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threshold,
            package_id: packageId,
            identity: id,
            data: Array.from(data),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new SealError(
            `Encryption failed: ${response.status} ${errorText}`,
            'ENCRYPTION_FAILED'
          );
        }

        const result = await response.json();

        return {
          encryptedObject: new Uint8Array(result.encrypted_object),
          key: new Uint8Array(result.key),
        };
      } catch (error) {
        if (error instanceof SealError) {
          throw error;
        }
        throw new SealError(
          'Failed to encrypt content',
          'ENCRYPTION_FAILED',
          error as Error
        );
      }
    }, 'encrypt');
  }

  /**
   * Decrypt content using Seal session key
   * Requirements: 4.3, 4.4
   */
  async decrypt(params: DecryptParams): Promise<Uint8Array> {
    const { data, sessionKey, txBytes } = params;

    // Validate parameters
    if (!data || data.length === 0) {
      throw new SealError(
        'Data to decrypt cannot be empty',
        'INVALID_DATA'
      );
    }

    if (!sessionKey || !sessionKey.key || sessionKey.key.length === 0) {
      throw new SealError(
        'Session key is required',
        'INVALID_SESSION_KEY'
      );
    }

    // Check if session key is expired
    if (Date.now() > sessionKey.expiresAt) {
      throw new SealError(
        'Session key has expired',
        'SESSION_KEY_EXPIRED'
      );
    }

    if (!txBytes || txBytes.length === 0) {
      throw new SealError(
        'Transaction bytes are required',
        'INVALID_TX_BYTES'
      );
    }

    return this.withRetry(async () => {
      try {
        // Call Seal key server to decrypt data
        const response = await fetch(`${this.keyServerUrl}/decrypt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: Array.from(data),
            session_key: Array.from(sessionKey.key),
            tx_bytes: Array.from(txBytes),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new SealError(
            `Decryption failed: ${response.status} ${errorText}`,
            'DECRYPTION_FAILED'
          );
        }

        const result = await response.json();
        return new Uint8Array(result.decrypted_data);
      } catch (error) {
        if (error instanceof SealError) {
          throw error;
        }
        throw new SealError(
          'Failed to decrypt content',
          'DECRYPTION_FAILED',
          error as Error
        );
      }
    }, 'decrypt');
  }

  /**
   * Create a session key for accessing encrypted content
   * Requirements: 4.3
   */
  async createSessionKey(params: CreateSessionKeyParams): Promise<SessionKey> {
    const { address, packageId, ttlMin } = params;

    // Validate parameters
    if (!address || address.length === 0) {
      throw new SealError(
        'Address is required',
        'INVALID_ADDRESS'
      );
    }

    if (!packageId || packageId.length === 0) {
      throw new SealError(
        'Package ID is required',
        'INVALID_PACKAGE_ID'
      );
    }

    if (ttlMin < 1) {
      throw new SealError(
        'TTL must be at least 1 minute',
        'INVALID_TTL'
      );
    }

    return this.withRetry(async () => {
      try {
        // Call Seal key server to create session key
        const response = await fetch(`${this.keyServerUrl}/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            package_id: packageId,
            ttl_min: ttlMin,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new SealError(
            `Session key creation failed: ${response.status} ${errorText}`,
            'SESSION_KEY_CREATION_FAILED'
          );
        }

        const result = await response.json();
        const expiresAt = Date.now() + ttlMin * 60 * 1000;

        return {
          key: new Uint8Array(result.session_key),
          expiresAt,
        };
      } catch (error) {
        if (error instanceof SealError) {
          throw error;
        }
        throw new SealError(
          'Failed to create session key',
          'SESSION_KEY_CREATION_FAILED',
          error as Error
        );
      }
    }, 'createSessionKey');
  }

  /**
   * Retry logic with exponential backoff for handling key server unavailability
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on validation errors
        if (error instanceof SealError) {
          const nonRetryableCodes = [
            'INVALID_THRESHOLD',
            'INVALID_PACKAGE_ID',
            'INVALID_IDENTITY',
            'INVALID_DATA',
            'INVALID_SESSION_KEY',
            'SESSION_KEY_EXPIRED',
            'INVALID_TX_BYTES',
            'INVALID_ADDRESS',
            'INVALID_TTL',
          ];

          if (nonRetryableCodes.includes(error.code)) {
            throw error;
          }
        }

        // If this was the last attempt, throw the error
        if (attempt === this.maxRetries) {
          break;
        }

        // Calculate exponential backoff delay
        const delay = this.retryDelayMs * Math.pow(2, attempt);
        
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries exhausted
    throw new SealError(
      `${operationName} failed after ${this.maxRetries + 1} attempts`,
      'KEY_SERVER_UNAVAILABLE',
      lastError
    );
  }

  /**
   * Check if the key server is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.keyServerUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
