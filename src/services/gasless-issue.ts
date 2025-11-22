/**
 * Gasless Issue Publishing Service
 * Frontend wrapper for gasless issue publishing
 */

export interface GaslessIssueRequest {
  newsletterId: string;
  title: string;
  publicContent: string;
  premiumContent?: string;
}

export interface GaslessIssueResponse {
  success: boolean;
  issueId: string;
  transactionDigest: string;
  blobId: string;
  gasUsed: number;
  message: string;
  explorerUrl: string;
}

/**
 * Publish an issue without wallet connection
 */
export async function publishGaslessIssue(
  request: GaslessIssueRequest
): Promise<GaslessIssueResponse> {
  // Generate or retrieve user ID from session
  const userId = getOrCreateUserId();

  const response = await fetch('/api/gasless/issues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      ...request,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to publish issue');
  }

  return response.json();
}

import { getUserId } from './gasless-newsletter';

/**
 * Get or create a user ID for the session
 */
function getOrCreateUserId(): string {
  return getUserId();
}
