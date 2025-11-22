/**
 * Gas Station Service
 * Handles transaction sponsorship for gasless newsletter operations
 * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64, decodeSuiPrivateKey } from '@mysten/sui/cryptography';

/**
 * Configuration for Gas Station service
 */
export interface GasStationConfig {
  sponsorPrivateKey: string; // Base64 encoded private key
  suiRpcUrl: string;
  maxGasPerTransaction: number; // Maximum gas budget per transaction
  dailyGasLimit: number; // Maximum total gas per day
  allowedTransactionTypes: TransactionType[];
}

/**
 * Allowed transaction types for sponsorship
 */
export enum TransactionType {
  CREATE_NEWSLETTER = 'create_newsletter',
  PUBLISH_ISSUE = 'publish_issue',
  MINT_NFT = 'mint_nft',
}

/**
 * Request to sponsor a transaction
 */
export interface SponsorshipRequest {
  transactionBytes: Uint8Array;
  userAddress: string;
  userSignature: Uint8Array;
  transactionType: TransactionType;
}

/**
 * Response after sponsoring a transaction
 */
export interface SponsorshipResponse {
  sponsoredTxBytes: Uint8Array;
  gasUsed: number;
  transactionDigest: string;
  status: 'success' | 'failed';
}

/**
 * Gas cost report for a time period
 */
export interface GasCostReport {
  period: 'daily' | 'weekly' | 'monthly';
  totalTransactions: number;
  totalGasUsed: number;
  totalCostSUI: number;
  breakdown: {
    [key in TransactionType]: {
      count: number;
      gasUsed: number;
    };
  };
}

/**
 * Error codes for Gas Station operations
 */
export enum GasStationErrorCode {
  INVALID_TRANSACTION_TYPE = 'INVALID_TRANSACTION_TYPE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  GAS_LIMIT_EXCEEDED = 'GAS_LIMIT_EXCEEDED',
  SPONSORSHIP_REJECTED = 'SPONSORSHIP_REJECTED',
  SPONSOR_WALLET_UNAVAILABLE = 'SPONSOR_WALLET_UNAVAILABLE',
  TRANSACTION_BUILD_FAILED = 'TRANSACTION_BUILD_FAILED',
  TRANSACTION_SUBMISSION_FAILED = 'TRANSACTION_SUBMISSION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

/**
 * Gas Station error class
 */
export class GasStationError extends Error {
  constructor(
    message: string,
    public readonly code: GasStationErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GasStationError';
  }
}

/**
 * Gas Station Service
 * Sponsors transactions for gasless newsletter operations
 */
export class GasStationService {
  private suiClient: SuiClient;
  private sponsorKeypair: Ed25519Keypair;
  private config: GasStationConfig;
  private dailyGasUsed: number = 0;
  private lastResetDate: string;

  constructor(config: GasStationConfig) {
    this.config = config;
    
    // Initialize Sui client
    this.suiClient = new SuiClient({ url: config.suiRpcUrl });
    
    // Load sponsor wallet from private key
    try {
      // Decode the Sui private key (handles suiprivkey1... format)
      const { schema, secretKey } = decodeSuiPrivateKey(config.sponsorPrivateKey);
      
      if (schema !== 'ED25519') {
        throw new Error('Only ED25519 keys are supported');
      }
      
      // Create keypair from the decoded secret key
      this.sponsorKeypair = Ed25519Keypair.fromSecretKey(secretKey);
      
      console.log('✅ Sponsor wallet loaded:', this.getSponsorAddress());
    } catch (error) {
      console.error('❌ Failed to load sponsor wallet:', error);
      throw new GasStationError(
        'Failed to load sponsor wallet. Make sure SPONSOR_PRIVATE_KEY is set correctly.',
        GasStationErrorCode.SPONSOR_WALLET_UNAVAILABLE,
        error
      );
    }

    // Initialize daily gas tracking
    this.lastResetDate = new Date().toISOString().split('T')[0];
  }

  /**
   * Get sponsor wallet address
   * Implements Requirement 3.1
   */
  getSponsorAddress(): string {
    return this.sponsorKeypair.getPublicKey().toSuiAddress();
  }

  /**
   * Validate a transaction before sponsoring
   * Implements Requirements 3.2, 6.1, 6.5
   */
  async validateTransaction(request: SponsorshipRequest): Promise<boolean> {
    // Check if transaction type is allowed
    if (!this.config.allowedTransactionTypes.includes(request.transactionType)) {
      throw new GasStationError(
        `Transaction type ${request.transactionType} is not allowed for sponsorship`,
        GasStationErrorCode.INVALID_TRANSACTION_TYPE
      );
    }

    // Validate user address format
    if (!request.userAddress || !request.userAddress.startsWith('0x')) {
      throw new GasStationError(
        'Invalid user address format',
        GasStationErrorCode.VALIDATION_FAILED
      );
    }

    // Validate transaction bytes
    if (!request.transactionBytes || request.transactionBytes.length === 0) {
      throw new GasStationError(
        'Transaction bytes cannot be empty',
        GasStationErrorCode.VALIDATION_FAILED
      );
    }

    // Check daily gas limit
    this.resetDailyGasIfNeeded();
    if (this.dailyGasUsed >= this.config.dailyGasLimit) {
      throw new GasStationError(
        'Daily gas limit exceeded',
        GasStationErrorCode.GAS_LIMIT_EXCEEDED
      );
    }

    return true;
  }

