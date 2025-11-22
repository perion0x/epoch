/**
 * Gasless Newsletter API
 * Handles newsletter creation without wallet connection
 * Implements Requirements 1.1, 1.4, 7.1, 7.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { GasStationService, TransactionType } from '@/services/gas-station';
import { KeypairManager } from '@/services/keypair-manager';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import { config } from '@/config/environment';

/**
 * POST /api/gasless/newsletters
 * Create a newsletter without wallet connection
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, title, description, accessModel, nftCollection } = body;

    // Validate inputs
    if (!userId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, description' },
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
      maxGasPerTransaction: 100_000_000, // 0.1 SUI
      dailyGasLimit: 10_000_000_000, // 10 SUI per day
      allowedTransactionTypes: [
        TransactionType.CREATE_NEWSLETTER,
        TransactionType.PUBLISH_ISSUE,
        TransactionType.MINT_NFT,
      ],
    });

    // Step 1: Get or create keypair for user
    const userKeypair = await keypairManager.getOrCreateKeypair(userId);
    
    // Get address from the keypair we just got/created
    const publicKeyBytes = fromBase64(userKeypair.publicKey);
    const publicKey = new Ed25519PublicKey(publicKeyBytes);
    const userAddress = publicKey.toSuiAddress();

    // Step 2: Build newsletter creation transaction
    const tx = new Transaction();
    tx.setSender(userAddress);
    
    // Set gas payment to sponsor wallet (gasless for user)
    const sponsorAddress = gasStation.getSponsorAddress();
    tx.setGasOwner(sponsorAddress);

    console.log('📦 Package IDs:', {
      newsletterPackageId: config.contracts.newsletterPackageId,
      sealPolicyPackageId: config.contracts.sealPolicyPackageId,
      sponsorAddress,
      userAddress,
    });

    tx.moveCall({
      target: `${config.contracts.newsletterPackageId}::newsletter::create_and_share_newsletter`,
      arguments: [
        tx.pure.string(title),
        tx.pure.string(description),
        tx.pure.bool(accessModel?.isFree ?? true),
        tx.pure.bool(accessModel?.isNftGated ?? false),
        tx.pure.bool(accessModel?.isHybrid ?? false),
        tx.pure.option('address', nftCollection || null),
        tx.pure('address', config.contracts.newsletterPackageId), // Pass as raw address type
      ],
    });

    // Step 3: Build transaction bytes
    const txBytes = await tx.build({ client: suiClient });

    // Step 4: Sign with user's keypair
    const userSignature = await keypairManager.signTransaction(userId, txBytes);

    // Step 5: Request sponsorship from Gas Station
    const sponsorshipResult = await gasStation.sponsorTransaction({
      transactionBytes: txBytes,
      userAddress,
      userSignature,
      transactionType: TransactionType.CREATE_NEWSLETTER,
    });

    // Step 6: Return success response
    return NextResponse.json({
      success: true,
      newsletterId: sponsorshipResult.transactionDigest, // Will extract from events in production
      transactionDigest: sponsorshipResult.transactionDigest,
      userAddress,
      gasUsed: sponsorshipResult.gasUsed,
      message: '✅ Newsletter created on Sui blockchain (gasless)!',
      explorerUrl: `https://testnet.suivision.xyz/txblock/${sponsorshipResult.transactionDigest}`,
    });
  } catch (error: any) {
    console.error('Failed to create gasless newsletter:', error);
    console.error('Error stack:', error.stack);
    console.error('Error cause:', error.cause);
    
    return NextResponse.json(
      {
        error: 'Failed to create newsletter',
        message: error.message || 'Unknown error',
        code: error.code || 'INTERNAL_ERROR',
        details: error.cause?.message || error.toString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gasless/newsletters/:id
 * Get newsletter by ID
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    // Initialize Sui client
    const suiClient = new SuiClient({ url: config.sui.rpcUrl });

    // Query newsletter from blockchain
    const response = await suiClient.getObject({
      id,
      options: {
        showContent: true,
      },
    });

    if (!response.data) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Parse newsletter data
    const content = response.data.content as any;
    const fields = content.fields;

    const newsletter = {
      id: fields.id.id,
      creator: fields.creator,
      title: fields.title,
      description: fields.description,
      accessModel: {
        isFree: fields.access_model.fields.is_free,
        isNftGated: fields.access_model.fields.is_nft_gated,
        isHybrid: fields.access_model.fields.is_hybrid,
      },
      nftCollection: fields.nft_collection,
      sealPackageId: fields.seal_package_id,
      createdAt: parseInt(fields.created_at),
      issueCount: parseInt(fields.issue_count),
    };

    return NextResponse.json({ newsletter });
  } catch (error: any) {
    console.error('Failed to get newsletter:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get newsletter',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
