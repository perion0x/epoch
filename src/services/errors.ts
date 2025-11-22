/**
 * Centralized error handling for the newsletter platform
 * Implements Task 12.1 - Add error handling to all service methods
 * 
 * Features:
 * - Define NewsletterError enum
 * - Implement retry logic for transient failures
 * - Add user-friendly error messages
 * - Log errors for debugging
 */

/**
 * Error codes for the newsletter platform
 */
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_TITLE = 'INVALID_TITLE',
  INVALID_CONTENT = 'INVALID_CONTENT',
  
  // Authentication/Authorization errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NEWSLETTER_NOT_FOUND = 'NEWSLETTER_NOT_FOUND',
  ISSUE_NOT_FOUND = 'ISSUE_NOT_FOUND',
  INVALID_ACCESS_MODEL = 'INVALID_ACCESS_MODEL',
  
  // Service errors
  WALRUS_ERROR = 'WALRUS_ERROR',
  SEAL_ERROR = 'SEAL_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  
  // Operation errors
  CREATION_FAILED = 'CREATION_FAILED',
  PUBLISH_FAILED = 'PUBLISH_FAILED',
  MINT_FAILED = 'MINT_FAILED',
  SUBSCRIBE_FAILED = 'SUBSCRIBE_FAILED',
  UNSUBSCRIBE_FAILED = 'UNSUBSCRIBE_FAILED',
  
  // Encryption/Decryption errors
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  KEY_RETRIEVAL_FAILED = 'KEY_RETRIEVAL_FAILED',
  
  // Storage errors
  STORAGE_FAILED = 'STORAGE_FAILED',
  RETRIEVAL_FAILED = 'RETRIEVAL_FAILED',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Base error class for newsletter platform
 */
export class NewsletterError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly timestamp: number;
  public readonly context?: Record<string, unknown>;
  public readonly errorCause?: Error;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    options: {
      severity?: ErrorSeverity;
      retryable?: boolean;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = 'NewsletterError';
    this.code = code;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.retryable = options.retryable ?? false;
    this.timestamp = Date.now();
    this.context = options.context;
    this.errorCause = options.cause;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NewsletterError);
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return getUserFriendlyMessage(this.code, this.message);
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Get user-friendly error messages
 */
export function getUserFriendlyMessage(code: ErrorCode, technicalMessage?: string): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection and try again.',
    [ErrorCode.TIMEOUT]: 'The request took too long. Please try again.',
    [ErrorCode.CONNECTION_FAILED]: 'Failed to connect to the service. Please try again later.',
    
    [ErrorCode.INVALID_INPUT]: 'Invalid input provided. Please check your data and try again.',
    [ErrorCode.INVALID_ADDRESS]: 'Invalid wallet address. Please enter a valid Sui address.',
    [ErrorCode.INVALID_TITLE]: 'Invalid title. Please provide a valid title.',
    [ErrorCode.INVALID_CONTENT]: 'Invalid content. Please check your content and try again.',
    
    [ErrorCode.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue.',
    [ErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',
    [ErrorCode.ACCESS_DENIED]: 'Access denied. You do not have permission to view this content.',
    
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCode.ALREADY_EXISTS]: 'This resource already exists.',
    [ErrorCode.NEWSLETTER_NOT_FOUND]: 'Newsletter not found.',
    [ErrorCode.ISSUE_NOT_FOUND]: 'Issue not found.',
    [ErrorCode.INVALID_ACCESS_MODEL]: 'Invalid access model. Traditional newsletters must be free.',
    
    [ErrorCode.WALRUS_ERROR]: 'Failed to store or retrieve content from Walrus. Please try again.',
    [ErrorCode.SEAL_ERROR]: 'Encryption service error. Please try again.',
    [ErrorCode.BLOCKCHAIN_ERROR]: 'Blockchain transaction failed. Please try again.',
    
    [ErrorCode.CREATION_FAILED]: 'Failed to create newsletter. Please try again.',
    [ErrorCode.PUBLISH_FAILED]: 'Failed to publish issue. Please try again.',
    [ErrorCode.MINT_FAILED]: 'Failed to mint NFT. Please try again.',
    [ErrorCode.SUBSCRIBE_FAILED]: 'Failed to subscribe. Please try again.',
    [ErrorCode.UNSUBSCRIBE_FAILED]: 'Failed to unsubscribe. Please try again.',
    
    [ErrorCode.ENCRYPTION_FAILED]: 'Failed to encrypt content. Please try again.',
    [ErrorCode.DECRYPTION_FAILED]: 'Failed to decrypt content. Please verify your access and try again.',
    [ErrorCode.KEY_RETRIEVAL_FAILED]: 'Failed to retrieve decryption keys. Please try again.',
    
    [ErrorCode.STORAGE_FAILED]: 'Failed to store data. Please try again.',
    [ErrorCode.RETRIEVAL_FAILED]: 'Failed to retrieve data. Please try again.',
    
    [ErrorCode.UNKNOWN_ERROR]: technicalMessage || 'An unexpected error occurred. Please try again.',
  };

  return messages[code] || messages[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, delayMs, backoffMultiplier, maxDelayMs } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's not a retryable error
      if (error instanceof NewsletterError && !error.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Increase delay for next attempt (exponential backoff)
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);

      console.log(`Retry attempt ${attempt}/${maxAttempts} after ${currentDelay}ms`);
    }
  }

  throw lastError;
}

/**
 * Error logger
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: NewsletterError[] = [];
  private maxLogs = 100;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(error: NewsletterError): void {
    // Add to logs
    this.logs.unshift(error);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console based on severity
    const logMethod = this.getLogMethod(error.severity);
    logMethod(`[${error.code}] ${error.message}`, error.toJSON());
  }

  private getLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return console.error.bind(console);
      case ErrorSeverity.MEDIUM:
        return console.warn.bind(console);
      case ErrorSeverity.LOW:
      default:
        return console.log.bind(console);
    }
  }

  getLogs(): NewsletterError[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogsBySeverity(severity: ErrorSeverity): NewsletterError[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  getLogsByCode(code: ErrorCode): NewsletterError[] {
    return this.logs.filter((log) => log.code === code);
  }
}

/**
 * Helper to create and log an error
 */
export function createError(
  message: string,
  code: ErrorCode,
  options?: {
    severity?: ErrorSeverity;
    retryable?: boolean;
    cause?: Error;
    context?: Record<string, unknown>;
  }
): NewsletterError {
  const error = new NewsletterError(message, code, options);
  ErrorLogger.getInstance().log(error);
  return error;
}

/**
 * Helper to wrap errors
 */
export function wrapError(
  error: unknown,
  code: ErrorCode,
  message?: string
): NewsletterError {
  if (error instanceof NewsletterError) {
    return error;
  }

  const cause = error instanceof Error ? error : new Error(String(error));
  const errorMessage = message || cause.message;

  return createError(errorMessage, code, {
    cause,
    retryable: isRetryableError(cause),
  });
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /connection/i,
    /unavailable/i,
    /temporary/i,
    /rate limit/i,
  ];

  return retryablePatterns.some((pattern) => pattern.test(error.message));
}