  /**
   * Check rate limit for a user
   * Implements Requirement 6.2
   * 
   * Note: This is a simplified implementation. In production, use Redis
   * for distributed rate limiting across multiple server instances.
   */
  async checkRateLimit(userAddress: string): Promise<boolean> {
    // TODO: Implement Redis-based rate limiting
    // For now, return true (no rate limiting)
    // Production implementation should:
    // 1. Check Redis for user's transaction count in time window
    // 2. Increment counter
    // 3. Set expiry on first transaction
    // 4. Return false if limit exceeded
    
    return true;
  }

  /**
   * Sponsor a transaction
   * Implements Requirements 1.3, 2.3, 3.3, 3.4
   */
  async sponsorTransaction(request: SponsorshipRequest): Promise<SponsorshipResponse> {
    try {
      // Step 1: Validate transaction
      await this.validateTransaction(request);

      // Step 2: Check rate limit
      const withinRateLimit = await this.checkRateLimit(request.userAddress);
      if (!withinRateLimit) {
        throw new GasStationError(
          'Rate limit exceeded for user',
          GasStationErrorCode.RATE_LIMIT_EXCEEDED
        );
      }

      // Step 3: Deserialize transaction
      const tx = Transaction.from(request.transactionBytes);

      // Step 4: Set sponsor as gas owner (payer)
      tx.setGasOwner(this.getSponsorAddress());

      // Step 5: Build transaction with sponsor
      const txBytes = await tx.build({ client: this.suiClient });

      // Step 6: Sign transaction as sponsor
      const sponsorSignature = await this.sponsorKeypair.signTransaction(txBytes);

      // Step 7: Submit transaction to Sui with BOTH signatures
      // For sponsored transactions, we need both user and sponsor signatures
      const result = await this.suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: [request.userSignature, sponsorSignature.signature],
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      // Step 8: Extract gas used from effects
      const gasUsed = this.extractGasUsed(result);

      // Step 9: Update daily gas tracking
      this.dailyGasUsed += gasUsed;

      // Step 10: Log transaction for accounting (Requirement 3.5)
      await this.logSponsoredTransaction({
        userAddress: request.userAddress,
        transactionType: request.transactionType,
        transactionDigest: result.digest,
        gasUsed,
        timestamp: Date.now(),
      });

      return {
        sponsoredTxBytes: txBytes,
        gasUsed,
        transactionDigest: result.digest,
        status: result.effects?.status?.status === 'success' ? 'success' : 'failed',
      };
    } catch (error) {
      if (error instanceof GasStationError) {
        throw error;
      }

      throw new GasStationError(
        'Failed to sponsor transaction',
        GasStationErrorCode.SPONSORSHIP_REJECTED,
        error
      );
    }
  }

  /**
   * Get gas cost report for a period
   * Implements Requirements 5.2, 5.5
   */
  async getGasCosts(period: 'daily' | 'weekly' | 'monthly'): Promise<GasCostReport> {
    // TODO: Implement database query for gas costs
    // This should query the sponsored_transactions table
    // and aggregate by period and transaction type
    
    // Placeholder implementation
    return {
      period,
      totalTransactions: 0,
      totalGasUsed: 0,
      totalCostSUI: 0,
      breakdown: {
        [TransactionType.CREATE_NEWSLETTER]: { count: 0, gasUsed: 0 },
        [TransactionType.PUBLISH_ISSUE]: { count: 0, gasUsed: 0 },
        [TransactionType.MINT_NFT]: { count: 0, gasUsed: 0 },
      },
    };
  }

  /**
   * Check sponsor wallet balance
   * Implements Requirement 5.4
   */
  async checkSponsorBalance(): Promise<{ balance: number; isLow: boolean }> {
    try {
      const sponsorAddress = this.getSponsorAddress();
      const balance = await this.suiClient.getBalance({
        owner: sponsorAddress,
      });

      const balanceSUI = parseInt(balance.totalBalance) / 1_000_000_000; // Convert MIST to SUI
      const isLow = balanceSUI < 10; // Alert if less than 10 SUI

      if (isLow) {
        console.warn(`⚠️ Sponsor wallet balance is low: ${balanceSUI} SUI`);
        // TODO: Send alert to administrators
      }

      return {
        balance: balanceSUI,
        isLow,
      };
    } catch (error) {
      throw new GasStationError(
        'Failed to check sponsor balance',
        GasStationErrorCode.SPONSOR_WALLET_UNAVAILABLE,
        error
      );
    }
  }

  /**
   * Extract gas used from transaction result
   * @private
   */
  private extractGasUsed(result: any): number {
    if (!result.effects || !result.effects.gasUsed) {
      return 0;
    }

    const gasUsed = result.effects.gasUsed;
    const computationCost = parseInt(gasUsed.computationCost || '0');
    const storageCost = parseInt(gasUsed.storageCost || '0');
    const storageRebate = parseInt(gasUsed.storageRebate || '0');

    return computationCost + storageCost - storageRebate;
  }

  /**
   * Log sponsored transaction for accounting
   * Implements Requirement 3.5, 5.1
   * @private
   */
  private async logSponsoredTransaction(data: {
    userAddress: string;
    transactionType: TransactionType;
    transactionDigest: string;
    gasUsed: number;
    timestamp: number;
  }): Promise<void> {
    // TODO: Implement database logging
    // This should insert into sponsored_transactions table
    console.log('📝 Sponsored transaction:', {
      user: data.userAddress,
      type: data.transactionType,
      digest: data.transactionDigest,
      gas: data.gasUsed,
      timestamp: new Date(data.timestamp).toISOString(),
    });
  }

  /**
   * Reset daily gas counter if needed
   * @private
   */
  private resetDailyGasIfNeeded(): void {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastResetDate) {
      this.dailyGasUsed = 0;
      this.lastResetDate = today;
    }
  }
}
