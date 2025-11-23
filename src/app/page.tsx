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
            Turn your audience into a<br />
            <span className="gradient-text">SOVEREIGNTY</span>
          </h1>
          
          <p className="hero-description">
            Epoch is the decentralized publishing platform for creators who value ownership, 
            censorship-resistance, and true independence. Built on Sui blockchain with Walrus storage.
          </p>

          <div className="sui-badge">
            <div className="powered-by-text">POWERED BY</div>
            <svg width="120" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 464c-114.7 0-208-93.3-208-208S141.3 48 256 48s208 93.3 208 208-93.3 208-208 208z" fill="#4DA2FF"/>
              <path d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 272c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z" fill="#4DA2FF"/>
              <path d="M256 176c-44.2 0-80 35.8-80 80s35.8 80 80 80 80-35.8 80-80-35.8-80-80-80z" fill="#6FB1FF"/>
            </svg>
            <span className="sui-text">Sui</span>
          </div>

          <div className="hero-actions">
            <Link href="/test-gasless" className="btn-black">
              START FREE
            </Link>
            <Link href="#how-it-works" className="btn-link">
              See how it works →
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
          <p>© 2024 Epoch Foundation</p>
          <p>Powered by Sui</p>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
