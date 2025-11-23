'use client';

import { useState } from 'react';
import { createGaslessNewsletter } from '@/services/gasless-newsletter';

/**
 * Test page for gasless newsletter creation
 * This is a simple test interface - not for production
 */
export default function TestGaslessPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', minHeight: '100vh', backgroundColor: '#020617' }}>
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
      <h1 style={{ color: '#ffffff' }}>🚀 Test Gasless Newsletter Creation</h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
        Create a newsletter without connecting a wallet or paying gas fees!
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#cbd5e1' }}>
            Newsletter Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter newsletter title..."
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
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your newsletter..."
            required
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
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
          {loading ? 'Creating...' : '✨ Create Newsletter (Gasless)'}
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
          <h3 style={{ marginTop: 0, color: '#86efac' }}>🎉 You have created a newsletter on Sui!</h3>
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
              <a
                href={`/test-issue?newsletterId=${result.newsletterId}`}
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                📝 Publish First Issue →
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
            💡 No wallet connected, no gas fees paid!
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '15px',
          backgroundColor: '#1e293b',
          border: '1px solid #475569',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#cbd5e1' }}>ℹ️ How it works:</h4>
        <ol style={{ paddingLeft: '20px', margin: 0, color: '#94a3b8' }}>
          <li>A temporary keypair is generated for you</li>
          <li>Transaction is built and signed with your keypair</li>
          <li>Platform sponsors the gas fees</li>
          <li>Newsletter is created on Sui blockchain</li>
        </ol>
      </div>
    </div>
  );
}
