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
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <a
        href="/"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          color: '#333',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        ← Back to Home
      </a>
      <h1>🚀 Test Gasless Newsletter Creation</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Create a newsletter without connecting a wallet or paying gas fees!
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
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
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
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
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
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
            backgroundColor: loading ? '#999' : '#007bff',
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
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00',
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
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '4px',
            color: '#060',
          }}
        >
          <h3 style={{ marginTop: 0 }}>🎉 You have created a newsletter on Sui!</h3>
          <div style={{ fontSize: '14px', marginBottom: '15px' }}>
            <p>
              <strong>Newsletter ID:</strong>
              <br />
              <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                {result.newsletterId}
              </code>
            </p>
            <p>
              <strong>Transaction Hash:</strong>
              <br />
              <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
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
          <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#555' }}>
            <p>
              <strong>Your Address:</strong>
              <br />
              <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                {result.userAddress}
              </code>
            </p>
          </div>
          <p style={{ fontSize: '14px', marginTop: '15px', color: '#666' }}>
            💡 No wallet connected, no gas fees paid!
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <h4 style={{ marginTop: 0 }}>ℹ️ How it works:</h4>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          <li>A temporary keypair is generated for you</li>
          <li>Transaction is built and signed with your keypair</li>
          <li>Platform sponsors the gas fees</li>
          <li>Newsletter is created on Sui blockchain</li>
        </ol>
      </div>
    </div>
  );
}
