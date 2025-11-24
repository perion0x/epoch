'use client';

// KoenigEditor import removed
import { useState } from 'react';
import { createGaslessNewsletter } from '@/services/gasless-newsletter';

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
    <div className="gasless-page-container" style={{ minHeight: '100vh', backgroundColor: '#020617', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {/* Navigation */}
      <div style={{ padding: '20px 40px', borderBottom: '1px solid #1e293b', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <span>←</span> Back to Home
        </a>
      </div>

      {/* Two-Column Layout */}
      <div 
        className="two-column-layout"
        style={{ 
          minHeight: 'calc(100vh - 73px)',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'
        }}
      >
        
        {/* Left Column - Value Proposition */}
        <div style={{ 
          padding: '40px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'
        }}>
          <div style={{ maxWidth: '540px' }}>
            <h1 style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              marginBottom: '24px', 
              fontWeight: '700',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              Launch Your Newsletter
            </h1>
            
            <p style={{ 
              color: '#94a3b8', 
              marginBottom: '48px', 
              fontSize: '18px', 
              lineHeight: '1.7',
              fontWeight: '400'
            }}>
              Start publishing on Sui without connecting a wallet or paying transaction fees. Own your content from day one.
            </p>

            {/* Platform Features */}
            <div style={{ marginTop: '48px' }}>
              <h3 style={{ 
                color: '#e2e8f0', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Platform Features
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                The Gas-Free Advantage
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '24px' }}>🔑</span>
                  </div>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '4px' }}>
                      Login Without a Wallet
                    </div>
                    <div style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                      A secure keypair is generated for your session, letting you start publishing <em>instantly</em> without a traditional crypto wallet setup.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '24px' }}>⛽</span>
                  </div>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '4px' }}>
                      Gas-Free Forever
                    </div>
                    <div style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                      Your platform sponsors all Sui network fees. No wallet needed, <strong>no transaction costs</strong>—ever—for you or your readers.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '24px' }}>🔗</span>
                  </div>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '4px' }}>
                      Immutable Content Ownership
                    </div>
                    <div style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                      Your newsletter is published directly on the <strong>Sui Blockchain</strong>, ensuring your content is decentralized, immutable, and truly yours from day one.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div style={{ 
          padding: '40px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'
        }}>
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <form 
              onSubmit={handleSubmit} 
              style={{ 
                backgroundColor: '#0f172a',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid #1e293b',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                minHeight: '400px', // Reduced - no heavy editor loading
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
                    border: '2px solid #1e293b',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.boxShadow = '0 0 0 1px rgba(139, 92, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
                  Custom Handle <span style={{ color: '#64748b', fontWeight: '400' }}>(Optional)</span>
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'stretch',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  backgroundColor: '#1e293b'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#8b5cf6';
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139, 92, 246, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1e293b';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <span style={{ 
                    padding: '12px 14px',
                    backgroundColor: '#0f172a',
                    color: '#64748b', 
                    fontSize: '16px', 
                    fontWeight: '500',
                    borderRight: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    epoch.app/
                  </span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="your-handle"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      fontSize: '16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      outline: 'none',
                    }}
                  />
                </div>
                <p style={{ marginTop: '6px', fontSize: '13px', color: '#64748b' }}>
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>
                  Short Description <span style={{ color: '#64748b', fontWeight: '400' }}>(For SEO & Previews)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is your newsletter about?"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '16px',
                    border: '2px solid #1e293b',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.boxShadow = '0 0 0 1px rgba(139, 92, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  background: loading ? '#64748b' : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.filter = 'none';
                }}
              >
                {loading ? (
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    border: '3px solid rgba(255,255,255,0.3)', 
                    borderTopColor: '#ffffff', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                ) : 'Launch Newsletter for Free'}
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
        <>
          {/* Modal Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setResult(null)}
          >
            {/* Modal Content */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155', // Changed from Green to Theme Border
                borderRadius: '16px',
                padding: '40px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '64px', 
                  marginBottom: '16px',
                  animation: 'bounce 1s ease-in-out'
                }}>
                  🎉
                </div>
                <h3 style={{ 
                  margin: 0, 
                  color: '#ffffff', // Changed from Green to White
                  fontSize: '28px', 
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  Newsletter Created Successfully!
                </h3>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '16px',
                  margin: 0
                }}>
                  Your newsletter is now live on Sui blockchain
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <a
                  href={`/test-issue?newsletterId=${result.newsletterId}`}
                  style={{
                    display: 'block',
                    padding: '14px 24px',
                    background: 'linear-gradient(to right, #9333ea, #06b6d4)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  Publish First Issue →
                </a>
              </div>

              {/* View on SuiVision Link */}
              <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <a
                  href={`https://testnet.suivision.xyz/txblock/${result.transactionDigest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  View on SuiVision ↗
                </a>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setResult(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>
        </>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
