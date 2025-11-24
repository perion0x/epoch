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
        minHeight: '400px',
        padding: '20px',
        backgroundColor: 'transparent', // Canvas feel
        border: '1px dashed #334155',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ 
        width: '24px', 
        height: '24px', 
        border: '2px solid #334155', 
        borderTopColor: '#8b5cf6', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
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
  
  // Track active field for "Focus Mode"
  const [activeField, setActiveField] = useState<'title' | 'public' | 'premium' | null>(null);

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

      const previewHtml = publicContent + 
        (premiumContent ? `<div class="premium-content-unlocked" style="margin-top: 30px; padding-top: 30px; border-top: 1px dashed #334155;"><h3>Premium Content (Public Preview)</h3>${premiumContent}</div>` : '');

      setResult({ ...response, previewContent: previewHtml });
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
      
      if (!response.ok) {
        if (response.status === 404) {
          setFetchedContent('<div style="color: #fca5a5; padding: 20px; text-align: center;"><strong>Content Not Found</strong><br/><br/>The blob may still be propagating through the Walrus network. This can take a few minutes.<br/><br/>Try refreshing in a moment, or check Walruscan for blob status.</div>');
        } else {
          setFetchedContent(`<div style="color: #fca5a5; padding: 20px; text-align: center;"><strong>Error ${response.status}</strong><br/><br/>Failed to fetch content from Walrus.</div>`);
        }
        return;
      }
      
      const content = await response.text();
      setFetchedContent(content);
    } catch (err) {
      console.error('Failed to fetch content from Walrus:', err);
      setFetchedContent('<div style="color: #fca5a5; padding: 20px; text-align: center;"><strong>Network Error</strong><br/><br/>Could not connect to Walrus. Please check your internet connection.</div>');
    } finally {
      setFetchingContent(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' }}>
      <style jsx global>{`
        /* Focus Mode Styles */
        .editor-wrapper .koenig-toolbar {
          transition: opacity 0.3s ease;
          opacity: 0.4; /* Dimmed by default */
          margin-bottom: 16px; /* Gap between toolbar and text */
        }
        
        .editor-wrapper.active .koenig-toolbar {
          opacity: 1; /* Full visibility when active */
        }

        /* Override default editor styles for canvas feel */
        .koenig-editor-container {
          border: none !important;
          background: transparent !important;
        }
        
        .koenig-editor-input {
          padding: 0 !important;
          min-height: 200px;
          font-size: 1.1rem;
          line-height: 1.7;
          color: #e2e8f0;
          position: relative;
          z-index: 1;
        }

        /* Placeholder styling */
        .koenig-editor-placeholder {
          color: #475569 !important;
          font-size: 1.1rem !important;
          line-height: 1.7 !important;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 0;
        }
        
        /* Ensure the inner container has relative positioning for absolute placeholder */
        .koenig-editor-inner {
          position: relative;
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <a
        href="/"
        style={{
          display: 'inline-block',
          marginBottom: '40px',
          padding: '8px 16px',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          color: '#94a3b8',
          textDecoration: 'none',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
          e.currentTarget.style.color = '#f8fafc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
          e.currentTarget.style.color = '#94a3b8';
        }}
      >
        ← Back to Home
      </a>
      
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '42px', marginBottom: '12px', fontWeight: '800', letterSpacing: '-0.02em' }}>
          Publish Your Issue
        </h1>
        <p style={{ color: 'rgba(148, 163, 184, 0.9)', fontSize: '18px', lineHeight: '1.6', maxWidth: '600px' }}>
          Create and publish your issue with a professional editor. Your content is secured on Sui and powered by Walrus storage.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* 1. Title - The "Canvas" Header */}
        <div style={{ marginBottom: '40px' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Issue Title"
            required
            style={{
              width: '100%',
              padding: '0',
              fontSize: '42px',
              fontWeight: '800',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ffffff',
              outline: 'none',
              letterSpacing: '-0.02em',
            }}
            onFocus={() => setActiveField('title')}
            onBlur={() => setActiveField(null)}
          />
        </div>

        {/* 2. Public Content - Free Section */}
        <div 
          className={`editor-wrapper ${activeField === 'public' ? 'active' : ''}`}
          style={{ marginBottom: '60px' }}
          onFocus={() => setActiveField('public')}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setActiveField(null);
            }
          }}
        >
          <label style={{ display: 'block', marginBottom: '16px', fontWeight: '600', color: '#94a3b8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Public Content (Free)
          </label>
          <KoenigEditor
            initialValue={publicContent}
            onChange={(html: string) => setPublicContent(html)}
            placeholder="Write your public intro here..."
          />
        </div>

        {/* 3. Premium Content - Distinctive "Locked" Section */}
        <div 
          className={`editor-wrapper ${activeField === 'premium' ? 'active' : ''}`}
          style={{ 
            marginBottom: '60px',
            paddingLeft: '24px',
            borderLeft: '4px solid #8b5cf6', // Purple border for premium distinction
            marginLeft: '-28px' // Pull out to align text with public content
          }}
          onFocus={() => setActiveField('premium')}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setActiveField(null);
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px' }}>🔒</span>
            <label style={{ fontWeight: '600', color: '#a78bfa', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Premium Content (NFT Holders Only)
            </label>
          </div>
          <KoenigEditor
            initialValue={premiumContent}
            onChange={(html: string) => setPremiumContent(html)}
            placeholder="Add your exclusive analysis, alpha, or deep dive here..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '64px', // Taller button
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            background: loading ? '#334155' : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            border: 'none',
            borderRadius: '12px', // Rounder
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
            marginBottom: '40px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.filter = 'brightness(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
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
          ) : 'Publish Issue Now'}
        </button>

        {/* 4. Content ID - Demoted to Bottom (Advanced) */}
        <div style={{ 
          borderTop: '1px solid #334155', 
          paddingTop: '24px',
          marginTop: '40px'
        }}>
          <details style={{ color: '#64748b', cursor: 'pointer' }}>
            <summary style={{ fontSize: '14px', fontWeight: '500', userSelect: 'none' }}>
              Advanced: Content ID / Settings
            </summary>
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b', fontSize: '12px' }}>
                Content ID (On-Chain) {newsletterId && '✅'}
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
                  fontSize: '12px',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  backgroundColor: '#0f172a',
                  color: '#94a3b8',
                  outline: 'none',
                }}
              />
            </div>
          </details>
        </div>

      </form>

      {error && (
        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid #991b1b',
            borderRadius: '8px',
            color: '#fca5a5',
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
                border: '1px solid #334155',
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
                  color: '#ffffff',
                  fontSize: '28px', 
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  Issue Published Successfully!
                </h3>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '16px',
                  margin: 0
                }}>
                  Content stored on Walrus, metadata on Sui
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
                  href={`/test-read?issueId=${result.issueId}`}
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
                  Read Issue →
                </a>
              </div>

              {/* Footer Links */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '20px',
                paddingTop: '16px', 
                borderTop: '1px solid #1e293b' 
              }}>
                <a
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  View on SuiVision ↗
                </a>
                <a
                  href={`https://walruscan.com/testnet/blob/${result.blobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#22d3ee',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  View on WalrusScan ↗
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
  );
}

export default function TestIssuePage() {
  return (
    <Suspense fallback={<div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#020617', 
      color: '#ffffff' 
    }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        border: '3px solid rgba(255,255,255,0.3)', 
        borderTopColor: '#ffffff', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
    </div>}>
      <TestIssueContent />
    </Suspense>
  );
}
