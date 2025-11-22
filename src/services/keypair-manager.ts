/**
 * Keypair Manager Service
 * Manages temporary keypairs for wallet-less users
 * Implements Requirements 1.2, 1.5
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { toBase64, fromBase64 } from '@mysten/sui/utils';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { kv } from '@vercel/kv';

/**
 * User keypair stored in database
 */
export interface UserKeypair {
  userId: string;
  publicKey: string; // Base64 encoded
  encryptedPrivateKey: string; // Encrypted with platform key
  createdAt: number;
  lastUsed: number;
}

/**
 * Error codes for keypair operations
 */
export enum KeypairErrorCode {
  KEYPAIR_GENERATION_FAILED = 'KEYPAIR_GENERATION_FAILED',
  KEYPAIR_NOT_FOUND = 'KEYPAIR_NOT_FOUND',
  KEYPAIR_DECRYPTION_FAILED = 'KEYPAIR_DECRYPTION_FAILED',
  INVALID_USER_ID = 'INVALID_USER_ID',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  SIGNING_FAILED = 'SIGNING_FAILED',
}

/**
 * Keypair manager error class
 */
export class KeypairError extends Error {
  constructor(
    message: string,
    public readonly code: KeypairErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'KeypairError';
  }
}

/**
 * Keypair Manager Service
 * Handles generation, storage, and usage of temporary keypairs for wallet-less users
 */
export class KeypairManager {
  private platformKey: Buffer;
  private algorithm = 'aes-256-gcm' as const;
  private ivLength = 16;
  private authTagLength = 16;

  constructor(platformMasterKey: string) {
    // Derive 32-byte key from master key
    this.platformKey = scryptSync(platformMasterKey, 'salt', 32);
  }

  /**
   * Generate a new keypair for a user
   * Implements Requirement 1.2
   */
  async generateKeypair(userId: string): Promise<UserKeypair> {
    if (!userId || userId.trim().length === 0) {
      throw new KeypairError('User ID is required', KeypairErrorCode.INVALID_USER_ID);
    }

    try {
      // Generate new Ed25519 keypair
      const keypair = new Ed25519Keypair();

      // Get public key
      const publicKey = toBase64(keypair.getPublicKey().toRawBytes());

      // Get the Bech32 secret key string
      const secretKeyString = keypair.getSecretKey();
      
      console.log('🔑 Generated secret key (Bech32):', secretKeyString.substring(0, 20) + '...');
      
      // Encrypt the Bech32 string directly (it's already a portable format)
      const encryptedPrivateKey = this.encryptPrivateKey(Buffer.from(secretKeyString, 'utf-8'));

      const now = Date.now();

      const userKeypair: UserKeypair = {
        userId,
        publicKey,
        encryptedPrivateKey,
        createdAt: now,
        lastUsed: now,
      };

      // Store in memory for testing
      await this.storeKeypair(userKeypair);

      return userKeypair;
    } catch (error) {
      console.error('❌ Keypair generation error:', error);
      throw new KeypairError(
        'Failed to generate keypair',
        KeypairErrorCode.KEYPAIR_GENERATION_FAILED,
        error
      );
    }
  }

  /**
   * Get keypair for a user
   * Implements Requirement 1.5
   */
  async getKeypair(userId: string): Promise<UserKeypair | null> {
    if (!userId || userId.trim().length === 0) {
      throw new KeypairError('User ID is required', KeypairErrorCode.INVALID_USER_ID);
    }

    try {
      // TODO: Query from database
      const keypair = await this.fetchKeypair(userId);

      if (keypair) {
        // Update last used timestamp
        await this.updateLastUsed(userId);
      }

      return keypair;
    } catch (error) {
      throw new KeypairError(
        'Failed to get keypair',
        KeypairErrorCode.KEYPAIR_NOT_FOUND,
        error
      );
    }
  }

  /**
   * Get or create keypair for a user
   */
  async getOrCreateKeypair(userId: string): Promise<UserKeypair> {
    const existing = await this.getKeypair(userId);
    if (existing) {
      return existing;
    }
    return await this.generateKeypair(userId);
  }

  /**
   * Sign a transaction with user's keypair
   */
  async signTransaction(userId: string, txBytes: Uint8Array): Promise<Uint8Array> {
    try {
      // Get user's keypair
      const userKeypair = await this.getKeypair(userId);
      if (!userKeypair) {
        throw new KeypairError('Keypair not found for user', KeypairErrorCode.KEYPAIR_NOT_FOUND);
      }

      // Decrypt private key (Bech32 string)
      const privateKeyBytes = this.decryptPrivateKey(userKeypair.encryptedPrivateKey);
      const secretKeyString = Buffer.from(privateKeyBytes).toString('utf-8');
      
      console.log('🔓 Decrypted secret key (Bech32):', secretKeyString.substring(0, 20) + '...');

      // Reconstruct keypair from the Bech32 secret key string
      const keypair = Ed25519Keypair.fromSecretKey(secretKeyString);

      // Sign transaction
      const signature = await keypair.signTransaction(txBytes);

      return signature.signature;
    } catch (error) {
      console.error('❌ Signing error:', error);
      if (error instanceof KeypairError) {
        throw error;
      }
      throw new KeypairError('Failed to sign transaction', KeypairErrorCode.SIGNING_FAILED, error);
    }
  }

