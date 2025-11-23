'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { publishGaslessIssue } from '@/services/gasless-issue';
import dynamic from 'next/dynamic';

// Dynamically import Koenig editor to avoid SSR issues
const KoenigEditor = dynamic(() => import('@/components/KoenigEditor').then((mod) => ({ default: mod.KoenigEditor })), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '300px',
        padding: '20px',
        backgroundColor: '#1e293b',
        border: '2px solid #334155',
        borderRadius: '6px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Loading editor...
    </div>
  ),
});

function TestIssueContent() {
  const searchParams = useSearchParams();
  const [newsletterId, setNewsletterId] = useState('');
  const [title, setTitle] = useState('');
  const [publicContent, setPublicContent] = useState('');
  const [premiumContent, setPremiumContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);
  const [fetchingContent, setFetchingContent] = useState(false);

  useEffect(() => {
    const id = searchParams.get('newsletterId');
    if (id) {
      setNewsletterId(id);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setFetchedContent(null);

    try {
      const response = await publishGaslessIssue({
        newsletterId,
        title,
        publicContent,
        premiumContent: premiumContent || undefined,
      });

      setResult(response);
      setTitle('');
      setPublicContent('');
      setPremiumContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to publish issue');
    } finally {
      setLoading(false);
    }
  };

  const fetchContentFromWalrus = async (blobId: string) => {
    setFetchingContent(true);
    try {
      const response = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`);
      const content = await response.text();
      setFetchedContent(content);
    } catch (err) {
      console.error('Failed to fetch content from Walrus:', err);
      setFetchedContent('Failed to fetch content');
    } finally {
      setFetchingContent(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '50px 20px' }}>
      <a
        href="/"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        ← Back to Home
      </a>
      
      <h1 style={{ color: '#ffffff', fontSize: '36px', marginBottom: '12px', fontWeight: '700' }}>
        Publish Your Issue
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '18px', lineHeight: '1.6' }}>
        Create and publish newsletter issues with a professional editor. Content stored on Walrus, metadata on Sui.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#cbd5e1' }}>
            Newsletter ID {newsletterId && '✅'}
          </label>
          <input
            type="text"
            value={newsletterId}
            onChange={(e) => setNewsletterId(e.target.value)}
            placeholder="0x..."
            required
            readOnly={!!newsletterId}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #475569',
              borderRadius: '4px',
              fontFamily: 'monospace',
              backgroundColor: newsletterId ? '#334155' : '#1e293b',
              color: '#ffffff',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#cbd5e1' }}>
            Issue Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter issue title..."
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #475569',
              borderRadius: '4px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
            Public Content (Free)
          </label>
          <KoenigEditor
            initialValue={publicContent}
            onChange={(html, markdown) => setPublicContent(html)}
            placeholder="Write your newsletter content... (visible to everyone)"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
            Premium Content <span style={{ color: '#64748b', fontWeight: '400' }}>(Optional - NFT holders only)</span>
          </label>
          <KoenigEditor
            initialValue={premiumContent}
            onChange={(html, markdown) => setPremiumContent(html)}
            placeholder="Premium content for NFT holders..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            background: loading ? '#64748b' : 'linear-gradient(to right, #9333ea, #06b6d4)',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Publishing...' : 'Publish Issue Now'}
        </button>
      </form>

      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid #991b1b',
            borderRadius: '4px',
            color: '#fca5a5',
            marginBottom: '20px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid #166534',
            borderRadius: '4px',
            color: '#86efac',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#86efac', fontSize: '20px', fontWeight: '600' }}>Issue Published Successfully</h3>
          <div style={{ fontSize: '14px', marginBottom: '15px', color: '#86efac' }}>
            <p>
              <strong>Transaction Hash:</strong>
              <br />
              <code style={{ fontSize: '12px', wordBreak: 'break-all', color: '#86efac' }}>
                {result.transactionDigest}
              </code>
            </p>
            <p>
              <strong>Walrus Blob ID:</strong>
              <br />
              <code style={{ fontSize: '12px', wordBreak: 'break-all', color: '#86efac' }}>
                {result.blobId || 'Not available'}
              </code>
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 18px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                View on SuiVision
              </a>
              <a
                href={`https://aggregator.walrus-testnet.walrus.space/v1/${result.blobId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 18px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                View Content on Walrus
              </a>
              <a
                href={`https://walruscan.com/testnet/blob/${result.blobId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 18px',
                  backgroundColor: '#06b6d4',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                View on Walruscan
              </a>
            </div>
          </div>
          <p style={{ fontSize: '14px', marginTop: '15px', color: '#86efac' }}>
            Content stored on Walrus, metadata on Sui - all gasless.
          </p>

          {!fetchedContent && (
            <button
              onClick={() => fetchContentFromWalrus(result.blobId)}
              disabled={fetchingContent}
              style={{
                marginTop: '15px',
                padding: '10px 18px',
                background: 'linear-gradient(to right, #9333ea, #06b6d4)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: fetchingContent ? 'not-allowed' : 'pointer',
                opacity: fetchingContent ? 0.7 : 1,
              }}
            >
              {fetchingContent ? 'Loading...' : 'Preview Published Content'}
            </button>
          )}

          {fetchedContent && (
            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              <h4 style={{ marginTop: 0, color: '#e2e8f0', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Published Content Preview
              </h4>
              <div
                style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: fetchedContent }}
              />
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default function TestIssuePage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#020617', color: '#ffffff' }}>Loading...</div>}>
      <TestIssueContent />
    </Suspense>
  );
}
