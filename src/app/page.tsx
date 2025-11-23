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
              <Link href="/test-gasless" className="btn-ghost">Launch App</Link>
            </div>
          </div>
        </nav>

        {/* Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="hero-content">
          {/* Your Existing Text Content */}
          <div className="relative z-10 text-center">
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

            {/* Sui Logo Badge */}
            <div className="sui-badge">
              <span className="powered-by-text">Powered by</span>
              <svg width="135" height="71" viewBox="0 0 465 244" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1988_12912)">
                  <path d="M406.16 150.768C406.16 157.388 404.7 162.898 401.83 167.148C398.99 171.408 395.42 174.608 391.21 176.668C387.04 178.728 382.88 179.778 378.86 179.778C372.18 179.778 366.6 177.478 362.3 172.948C358.02 168.398 355.86 162.188 355.86 154.488V84.8984H337V155.638C337 165.088 338.57 173.048 341.68 179.308C344.8 185.558 349.17 190.318 354.66 193.448C360.12 196.518 366.44 198.078 373.44 198.078C381.9 198.078 389.02 196.068 394.6 192.108C399.64 188.488 403.52 184.098 406.16 179.048V196.648H425.02V84.8984H406.16V150.778V150.768Z" fill="#6FBCF0"/>
                  <path d="M308.871 126.158C304.531 123.078 299.911 120.608 295.141 118.818C290.491 117.068 286.211 115.668 282.401 114.658L267.461 110.638C264.781 109.938 261.801 109.008 258.621 107.878C255.461 106.718 252.391 105.228 249.521 103.468C246.701 101.688 244.351 99.4586 242.531 96.8286C240.791 94.1986 239.911 90.9986 239.911 87.3086C239.911 82.8786 241.191 78.8686 243.721 75.3986C246.311 71.8886 249.981 69.0886 254.601 67.0786C259.311 65.0486 264.901 64.0186 271.211 64.0186C279.831 64.0186 287.191 65.9786 293.101 69.8586C298.911 73.6686 302.271 79.0986 303.091 85.9986L303.191 86.8786H322.261L322.221 85.8486C321.981 78.2886 319.601 71.4386 315.171 65.4986C310.801 59.5786 304.801 54.8586 297.351 51.4686C289.921 48.0386 281.311 46.3086 271.781 46.3086C262.251 46.3086 253.671 48.0686 246.001 51.5386C238.351 54.9786 232.161 59.8886 227.601 66.1486C223.061 72.3886 220.761 79.7986 220.761 88.1686C220.761 98.2786 224.241 106.578 231.091 112.838C237.841 119.008 247.111 123.818 258.641 127.138L276.651 132.288C281.721 133.698 286.511 135.368 290.881 137.248C295.151 139.088 298.641 141.498 301.251 144.428C303.781 147.268 305.071 151.038 305.071 155.628C305.071 160.708 303.561 165.208 300.571 169.008C297.551 172.808 293.381 175.828 288.191 177.998C282.951 180.168 276.881 181.268 270.131 181.268C260.601 181.268 252.421 179.048 245.811 174.678C239.251 170.308 235.421 164.098 234.421 156.228L234.331 155.348H215.261L215.311 156.378C215.761 164.598 218.421 171.948 223.211 178.228C228.051 184.548 234.601 189.488 242.681 192.918C250.811 196.368 260.091 198.118 270.291 198.118C280.491 198.118 289.551 196.318 297.291 192.768C305.081 189.198 311.181 184.178 315.451 177.828C319.741 171.458 321.911 163.998 321.911 155.628C321.911 145.518 318.431 137.218 311.581 130.958C304.831 124.788 295.561 119.978 284.031 116.658L266.021 111.508C260.951 110.098 256.161 108.428 251.791 106.548C247.521 104.708 244.031 102.298 241.421 99.3686C238.891 96.5286 237.601 92.7586 237.601 88.1686C237.601 83.0886 239.111 78.5886 242.101 74.7886C245.121 70.9886 249.291 67.9686 254.481 65.7986C259.721 63.6286 265.791 62.5286 272.531 62.5286C281.481 62.5286 288.841 64.5086 294.431 68.4186C299.971 72.2886 303.331 77.7186 304.411 84.5586L304.501 85.4386H323.571L323.521 84.4086C323.071 76.1886 320.411 68.8386 315.621 62.5586C310.781 56.2386 304.231 51.2986 296.151 47.8686C288.021 44.4186 278.741 42.6686 268.541 42.6686C258.341 42.6686 249.281 44.4686 241.541 48.0186C233.751 51.5886 227.651 56.6086 223.381 62.9586C219.091 69.3286 216.921 76.7886 216.921 85.1586C216.921 95.2686 220.401 103.568 227.251 109.828C234.001 115.998 243.271 120.808 254.801 124.128L272.811 129.278C277.881 130.688 282.671 132.358 287.041 134.238C291.311 136.078 294.801 138.488 297.411 141.418C299.941 144.258 301.231 148.028 301.231 152.618C301.231 157.698 299.721 162.198 296.731 165.998C293.711 169.798 289.541 172.818 284.351 174.988C279.111 177.158 273.041 178.258 266.291 178.258C257.341 178.258 249.981 176.278 244.391 172.368C238.851 168.498 235.491 163.068 234.411 156.228L234.321 155.348H215.251L215.301 156.378C215.751 164.598 218.411 171.948 223.201 178.228C228.041 184.548 234.591 189.488 242.671 192.918C250.801 196.368 260.081 198.118 270.281 198.118C280.481 198.118 289.541 196.318 297.281 192.768C305.071 189.198 311.171 184.178 315.441 177.828C319.731 171.458 321.901 163.998 321.901 155.628C321.901 145.518 318.421 137.218 311.571 130.958C304.821 124.788 295.551 119.978 284.021 116.658L308.871 126.158Z" fill="#6FBCF0"/>
                  <path d="M177.09 46.3086C167.56 46.3086 158.98 48.0686 151.31 51.5386C143.66 54.9786 137.47 59.8886 132.91 66.1486C128.37 72.3886 126.07 79.7986 126.07 88.1686C126.07 98.2786 129.55 106.578 136.4 112.838C143.15 119.008 152.42 123.818 163.95 127.138L181.96 132.288C187.03 133.698 191.82 135.368 196.19 137.248C200.46 139.088 203.95 141.498 206.56 144.428C209.09 147.268 210.38 151.038 210.38 155.628C210.38 160.708 208.87 165.208 205.88 169.008C202.86 172.808 198.69 175.828 193.5 177.998C188.26 180.168 182.19 181.268 175.44 181.268C165.91 181.268 157.73 179.048 151.12 174.678C144.56 170.308 140.73 164.098 139.73 156.228L139.64 155.348H120.57L120.62 156.378C121.07 164.598 123.73 171.948 128.52 178.228C133.36 184.548 139.91 189.488 147.99 192.918C156.12 196.368 165.4 198.118 175.6 198.118C185.8 198.118 194.86 196.318 202.6 192.768C210.39 189.198 216.49 184.178 220.76 177.828C225.05 171.458 227.22 163.998 227.22 155.628C227.22 145.518 223.74 137.218 216.89 130.958C210.14 124.788 200.87 119.978 189.34 116.658L171.33 111.508C166.26 110.098 161.47 108.428 157.1 106.548C152.83 104.708 149.34 102.298 146.73 99.3686C144.2 96.5286 142.91 92.7586 142.91 88.1686C142.91 83.0886 144.42 78.5886 147.41 74.7886C150.43 70.9886 154.6 67.9686 159.79 65.7986C165.03 63.6286 171.1 62.5286 177.84 62.5286C186.79 62.5286 194.15 64.5086 199.74 68.4186C205.28 72.2886 208.64 77.7186 209.72 84.5586L209.81 85.4386H228.88L228.83 84.4086C228.38 76.1886 225.72 68.8386 220.93 62.5586C216.09 56.2386 209.54 51.2986 201.46 47.8686C193.33 44.4186 184.05 42.6686 173.85 42.6686C163.65 42.6686 154.59 44.4686 146.85 48.0186C139.06 51.5886 132.96 56.6086 128.69 62.9586C124.4 69.3286 122.23 76.7886 122.23 85.1586C122.23 95.2686 125.71 103.568 132.56 109.828C139.31 115.998 148.58 120.808 160.11 124.128L178.12 129.278C183.19 130.688 187.98 132.358 192.35 134.238C196.62 136.078 200.11 138.488 202.72 141.418C205.25 144.258 206.54 148.028 206.54 152.618C206.54 157.698 205.03 162.198 202.04 165.998C199.02 169.798 194.85 172.818 189.66 174.988C184.42 177.158 178.35 178.258 171.6 178.258C162.65 178.258 155.29 176.278 149.7 172.368C144.16 168.498 140.8 163.068 139.72 156.228L139.63 155.348H120.56L120.61 156.378C121.06 164.598 123.72 171.948 128.51 178.228C133.35 184.548 139.9 189.488 147.98 192.918C156.11 196.368 165.39 198.118 175.59 198.118C185.79 198.118 194.85 196.318 202.59 192.768C210.38 189.198 216.48 184.178 220.75 177.828C225.04 171.458 227.21 163.998 227.21 155.628C227.21 145.518 223.73 137.218 216.88 130.958C210.13 124.788 200.86 119.978 189.33 116.658L177.09 46.3086Z" fill="#6FBCF0"/>
                  <path d="M93.4102 46.3086H74.5502V196.648H93.4102V46.3086Z" fill="#6FBCF0"/>
                  <path d="M0 84.8984V196.648H18.86V154.488C18.86 147.868 20.32 142.358 23.19 138.108C26.03 133.848 29.6 130.648 33.81 128.588C37.98 126.528 42.14 125.478 46.16 125.478C52.84 125.478 58.42 127.778 62.72 132.308C67 136.858 69.16 143.068 69.16 150.768V196.648H88.02V150.768C88.02 141.318 86.45 133.358 83.34 127.098C80.22 120.848 75.85 116.088 70.36 112.958C64.9 109.888 58.58 108.328 51.58 108.328C43.12 108.328 36 110.338 30.42 114.298C25.38 117.918 21.5 122.308 18.86 127.358V84.8984H0Z" fill="#6FBCF0"/>
                </g>
                <defs>
                  <clipPath id="clip0_1988_12912">
                    <rect width="465" height="244" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>

          {/* Dashboard Preview - Visual Hook */}
          <div className="dashboard-preview">
            <div className="browser-mockup">
              <div className="browser-header">
                <div className="browser-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="browser-url">epoch.app/dashboard</div>
              </div>
              <div className="browser-content">
                <div className="dashboard-mock">
                  <div className="dashboard-sidebar">
                    <div className="sidebar-item active">📝 My Newsletters</div>
                    <div className="sidebar-item">📊 Analytics</div>
                    <div className="sidebar-item">💎 NFT Access</div>
                    <div className="sidebar-item">⚙️ Settings</div>
                  </div>
                  <div className="dashboard-main">
                    <div className="dashboard-header">
                      <h3>Your Newsletters</h3>
                      <button className="create-btn">+ New Newsletter</button>
                    </div>
                    <div className="newsletter-cards">
                      <div className="mock-card">
                        <div className="card-badge">🟢 Published</div>
                        <h4>Crypto Weekly</h4>
                        <p>1,234 subscribers • 12 issues</p>
                      </div>
                      <div className="mock-card">
                        <div className="card-badge">✏️ Draft</div>
                        <h4>DeFi Insights</h4>
                        <p>0 subscribers • 0 issues</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
