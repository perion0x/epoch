'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { publishGaslessIssue } from '@/services/gasless-issue';

function TestIssueContent() {
  const searchParams = useSearchParams();
  const [newsletterId, setNewsletterId] = useState('');
  const [title, setTitle] = useState('');
  const [publicContent, setPublicContent] = useState('');
  const [premiumContent, setPremiumContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', minHeight: '100vh', backgroundColor: '#020617' }}>
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
      
      <h1 style={{ color: '#ffffff' }}>📝 Test Gasless Issue Publishing</h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
        Publish newsletter issues to Walrus + Sui without a wallet!
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#cbd5e1' }}>
            Public Content (Free)
          </label>
          <textarea
            value={publicContent}
            onChange={(e) => setPublicContent(e.target.value)}
            placeholder="Content visible to everyone..."
            required
            rows={6}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #475569',
              borderRadius: '4px',
              fontFamily: 'inherit',
              backgroundColor: '#1e293b',
              color: '#ffffff',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#cbd5e1' }}>
            Premium Content (Optional - NFT holders only)
          </label>
          <textarea
            value={premiumContent}
            onChange={(e) => setPremiumContent(e.target.value)}
            placeholder="Premium content for NFT holders..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #475569',
              borderRadius: '4px',
              fontFamily: 'inherit',
              backgroundColor: '#1e293b',
              color: '#ffffff',
            }}
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
          {loading ? 'Publishing...' : '🚀 Publish Issue (Gasless)'}
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
          <h3 style={{ marginTop: 0, color: '#86efac' }}>🎉 Issue published on Sui + Walrus!</h3>
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
                {result.blobId}
              </code>
            </p>
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              🔍 View on SuiVision
            </a>
          </div>
          <p style={{ fontSize: '14px', marginTop: '15px', color: '#86efac' }}>
            💡 Content stored on Walrus, metadata on Sui - all gasless!
          </p>
        </div>
      )}
    </div>
  );
}

export default function TestIssuePage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>}>
      <TestIssueContent />
    </Suspense>
  );
}
