/**
 * Gasless Newsletter Service (Frontend)
 * Simplified frontend service for gasless operations
 * Implements Requirements 7.1, 7.4, 7.5
 */

import { Newsletter } from '@/types';

/**
 * Generate a session-based user ID
 * In production, this should be stored in localStorage or session storage
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server-user';
  
  let userId = sessionStorage.getItem('gasless_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('gasless_user_id', userId);
  }
  return userId;
}

/**
 * Create a newsletter without wallet connection (gasless)
 */
export async function createGaslessNewsletter(params: {
  title: string;
  description: string;
  accessModel?: {
    isFree?: boolean;
    isNftGated?: boolean;
    isHybrid?: boolean;
  };
  nftCollection?: string;
}): Promise<{
  newsletterId: string;
  transactionDigest: string;
  userAddress: string;
}> {
  const userId = getUserId();

  const response = await fetch('/api/gasless/newsletters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create newsletter');
  }

  const data = await response.json();
  return {
    newsletterId: data.newsletterId,
    transactionDigest: data.transactionDigest,
    userAddress: data.userAddress,
  };
}

/**
 * Get newsletter by ID
 */
export async function getGaslessNewsletter(id: string): Promise<Newsletter> {
  const response = await fetch(`/api/gasless/newsletters?id=${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get newsletter');
  }

  const data = await response.json();
  return data.newsletter;
}

/**
 * Get current user's address
 */
export function getUserAddress(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gasless_user_address');
}

/**
 * Store user address after first transaction
 */
export function setUserAddress(address: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gasless_user_address', address);
}
