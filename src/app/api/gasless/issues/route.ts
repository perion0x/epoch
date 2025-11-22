/**
 * Gasless Issue Publishing API
 * Publish newsletter issues without wallet connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { GasStationService, TransactionType } from '@/services/gas-station';
import { KeypairManager } from '@/services/keypair-manager';
import { WalrusClient } from '@/services/walrus';
import { config } from '@/config/environment';

/**
 * POST /api/gasless/issues
 * Publish an issue without wallet connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newsletterId, title, publicContent, premiumContent } = body;

    console.log('📥 Request body:', { userId, newsletterId, title, publicContentLength: publicContent?.length, hasPremium: !!premiumContent });

    if (!userId || !newsletterId || !title || !publicContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate newsletterId format (should be a valid Sui object ID)
    if (!newsletterId.startsWith('0x') || newsletterId.length !== 66) {
      return NextResponse.json(
        { error: `Invalid newsletter ID format: ${newsletterId}. Expected 66-character hex string starting with 0x` },
        { status: 400 }
      );
    }

    // Initialize services
    const suiClient = new SuiClient({ url: config.sui.rpcUrl });
    const keypairManager = new KeypairManager(
      process.env.PLATFORM_MASTER_KEY || 'default-key-change-in-production'
    );
    const gasStation = new GasStationService({
      sponsorPrivateKey: process.env.SPONSOR_PRIVATE_KEY || '',
      suiRpcUrl: config.sui.rpcUrl,
      maxGasPerTransaction: 100_000_000,
      dailyGasLimit: 10_000_000_000,
      allowedTransactionTypes: [
        TransactionType.CREATE_NEWSLETTER,
        TransactionType.PUBLISH_ISSUE,
        TransactionType.MINT_NFT,
      ],
    });
    const walrusClient = new WalrusClient(
      config.walrus.aggregatorUrl,
      config.walrus.publisherUrl
    );

    // Get or create keypair for user (reuses existing if available)
    const userKeypair = await keypairManager.getOrCreateKeypair(userId);
    const userAddress = await keypairManager.getUserAddress(userId);

    // Upload content to Walrus
    console.log('📤 Uploading to Walrus...');
    const fullContent = publicContent + (premiumContent || '');
    const contentBytes = new TextEncoder().encode(fullContent);
    const blobId = await walrusClient.store(contentBytes);
    
    console.log('✅ Walrus upload:', blobId);

    // Calculate content boundaries
    const publicBoundary = publicContent.length;
    const hasPremium = !!premiumContent;
    
    // Build ranges for public and encrypted content
    // Public range: from 0 to publicBoundary
    const publicRangesStart = [0];
    const publicRangesEnd = [publicBoundary];
    
    // Encrypted range: from publicBoundary to end (if premium content exists)
    const encryptedRangesStart = hasPremium ? [publicBoundary] : [];
    const encryptedRangesEnd = hasPremium ? [fullContent.length] : [];

    // Build transaction
    const tx = new Transaction();
    tx.setSender(userAddress);
    tx.setGasOwner(gasStation.getSponsorAddress());

    // Convert blob ID string to bytes
    const blobIdBytes = Array.from(new TextEncoder().encode(blobId));

    tx.moveCall({
      target: `${config.contracts.newsletterPackageId}::issue::publish_and_share_issue`,
      arguments: [
        tx.object(newsletterId),
        tx.pure.string(title),
        tx.pure.vector('u8', blobIdBytes),
        tx.pure.vector('u64', publicRangesStart),
        tx.pure.vector('u64', publicRangesEnd),
        tx.pure.vector('u64', encryptedRangesStart),
        tx.pure.vector('u64', encryptedRangesEnd),
        tx.pure.bool(hasPremium),
      ],
    });

    // Build and sign
    const txBytes = await tx.build({ client: suiClient });
    const userSignature = await keypairManager.signTransaction(userId, txBytes);

    // Sponsor transaction
    const sponsorshipResult = await gasStation.sponsorTransaction({
      transactionBytes: txBytes,
      userAddress,
      userSignature,
      transactionType: TransactionType.PUBLISH_ISSUE,
    });

    return NextResponse.json({
      success: true,
      issueId: sponsorshipResult.transactionDigest,
      transactionDigest: sponsorshipResult.transactionDigest,
      blobId: blobId,
      gasUsed: sponsorshipResult.gasUsed,
      message: '✅ Issue published on Sui + Walrus (gasless)!',
      explorerUrl: `https://testnet.suivision.xyz/txblock/${sponsorshipResult.transactionDigest}`,
    });
  } catch (error: any) {
    console.error('Failed to publish gasless issue:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to publish issue',
        message: error.message || 'Unknown error',
        code: error.code || 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
