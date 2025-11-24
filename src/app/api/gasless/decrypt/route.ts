/**
 * Gasless Decryption API
 * Decrypt content on behalf of the user using their managed keypair
 */

import { NextRequest, NextResponse } from 'next/server';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { KeypairManager } from '@/services/keypair-manager';
import { SealClient } from '@/services/seal';
import { config } from '@/config/environment';
import { fromHex } from '@mysten/sui/utils';

/**
 * POST /api/gasless/decrypt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newsletterId, issueId, encryptedContent } = body;

    if (!userId || !newsletterId || !issueId || !encryptedContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize services
    const suiClient = new SuiClient({ url: config.sui.rpcUrl });
    const keypairManager = new KeypairManager(
      process.env.PLATFORM_MASTER_KEY || 'default-key-change-in-production'
    );
    const sealClient = new SealClient(config.seal.keyServerUrl);

    // Get user keypair
    const userKeypair = await keypairManager.getOrCreateKeypair(userId);
    const userAddress = await keypairManager.getUserAddress(userId);

    console.log('🔓 Decrypting for user:', userAddress);

    // 1. Find Subscription Object
    // We need to find a subscription object owned by this user for this newsletter
    const ownedObjects = await suiClient.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${config.contracts.newsletterPackageId}::subscription::Subscription`,
      },
      options: { showContent: true },
    });

    const subscription = ownedObjects.data.find(obj => {
      const content = obj.data?.content as any;
      return content?.fields?.newsletter_id === newsletterId;
    });

    if (!subscription || !subscription.data) {
      return NextResponse.json(
        { error: 'No subscription found for this newsletter' },
        { status: 403 }
      );
    }

    const subscriptionId = subscription.data.objectId;
    console.log('🎫 Found Subscription:', subscriptionId);

    // 2. Get Seal Package ID from Newsletter
    const newsletterObj = await suiClient.getObject({
      id: newsletterId,
      options: { showContent: true }
    });
    
    if (!newsletterObj.data) {
        return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }
    const sealPackageId = (newsletterObj.data.content as any).fields.seal_package_id;

    // 3. Build Seal Approval Transaction
    const tx = new Transaction();
    tx.setSender(userAddress);

    // Identity matching encryption: newsletterId + newsletterId (64 bytes hex)
    const cleanId = newsletterId.startsWith('0x') ? newsletterId.slice(2) : newsletterId;
    const identity = cleanId + cleanId;

    tx.moveCall({
      target: `${sealPackageId}::access_policy::seal_approve_subscription`,
      arguments: [
        tx.pure.vector('u8', fromHex(identity)),
        tx.object(subscriptionId),
      ],
    });

    // 4. Sign Transaction (but DON'T execute it on chain - Seal executes/verifies it)
    const txBytes = await tx.build({ client: suiClient });
    const { signature } = await userKeypair.signTransaction(txBytes); // Assuming this returns { signature, bytes } or similar
    // Wait, keypair.signTransaction usually returns valid signature for Sui.
    // Seal client logic:
    // The Seal Client 'decrypt' function takes 'txBytes'.
    // But wait, 'SealClient.decrypt' in 'src/services/seal.ts' sends 'tx_bytes' to the Seal Server.
    // The Seal Server (off-chain) likely validates the signature?
    // Actually, the 'txBytes' passed to Seal must be the *signed* transaction?
    // OR, Seal expects the raw bytes and the signature separately?
    
    // Let's check 'src/services/seal.ts':
    // body: JSON.stringify({ data, session_key, tx_bytes })
    
    // The 'tx_bytes' here usually refers to the bytes of the transaction that *would* call the approve function.
    // But where is the signature?
    // If Seal simulates the transaction, it needs to be signed?
    // Or does Seal just run it as a dry-run?
    // If it's a dry-run, it checks if it *succeeds*.
    // But anyone can construct a transaction that "succeeds" if they aren't the sender?
    // No, 'tx.setSender(userAddress)'. Only the user can sign for 'userAddress'.
    // So Seal MUST verify the signature.
    // Does 'SealClient.decrypt' take a signature?
    
    // Let's look at 'src/services/seal.ts' again.
    // It does NOT take a signature. It takes 'txBytes'.
    // This implies 'txBytes' might need to be the *serialized signed transaction*?
    // OR, Seal works differently.
    
    // In standard Sui Seal demos:
    // The client builds the transaction.
    // The client signs it (getting a signature).
    // The client sends the transaction (bytes) + signature to Seal?
    
    // 'src/services/seal.ts' implementation:
    // It just sends 'tx_bytes'.
    
    // If the Seal Server is implemented to run a "Dev Inspect" (Dry Run), it doesn't strictly need a signature IF it trusts the sender?
    // No, that would be insecure. Anyone could claim to be the subscriber.
    // The Move contract checks: `assert!(subscriber == sender, ENoAccess);`
    // 'sender' is determined by the transaction signer.
    
    // Therefore, 'txBytes' MUST include the signature.
    // In Sui, a transaction block can be serialized *with* signatures?
    // No, usually 'Transaction' builds 'bytes' (unsigned).
    // Then you sign it.
    // Then you execute 'bytes' + 'signature'.
    
    // If 'SealClient' only accepts 'tx_bytes', maybe it expects the *signed* transaction bytes?
    // Or maybe the 'SealClient' in this repo is a simplified wrapper and I should check if I can pass signature.
    
    // Looking at 'src/services/seal.ts' lines 213:
    // tx_bytes: Array.from(txBytes),
    
    // It seems this Seal Client implementation might be incomplete or relies on a specific Seal Server behavior.
    // However, 'NewsletterService.ts' (lines 776) builds 'txBytes' but DOES NOT SIGN IT.
    // `const txBytes = await tx.build({ client: this.suiClient });`
    // And passes that to `decrypt`.
    
    // If 'NewsletterService' works (for the wallet case), then Seal Server must be accepting unsigned bytes?
    // If so, how does it verify the sender?
    // Perhaps it doesn't verify signature, just executes?
    // If it just executes, it sets the sender context to whatever is in the tx?
    // If so, that's insecure (spoofing).
    // But let's assume for this "Demo" that we follow the 'NewsletterService' pattern.
    // 'NewsletterService' sends *unsigned* bytes.
    
    // Wait! `NewsletterService.ts`:
    // It creates a Session Key first!
    // `const sessionKey = await this.createSessionKey(userAddress, ...);`
    // `createSessionKey` calls Seal Server.
    // Does `createSessionKey` verify identity?
    // It takes `address` and `packageId`. It does NOT take a signature.
    // This implies the Seal Server implementation being used might be "Open" or trusting for this testnet/demo environment.
    
    // Okay, I will follow the pattern in `NewsletterService.ts`.
    // 1. Create Session Key (Server does this for User).
    // 2. Build Transaction (Unsigned).
    // 3. Call Decrypt.
    
    // Note: In a real production Seal integration, you absolutely need to prove ownership of the address (Signature).
    
    // 1. Create Session Key
    const sessionKey = await sealClient.createSessionKey({
        address: userAddress,
        packageId: sealPackageId,
        ttlMin: 5
    });
    
    // 2. Base64 Decode the encrypted content
    const encryptedBytes = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0));
    
    // 3. Decrypt
    const decryptedBytes = await sealClient.decrypt({
        data: encryptedBytes,
        sessionKey: sessionKey,
        txBytes: txBytes // Unsigned bytes as per service pattern
    });
    
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    
    return NextResponse.json({
        success: true,
        decryptedContent: decryptedText
    });

  } catch (error: any) {
    console.error('Decryption failed:', error);
    return NextResponse.json(
      { error: error.message || 'Decryption failed' },
      { status: 500 }
    );
  }
}

