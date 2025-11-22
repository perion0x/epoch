'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { NewsletterService, CreateNewsletterParams } from '@/services/newsletter';
import { WalrusClient } from '@/services/walrus';
import { SealClient } from '@/services/seal';
import { config } from '@/config/environment';
import { Newsletter } from '@/types';

/**
 * Newsletter creation form component
 * Implements Requirements 1.1, 1.2, 1.3
 */

interface FormData {
  title: string;
  description: string;
  accessModel: 'free' | 'nft-gated' | 'hybrid';
  nftCollection: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  nftCollection?: string;
  general?: string;
}

export function NewsletterCreationForm() {
  const { address, isConnected, suiClient } = useWallet();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    accessModel: 'free',
    nftCollection: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [createdNewsletter, setCreatedNewsletter] = useState<Newsletter | null>(null);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate NFT collection for gated/hybrid models
    if (formData.accessModel === 'nft-gated' || formData.accessModel === 'hybrid') {
      if (!formData.nftCollection.trim()) {
        newErrors.nftCollection = 'NFT collection address is required for NFT-gated or hybrid access';
      } else if (!formData.nftCollection.startsWith('0x')) {
        newErrors.nftCollection = 'NFT collection address must start with 0x';
      } else if (formData.nftCollection.length < 10) {
        newErrors.nftCollection = 'Invalid NFT collection address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    setCreatedNewsletter(null);
    setErrors({});

    // Check wallet connection
    if (!isConnected || !address) {
      setErrors({ general: 'Please connect your wallet to create a newsletter' });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize services
      const walrusClient = new WalrusClient(
        config.walrus.aggregatorUrl,
        config.walrus.publisherUrl
      );
      const sealClient = new SealClient(config.seal.keyServerUrl);
      const newsletterService = new NewsletterService(
        suiClient,
        walrusClient,
        sealClient,
        config.contracts.newsletterPackageId
      );

      // Prepare parameters
      const params: CreateNewsletterParams = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        accessModel: {
          isFree: formData.accessModel === 'free' || formData.accessModel === 'hybrid',
          isNftGated: formData.accessModel === 'nft-gated' || formData.accessModel === 'hybrid',
          isHybrid: formData.accessModel === 'hybrid',
        },
        nftCollection: formData.nftCollection.trim() || undefined,
        sealPackageId: config.contracts.sealPolicyPackageId,
      };

      // Create newsletter
      const newsletter = await newsletterService.createNewsletter(params, address);

      // Success!
      setCreatedNewsletter(newsletter);
      setSuccessMessage(`Newsletter "${newsletter.title}" created successfully!`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        accessModel: 'free',
        nftCollection: '',
      });
    } catch (error: any) {
      console.error('Failed to create newsletter:', error);
      setErrors({
        general: error.message || 'Failed to create newsletter. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="newsletter-creation-form">
      <h2>Create Newsletter</h2>
      
      {!isConnected && (
        <div className="warning-message">
          Please connect your wallet to create a newsletter.
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
          {createdNewsletter && (
            <div className="newsletter-id">
              Newsletter ID: {createdNewsletter.id}
            </div>
          )}
        </div>
      )}

      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter newsletter title"
            disabled={!isConnected || isSubmitting}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your newsletter"
            rows={4}
            disabled={!isConnected || isSubmitting}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="accessModel">
            Access Model <span className="required">*</span>
          </label>
          <select
            id="accessModel"
            name="accessModel"
            value={formData.accessModel}
            onChange={handleChange}
            disabled={!isConnected || isSubmitting}
          >
            <option value="free">Free - All content is public</option>
            <option value="nft-gated">NFT-Gated - All content requires NFT</option>
            <option value="hybrid">Hybrid - Mix of free and premium content</option>
          </select>
          <div className="field-help">
            {formData.accessModel === 'free' && 'All issues will be publicly accessible'}
            {formData.accessModel === 'nft-gated' && 'All issues will require NFT ownership'}
            {formData.accessModel === 'hybrid' && 'Issues can have both public and premium sections'}
          </div>
        </div>

        {(formData.accessModel === 'nft-gated' || formData.accessModel === 'hybrid') && (
          <div className="form-group">
            <label htmlFor="nftCollection">
              NFT Collection Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nftCollection"
              name="nftCollection"
              value={formData.nftCollection}
              onChange={handleChange}
              placeholder="0x..."
              disabled={!isConnected || isSubmitting}
              className={errors.nftCollection ? 'error' : ''}
            />
            {errors.nftCollection && (
              <span className="field-error">{errors.nftCollection}</span>
            )}
            <div className="field-help">
              Enter the Sui address of your NFT collection for access control
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={!isConnected || isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Creating...' : 'Create Newsletter'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .newsletter-creation-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        h2 {
          margin-bottom: 1.5rem;
          color: #1a1a1a;
        }

        .warning-message,
        .success-message,
        .error-message {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 4px;
        }

        .warning-message {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
        }

        .success-message {
          background-color: #d4edda;
          border: 1px solid #28a745;
          color: #155724;
        }

        .error-message {
          background-color: #f8d7da;
          border: 1px solid #dc3545;
          color: #721c24;
        }

        .newsletter-id {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          font-family: monospace;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-weight: 600;
          color: #333;
        }

        .required {
          color: #dc3545;
        }

        input,
        textarea,
        select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          font-family: inherit;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        input.error,
        textarea.error {
          border-color: #dc3545;
        }

        input:disabled,
        textarea:disabled,
        select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .field-error {
          color: #dc3545;
          font-size: 0.875rem;
        }

        .field-help {
          color: #666;
          font-size: 0.875rem;
        }

        .form-actions {
          margin-top: 1rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.75rem 1.5rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .submit-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
