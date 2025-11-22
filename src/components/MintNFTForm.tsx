'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { NewsletterAccessNFT } from '@/types';
import { NewsletterService } from '@/services/newsletter';
import { WalrusClient } from '@/services/walrus';
import { SealClient } from '@/services/seal';
import { getEnvironmentConfig } from '@/config/environment';

interface MintNFTFormProps {
  newsletterId: string;
  onNFTMinted: (nft: NewsletterAccessNFT) => void;
}

/**
 * Form component for minting access NFTs
 * Implements Requirements 5.1, 5.3
 */
export function MintNFTForm({ newsletterId, onNFTMinted }: MintNFTFormProps) {
  const { address, suiClient } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateAddress = (addr: string): boolean => {
    // Basic Sui address validation - should start with 0x and be 66 characters
    if (!addr) return false;
    if (!addr.startsWith('0x')) return false;
    if (addr.length !== 66) return false;
    // Check if it's valid hex
    const hexPart = addr.slice(2);
    return /^[0-9a-fA-F]+$/.test(hexPart);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    // Validate recipient address
    if (!validateAddress(recipientAddress)) {
      setError('Invalid recipient address. Must be a valid Sui address (0x...)');
      return;
    }

    setMinting(true);
    setError(null);
    setSuccess(false);

    try {
      // Initialize service
      const config = getEnvironmentConfig();
      const walrusClient = new WalrusClient(config.walrusPublisherUrl, config.walrusAggregatorUrl);
      const sealClient = new SealClient(config.sealKeyServerUrl);
      const newsletterService = new NewsletterService(
        suiClient,
        walrusClient,
        sealClient,
        config.packageId
      );

      // Mint the NFT (Requirement 5.1, 5.3)
      const nft = await newsletterService.mintAccessNFT(newsletterId, recipientAddress);

      // Success!
      setSuccess(true);
      setRecipientAddress('');
      onNFTMinted(nft);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to mint NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value.trim());
    setError(null);
  };

  return (
    <div className="mint-nft-form-container">
      <form onSubmit={handleSubmit} className="mint-nft-form">
        <div className="form-group">
          <label htmlFor="recipient" className="form-label">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipientAddress}
            onChange={handleAddressChange}
            placeholder="0x..."
            className="form-input"
            disabled={minting}
            required
          />
          <p className="form-help">
            Enter the Sui wallet address of the recipient who will receive the access NFT
          </p>
        </div>

        {error && (
          <div className="form-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="form-success">
            <span className="success-icon">✓</span>
            <span>NFT minted successfully!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={minting || !recipientAddress}
          className="mint-button"
        >
          {minting ? (
            <>
              <span className="spinner"></span>
              Minting NFT...
            </>
          ) : (
            'Mint Access NFT'
          )}
        </button>
      </form>
    </div>
  );
}
