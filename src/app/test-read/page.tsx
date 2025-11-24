'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getUserId } from '@/services/gasless-newsletter';

function TestReadContent() {
  const searchParams = useSearchParams();
  const [issueId, setIssueId] = useState('');
  const [issue, setIssue] = useState<any>(null);
  const [publicContent, setPublicContent] = useState('');
  const [premiumContent, setPremiumContent] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  useEffect(() => {
    const id = searchParams.get('issueId');
    if (id) {
      setIssueId(id);
    }
  }, [searchParams]);

  const loadIssue = async () => {
    if (!issueId) return;
    setLoading(true);
    setError(null);
    setIssue(null);
    setPublicContent('');
    setPremiumContent('');
    setDecryptedContent('');
    setNeedsSubscription(false);

    try {
      // 1. Get Issue Metadata from Sui
      const rpcUrl = 'https://fullnode.testnet.sui.io:443';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sui_getObject',
          params: [issueId, { showContent: true }]
        })
      });
      
      const data = await response.json();
      if (data.error || !data.result || data.result.error) {
        throw new Error('Issue not found');
      }
      
      const fields = data.result.data.content.fields;
      const walrusBlobId = fields.walrus_blob_id;
      const hasPremium = fields.has_premium;
      const newsletterId = fields.newsletter_id;
      
      let blobIdStr = walrusBlobId;
      if (Array.isArray(walrusBlobId)) {
         blobIdStr = new TextDecoder().decode(new Uint8Array(walrusBlobId));
      }

      setIssue({
        id: issueId,
        newsletterId,
        walrusBlobId: blobIdStr,
        hasPremium,
        title: fields.title
      });

      // 2. Fetch Content from Walrus
      const walrusRes = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/${blobIdStr}`);
      if (!walrusRes.ok) throw new Error('Failed to fetch content from Walrus');
      
      const contentBytes = await walrusRes.arrayBuffer();
      const text = new TextDecoder().decode(contentBytes);
      const storedContent = JSON.parse(text);
      
      const publicSec = storedContent.sections.find((s: any) => s.type === 'public');
      const premiumSec = storedContent.sections.find((s: any) => s.type === 'premium');
      
      if (publicSec) {
        const pubText = new TextDecoder().decode(new Uint8Array(publicSec.content));
        setPublicContent(pubText);
      }
      
      if (premiumSec) {
        const premText = new TextDecoder().decode(new Uint8Array(premiumSec.content));
        setPremiumContent(premText);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!issue || !premiumContent) return;
    setUnlocking(true);
    setError(null);
    
    try {
      const userId = getUserId();
      
      const res = await fetch('/api/gasless/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newsletterId: issue.newsletterId,
          issueId: issue.id,
          encryptedContent: premiumContent
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) {
          setNeedsSubscription(true);
          return;
        }
        throw new Error(data.error || 'Decryption failed');
      }
      
      setDecryptedContent(data.decryptedContent);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUnlocking(false);
    }
  };

  const handleSubscribe = async () => {
    if (!issue) return;
    setSubscribing(true);
    setError(null);
    
    try {
      const userId = getUserId();
      
      const res = await fetch('/api/gasless/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newsletterId: issue.newsletterId
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed');
      }
      
      setNeedsSubscription(false);
      handleDecrypt();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#ffffff', marginBottom: '30px', textAlign: 'center' }}>Read Issue (Gasless Demo)</h1>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
          <input
            type="text"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
            placeholder="Enter Issue ID..."
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: 'white',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={loadIssue}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '15px', background: 'rgba(220, 38, 38, 0.1)', color: '#fca5a5', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {issue && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', padding: '40px', border: '1px solid #334155' }}>
            <h2 style={{ color: 'white', marginTop: 0, fontSize: '32px' }}>{issue.title}</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Published on Sui • Stored on Walrus</p>
            
            <div 
              style={{ color: '#e2e8f0', lineHeight: '1.8', fontSize: '18px' }}
              dangerouslySetInnerHTML={{ __html: publicContent }}
            />

            {issue.hasPremium && (
              <div style={{ marginTop: '40px', borderTop: '1px solid #334155', paddingTop: '40px' }}>
                <div style={{ 
                  background: decryptedContent ? 'rgba(22, 163, 74, 0.1)' : 'rgba(15, 23, 42, 0.8)', 
                  border: decryptedContent ? '1px solid #16a34a' : '1px solid #334155',
                  borderRadius: '12px',
                  padding: '30px'
                }}>
                  <h3 style={{ color: decryptedContent ? '#4ade80' : '#fbbf24', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {decryptedContent ? '🔓 Premium Content Unlocked' : '🔒 Premium Content Locked'}
                  </h3>
                  
                  {decryptedContent ? (
                    <div 
                      style={{ color: '#e2e8f0', lineHeight: '1.8', fontSize: '18px' }}
                      dangerouslySetInnerHTML={{ __html: decryptedContent }}
                    />
                  ) : (
                    <div>
                      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                        This content is encrypted on Walrus and requires a subscription to decrypt via Seal.
                      </p>
                      
                      {needsSubscription ? (
                        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                          <p style={{ color: 'white', marginBottom: '15px', fontWeight: 'bold' }}>You need a subscription to view this.</p>
                          <button
                            onClick={handleSubscribe}
                            disabled={subscribing}
                            style={{
                              padding: '12px 24px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                              color: 'white',
                              border: 'none',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontSize: '16px'
                            }}
                          >
                            {subscribing ? 'Subscribing...' : 'Subscribe for Free (Gasless)'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleDecrypt}
                          disabled={unlocking}
                          style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '8px',
                            background: '#334155',
                            color: 'white',
                            border: '1px solid #475569',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          {unlocking ? 'Verifying Access with Seal...' : 'Unlock Content'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestReadPage() {
  return (
    <Suspense fallback={<div style={{ color: 'white', padding: '20px' }}>Loading...</div>}>
      <TestReadContent />
    </Suspense>
  );
}