  /**
   * Get Sui address for a user
   */
  async getUserAddress(userId: string): Promise<string> {
    const userKeypair = await this.getKeypair(userId);
    if (!userKeypair) {
      throw new KeypairError('Keypair not found for user', KeypairErrorCode.KEYPAIR_NOT_FOUND);
    }

    // Reconstruct public key from base64 and get address
    const publicKeyBytes = fromBase64(userKeypair.publicKey);
    const publicKey = new Ed25519PublicKey(publicKeyBytes);
    return publicKey.toSuiAddress();
  }

  /**
   * Delete keypair for a user
   */
  async deleteKeypair(userId: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new KeypairError('User ID is required', KeypairErrorCode.INVALID_USER_ID);
    }

    try {
      // TODO: Delete from database
      await this.removeKeypair(userId);
    } catch (error) {
      throw new KeypairError(
        'Failed to delete keypair',
        KeypairErrorCode.KEYPAIR_NOT_FOUND,
        error
      );
    }
  }

  /**
   * Encrypt private key with platform key
   * @private
   */
  private encryptPrivateKey(privateKeyBytes: Uint8Array): string {
    try {
      // Generate random IV
      const iv = randomBytes(this.ivLength);

      // Create cipher
      const cipher = createCipheriv(this.algorithm, this.platformKey, iv) as any;

      // Encrypt
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(privateKeyBytes)),
        cipher.final(),
      ]);

      // Get auth tag
      const authTag = cipher.getAuthTag() as Buffer;

      // Combine IV + encrypted data + auth tag
      const combined = Buffer.concat([iv, encrypted, authTag]);

      // Return as base64
      return combined.toString('base64');
    } catch (error) {
      throw new KeypairError(
        'Failed to encrypt private key',
        KeypairErrorCode.ENCRYPTION_FAILED,
        error
      );
    }
  }

  /**
   * Decrypt private key with platform key
   * @private
   */
  private decryptPrivateKey(encryptedPrivateKey: string): Uint8Array {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedPrivateKey, 'base64');

      // Extract IV, encrypted data, and auth tag
      const iv = combined.subarray(0, this.ivLength);
      const authTag = combined.subarray(combined.length - this.authTagLength);
      const encrypted = combined.subarray(this.ivLength, combined.length - this.authTagLength);

      // Create decipher
      const decipher = createDecipheriv(this.algorithm, this.platformKey, iv) as any;
      decipher.setAuthTag(authTag);

      // Decrypt
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

      return new Uint8Array(decrypted);
    } catch (error) {
      throw new KeypairError(
        'Failed to decrypt private key',
        KeypairErrorCode.KEYPAIR_DECRYPTION_FAILED,
        error
      );
    }
  }

  /**
   * Store keypair in database
   * @private
   */
  private async storeKeypair(keypair: UserKeypair): Promise<void> {
    const key = `keypair:${keypair.userId}`;
    await kv.set(key, keypair, { ex: 60 * 60 * 24 * 30 }); // 30 days expiry
    console.log('💾 Storing keypair for user:', keypair.userId);
  }

  /**
   * Fetch keypair from Vercel KV
   * @private
   */
  private async fetchKeypair(userId: string): Promise<UserKeypair | null> {
    const key = `keypair:${userId}`;
    const keypair = await kv.get<UserKeypair>(key);
    console.log('🔍 Fetching keypair for user:', userId, keypair ? '✅ Found' : '❌ Not found');
    return keypair;
  }

  /**
   * Update last used timestamp
   * @private
   */
  private async updateLastUsed(userId: string): Promise<void> {
    const key = `keypair:${userId}`;
    const keypair = await kv.get<UserKeypair>(key);
    if (keypair) {
      keypair.lastUsed = Date.now();
      await kv.set(key, keypair, { ex: 60 * 60 * 24 * 30 }); // 30 days expiry
    }
    console.log('⏰ Updating last used for user:', userId);
  }

  /**
   * Remove keypair from Vercel KV
   * @private
   */
  private async removeKeypair(userId: string): Promise<void> {
    const key = `keypair:${userId}`;
    await kv.del(key);
    console.log('🗑️ Removing keypair for user:', userId);
  }
}
