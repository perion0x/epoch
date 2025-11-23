'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo">Epoch</div>
            <div className="nav-links">
              <Link href="/newsletters">Browse</Link>
              <Link href="/test-gasless" className="btn-primary">Start Free</Link>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="badge">
            <span className="status-dot"></span>
            Protocol V1 Live
          </div>
          
          <h1 className="hero-title">
            Publish Without{' '}
            <span className="gradient-text wave-text">
              {Array.from('Permission').map((char, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                  {char}
                </span>
              ))}
            </span>
          </h1>
          
          <p className="hero-description">
            Become a sovereign creator. The first newsletter platform built on Sui where you truly own your work. Uncensorable, immutable, and impossible to deplatform.
          </p>

          <div className="hero-actions">
            <Link href="/test-gasless" className="btn-black">
              Start For Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-main">
            <h2>The Tech Stack</h2>
            <h3>Built on the decentralized web.</h3>
            <p>
              Your content lives on Walrus decentralized storage. Your ownership is tracked on Sui blockchain. 
              Your access control is managed by Seal. No single point of failure. No censorship. Forever.
            </p>
            <Link href="/whitepaper" className="link-arrow">
              Read Whitepaper →
            </Link>
          </div>

          <div className="feature-cards">
            <div className="feature-card">
              <div className="card-icon">⚡</div>
              <h4>Powered by Sui</h4>
              <p>Instant transactions, minimal fees</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">💾</div>
              <h4>Stored on Walrus</h4>
              <p>Decentralized, permanent storage</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">🛡️</div>
              <h4>Secured by Seal</h4>
              <p>Cryptographic access control</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">🔐</div>
              <h4>Crypto Native</h4>
              <p>Built-in payments & ownership</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Today, it's your turn.</h2>
        <p>Join the decentralized publishing revolution</p>
        <Link href="/test-gasless" className="btn-black">
          Start Publishing
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>Product</h4>
            <Link href="/creators">Creator</Link>
            <Link href="/walrus">Walrus</Link>
            <Link href="/seal">Seal</Link>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <Link href="/tutorials">Tutorials</Link>
            <Link href="/move">Move</Link>
            <Link href="/protocol">Protocol</Link>
          </div>
          <div className="footer-column">
            <h4>Comparisons</h4>
            <Link href="/vs-substack">vs Substack</Link>
            <Link href="/vs-ghost">vs Ghost</Link>
            <Link href="/vs-medium">vs Medium</Link>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <Link href="/help">Help Center</Link>
            <Link href="/discord">Discord</Link>
            <div className="status">
              <span className="status-dot"></span>
              Operational
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-left">
            <p>© 2024 Epoch Foundation</p>
            <Link href="/terms">Terms</Link>
          </div>
          <div className="footer-tech-stack">
            <span className="tech-item">Powered by Sui</span>
            <span className="tech-separator">•</span>
            <span className="tech-item">Secured by Seal</span>
            <span className="tech-separator">•</span>
            <span className="tech-item">Stored on Walrus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
