// Core type definitions for the newsletter platform
// Will be expanded in subsequent tasks

export type BlobId = string;

export enum NewsletterType {
  TRADITIONAL = 'traditional',  // Database-backed, no wallet required
  BLOCKCHAIN = 'blockchain'      // Sui blockchain-backed
}

export interface Newsletter {
  id: string;
  type: NewsletterType;
  creator: string;  // Email/username for traditional, address for blockchain
  title: string;
  description: string;
  accessModel: AccessModel;
  
  // Blockchain-specific fields (optional for traditional)
  blockchainId?: string;  // Sui object ID
  nftCollection?: string;
  sealPackageId?: string;
  
  createdAt: number;
  updatedAt: number;
  issueCount: number;
}

export interface AccessModel {
  isFree: boolean;
  isNftGated: boolean;
  isHybrid: boolean;
}

export interface Issue {
  id: string;
  newsletterId: string;
  title: string;
  
  // Traditional issues store content directly
  content?: string;
  
  // Blockchain issues use Walrus
  walrusBlobId?: BlobId;
  contentBoundaries?: ContentBoundaries;
  
  publishedAt: number;
  updatedAt: number;
  hasPremium: boolean;
}

export interface ContentBoundaries {
  publicRanges: Range[];
  encryptedRanges: Range[];
}

export interface Range {
  start: number;
  end: number;
}

export interface NewsletterAccessNFT {
  id: string;
  newsletterId: string;
  accessLevel: number;
  issuedAt: number;
}

export interface Subscription {
  id: string;
  subscriber: string;
  newsletterId: string;
  subscribedAt: number;
}

export interface StoredContent {
  version: number;
  sections: Section[];
}

export interface Section {
  type: 'public' | 'premium';
  content: Uint8Array;
  metadata: {
    format: 'markdown' | 'html' | 'plain';
    byteRange: { start: number; end: number };
  };
}

// Type guards for newsletter types
export function isTraditionalNewsletter(newsletter: Newsletter): newsletter is Newsletter & { type: NewsletterType.TRADITIONAL } {
  return newsletter.type === NewsletterType.TRADITIONAL;
}

export function isBlockchainNewsletter(newsletter: Newsletter): newsletter is Newsletter & { 
  type: NewsletterType.BLOCKCHAIN;
  blockchainId: string;
  sealPackageId: string;
} {
  return newsletter.type === NewsletterType.BLOCKCHAIN && 
         !!newsletter.blockchainId && 
         !!newsletter.sealPackageId;
}

// Type aliases for clarity
export type TraditionalNewsletter = Newsletter & { type: NewsletterType.TRADITIONAL };
export type BlockchainNewsletter = Newsletter & { 
  type: NewsletterType.BLOCKCHAIN;
  blockchainId: string;
  sealPackageId: string;
};
