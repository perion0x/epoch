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
// import { SealClient } from '@/services/seal'; // Seal Disabled
import { config } from '@/config/environment';
import { serializeContent, calculateBoundaries, ContentSection } from '@/services/content';

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
    // const sealClient = new SealClient(config.seal.keyServerUrl); // Seal Disabled

    // Get or create keypair for user (reuses existing if available)
    const userKeypair = await keypairManager.getOrCreateKeypair(userId);
    const userAddress = await keypairManager.getUserAddress(userId);

    // Append hidden timestamp to ensure unique Blob ID (Content Deduplication Prevention)
    const timestamp = new Date().toISOString();
    const uniquePublicContent = `${publicContent}\n<!-- Published at: ${timestamp} -->`;

    // Prepare Content Sections
    const sections: ContentSection[] = [
      { type: 'public', content: uniquePublicContent, format: 'html' }
    ];

    // Check for premium content but treat it as PUBLIC (Seal Disabled)
    const rawHasPremium = !!premiumContent && premiumContent.length > 0;

    if (rawHasPremium) {
      console.log('🔓 Seal Disabled: Appending premium content as public text...');
      
      // Append as a separate public section so it's stored but visible
      sections.push({
        type: 'public', // Force Public
        content: `<div class="premium-content-unlocked" style="margin-top: 30px; padding-top: 30px; border-top: 1px dashed #334155;"><h3>Premium Content (Public Preview)</h3>${premiumContent}</div>`,
        format: 'html'
      });
    }

    // Upload content to Walrus
    console.log('📤 Uploading to Walrus...');
    const serializedContent = serializeContent(sections);
    const blobId = await walrusClient.store(serializedContent);
    
    console.log('✅ Walrus upload:', blobId);

    // Calculate content boundaries
    const storedContent = {
       version: 1,
       sections: sections.map((s, index) => {
         return {
            type: s.type,
            content: new TextEncoder().encode(s.content),
            metadata: { 
                format: s.format, 
                byteRange: { start: 0, end: 0 } // Placeholder
            }
         };
       })
    };
    
    // Fix offsets
    let currentOffset = 0;
    storedContent.sections.forEach(s => {
       const len = s.content.length;
       s.metadata.byteRange = { start: currentOffset, end: currentOffset + len };
       currentOffset += len;
    });

    const boundaries = calculateBoundaries(storedContent as any);
    
    // Extract ranges for contract
    const publicRangesStart = boundaries.publicRanges.map(r => r.start);
    const publicRangesEnd = boundaries.publicRanges.map(r => r.end);
    // Since we forced type='public', these should be empty
    const encryptedRangesStart = boundaries.encryptedRanges.map(r => r.start);
    const encryptedRangesEnd = boundaries.encryptedRanges.map(r => r.end);

    // Force hasPremium to false on-chain because we have no encrypted content
    const onChainHasPremium = false;

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
        tx.pure.bool(onChainHasPremium),
      ],
    });

    // Build and sign
    const txBytes = await tx.build({ client: suiClient });
    const userSignature = await keypairManager.signTransaction(userId, txBytes);

    console.log('📝 Transaction details:', {
      userAddress,
      newsletterId,
      sender: userAddress,
    });

    // Sponsor transaction
    const sponsorshipResult = await gasStation.sponsorTransaction({
      transactionBytes: txBytes,
      userAddress,
      userSignature,
      transactionType: TransactionType.PUBLISH_ISSUE,
    });

    return NextResponse.json({
      success: true,
      issueId: sponsorshipResult.transactionDigest, // Using tx digest as issue ID for now
      transactionDigest: sponsorshipResult.transactionDigest,
      blobId: blobId,
      gasUsed: sponsorshipResult.gasUsed,
      message: '✅ Issue published on Sui + Walrus (gasless) - Seal Encryption Disabled',
      explorerUrl: `https://testnet.suivision.xyz/txblock/${sponsorshipResult.transactionDigest}`,
    });
  } catch (error: any) {
    console.error('Failed to publish gasless issue:', error);
    
    let errorMessage = error.message || 'Unknown error';
    if (error.message?.includes('MoveAbort') && error.message?.includes('1)')) {
      errorMessage = 'You are not the creator of this newsletter. Please use the same browser/session that created the newsletter, or create a new newsletter.';
    }
    
    return NextResponse.json(
      {
        error: 'Failed to publish issue',
        message: errorMessage,
        code: error.code || 'INTERNAL_ERROR',
        details: error.cause?.executionErrorSource || error.toString(),
      },
      { status: 500 }
    );
  }
}