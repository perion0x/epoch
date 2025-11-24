/**
 * Gasless Subscription API
 * Subscribe to a newsletter without wallet connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { GasStationService, TransactionType } from '@/services/gas-station';
import { KeypairManager } from '@/services/keypair-manager';
import { config } from '@/config/environment';

/**
 * POST /api/gasless/subscribe
 * Subscribe to a newsletter without wallet connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newsletterId } = body;

    if (!userId || !newsletterId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, newsletterId' },
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
      maxGasPerTransaction: 50_000_000, // 0.05 SUI
      dailyGasLimit: 10_000_000_000,
      allowedTransactionTypes: [
        TransactionType.CREATE_NEWSLETTER,
        TransactionType.PUBLISH_ISSUE,
        TransactionType.MINT_NFT,
        // We'll reuse MINT_NFT type for subscription as it's similar (minting an object)
        // or we can add a new type if strict validation is needed.
      ],
    });

    // Get user address
    const userKeypair = await keypairManager.getOrCreateKeypair(userId);
    const userAddress = await keypairManager.getUserAddress(userId);

    console.log('👤 User subscribing:', userAddress);
    console.log('📰 Newsletter:', newsletterId);

    // Build transaction
    const tx = new Transaction();
    tx.setSender(userAddress);
    tx.setGasOwner(gasStation.getSponsorAddress());

    // Call subscribe_to_newsletter
    // This function mints a Subscription object and transfers it to the sender
    tx.moveCall({
      target: `${config.contracts.newsletterPackageId}::subscription::subscribe_to_newsletter`,
      arguments: [
        tx.object(newsletterId),
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
      transactionType: TransactionType.MINT_NFT, // Using MINT_NFT for now
    });

    return NextResponse.json({
      success: true,
      subscriptionId: sponsorshipResult.transactionDigest, // The ID will be in effects, but digest is returned
      transactionDigest: sponsorshipResult.transactionDigest,
      gasUsed: sponsorshipResult.gasUsed,
      message: '✅ Subscribed successfully (gasless)!',
      explorerUrl: `https://testnet.suivision.xyz/txblock/${sponsorshipResult.transactionDigest}`,
    });

  } catch (error: any) {
    console.error('Failed to subscribe:', error);
    return NextResponse.json(
      {
        error: 'Failed to subscribe',
        message: error.message || 'Unknown error',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

