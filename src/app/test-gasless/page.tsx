'use client';

import { useState } from 'react';
import { createGaslessNewsletter } from '@/services/gasless-newsletter';
import dynamic from 'next/dynamic';

// Dynamically import Koenig editor to avoid SSR issues
const KoenigEditor = dynamic(() => import('@/components/KoenigEditor').then((mod) => ({ default: mod.KoenigEditor })), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '200px',
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

/**
 * Test page for gasless newsletter creation
 * This is a simple test interface - not for production
 */
export default function TestGaslessPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await createGaslessNewsletter({
        title,
        description,
        accessModel: {
          isFree: true,
          isNftGated: false,
          isHybrid: false,
        },
      });

      setResult(response);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '50px 20px' }}>
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
        Launch Your Newsletter, Gas-Free
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '18px', lineHeight: '1.6' }}>
        Start publishing on Sui without connecting a wallet or paying transaction fees. Own your content from day one.
      </p>

      <form 
        onSubmit={handleSubmit} 
        style={{ 
          marginBottom: '30px',
          backgroundColor: '#0f172a',
          padding: '32px',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
            Newsletter Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Newsletter"
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '16px',
              border: '2px solid #334155',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              transition: 'border-color 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#334155'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
            Custom Handle <span style={{ color: '#64748b', fontWeight: '400' }}>(Optional)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>epoch.app/</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="your-handle"
              style={{
                flex: 1,
                padding: '12px 14px',
                fontSize: '16px',
                border: '2px solid #334155',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                transition: 'border-color 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
            Description
          </label>
          <KoenigEditor
            initialValue={description}
            onChange={(html, markdown) => setDescription(html)}
            placeholder="What will you write about? Describe your newsletter..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            background: loading ? '#64748b' : 'linear-gradient(to right, #9333ea, #06b6d4)',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          {loading ? 'Creating...' : 'Launch Newsletter for Free'}
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
          <h3 style={{ marginTop: 0, color: '#86efac', fontSize: '20px', fontWeight: '600' }}>Newsletter Created Successfully</h3>
          <div style={{ fontSize: '14px', marginBottom: '15px', color: '#86efac' }}>
            <p>
              <strong>Newsletter ID:</strong>
              <br />
              <code style={{ fontSize: '12px', wordBreak: 'break-all', color: '#86efac' }}>
                {result.newsletterId}
              </code>
            </p>
            <p>
              <strong>Transaction Hash:</strong>
              <br />
              <code style={{ fontSize: '12px', wordBreak: 'break-all', color: '#86efac' }}>
                {result.transactionDigest}
              </code>
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
              <a
                href={`https://testnet.suivision.xyz/txblock/${result.transactionDigest}`}
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
                href={`/test-issue?newsletterId=${result.newsletterId}`}
                style={{
                  display: 'inline-block',
                  padding: '10px 18px',
                  background: 'linear-gradient(to right, #9333ea, #06b6d4)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Publish First Issue →
              </a>
            </div>
          </div>
          <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#86efac' }}>
            <p>
              <strong>Your Address:</strong>
              <br />
              <code style={{ fontSize: '11px', wordBreak: 'break-all', color: '#86efac' }}>
                {result.userAddress}
              </code>
            </p>
          </div>
          <p style={{ fontSize: '14px', marginTop: '15px', color: '#86efac' }}>
            No wallet connected, no gas fees paid.
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#e2e8f0', fontSize: '16px', fontWeight: '600' }}>
          How it works
        </h4>
        <ol style={{ paddingLeft: '20px', margin: 0, color: '#94a3b8', lineHeight: '1.8' }}>
          <li>A temporary <strong style={{ color: '#cbd5e1' }}>keypair</strong> is generated for you</li>
          <li>Transaction is built and signed with your keypair</li>
          <li><strong style={{ color: '#cbd5e1' }}>Platform sponsors the gas fees</strong></li>
          <li>Newsletter is created on <strong style={{ color: '#cbd5e1' }}>Sui blockchain</strong></li>
        </ol>
      </div>
      </div>
    </div>
  );
}
