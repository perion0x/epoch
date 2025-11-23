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
              <Link href="/test-gasless" className="btn-primary">
                Start For Free
              </Link>
            </div>

            {/* Tech Stack Logos */}
            <div className="tech-stack-badge">
              <span className="powered-by-text">Powered by</span>
              <div className="logos-container">
                {/* Sui Logo */}
                <svg height="50" width="auto" viewBox="0 0 465 244" fill="none" xmlns="http://www.w3.org/2000/svg" className="tech-logo">
                  <g clipPath="url(#clip0_sui)">
                    <path d="M406.16 150.768C406.16 157.388 404.7 162.898 401.83 167.148C398.99 171.408 395.42 174.608 391.21 176.668C387.04 178.728 382.88 179.778 378.86 179.778C372.18 179.778 366.6 177.478 362.3 172.948C358.02 168.398 355.86 162.188 355.86 154.488V84.8984H337V155.638C337 165.088 338.57 173.048 341.68 179.308C344.8 185.558 349.17 190.318 354.66 193.448C360.12 196.518 366.44 198.078 373.44 198.078C381.9 198.078 389.02 196.068 394.6 192.108C399.64 188.488 403.52 184.098 406.16 179.048V196.648H425.02V84.8984H406.16V150.778V150.768Z" fill="#ffffff"/>
                    <path d="M308.871 126.158C304.531 123.078 299.911 120.608 295.141 118.818C290.491 117.068 286.211 115.668 282.401 114.658L267.461 110.638C264.781 109.938 261.801 109.008 258.621 107.878C255.461 106.718 252.391 105.228 249.521 103.468C246.701 101.688 244.351 99.4586 242.531 96.8286C240.791 94.1986 239.911 90.9986 239.911 87.3086C239.911 82.8786 241.191 78.8686 243.721 75.3986C246.311 71.8886 249.981 69.0886 254.601 67.0786C259.311 65.0486 264.901 64.0186 271.211 64.0186C279.831 64.0186 287.191 65.9786 293.101 69.8586C298.911 73.6686 302.271 79.0986 303.091 85.9986L303.191 86.8786H322.261L322.221 85.8486C321.981 78.2886 319.601 71.4386 315.171 65.4986C310.801 59.5786 304.801 54.8586 297.351 51.4686C289.921 48.0386 281.311 46.3086 271.781 46.3086C262.251 46.3086 253.671 48.0686 246.001 51.5386C238.351 54.9786 232.161 59.8886 227.601 66.1486C223.061 72.3886 220.761 79.7986 220.761 88.1686C220.761 98.2786 224.241 106.578 231.091 112.838C237.841 119.008 247.111 123.818 258.641 127.138L276.651 132.288C281.721 133.698 286.511 135.368 290.881 137.248C295.151 139.088 298.641 141.498 301.251 144.428C303.781 147.268 305.071 151.038 305.071 155.628C305.071 160.708 303.561 165.208 300.571 169.008C297.551 172.808 293.381 175.828 288.191 177.988C282.961 180.118 276.951 181.198 270.351 181.198C264.681 181.198 259.301 180.348 254.391 178.678C249.571 176.978 245.521 174.378 242.371 170.948C239.291 167.508 237.501 163.088 237.051 157.808L236.971 156.898H216.691L216.771 157.968C217.351 166.118 219.891 173.388 224.321 179.558C228.791 185.728 234.981 190.598 242.731 194.038C250.491 197.458 259.791 199.198 270.361 199.198C281.701 199.198 291.491 197.268 299.441 193.458C307.481 189.628 313.681 184.388 317.851 177.878C322.081 171.358 324.231 163.968 324.231 155.898C324.231 148.888 322.761 142.878 319.871 138.028C317.001 133.208 313.301 129.218 308.871 126.148V126.158Z" fill="#ffffff"/>
                    <path d="M464.422 56.1644C464.422 52.7444 463.112 49.7844 460.542 47.3644C458.022 44.9544 454.962 43.7344 451.422 43.7344C447.882 43.7344 444.802 44.9544 442.232 47.3744C439.702 49.7944 438.422 52.7544 438.422 56.1744C438.422 59.5944 439.702 62.5444 442.242 64.9744C444.802 67.3844 447.892 68.6044 451.432 68.6044C454.972 68.6044 457.742 67.4944 460.182 65.3144L460.292 65.2144C460.382 65.1344 460.472 65.0544 460.562 64.9644L460.922 64.6144C463.262 62.2544 464.442 59.4144 464.442 56.1644H464.422Z" fill="#ffffff"/>
                    <path d="M460.7 84.8867H441.84V196.637H460.7V84.8867Z" fill="#ffffff"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M151.94 101.336C161.84 113.766 167.76 129.486 167.76 146.586C167.76 163.686 161.66 179.886 151.5 192.386L150.62 193.466L150.39 192.096C150.19 190.936 149.96 189.756 149.69 188.576C144.6 166.216 128.02 147.046 100.73 131.516C82.3 121.056 71.75 108.476 68.98 94.1661C67.19 84.9161 68.52 75.6261 71.09 67.6661C73.66 59.7161 77.48 53.0461 80.73 49.0361L91.35 36.0561C93.21 33.7761 96.7 33.7761 98.56 36.0561L151.95 101.336H151.94ZM168.73 88.3661L97.57 1.36609C96.21 -0.293906 93.67 -0.293906 92.31 1.36609L21.16 88.3661L20.93 88.6561C7.84 104.906 0 125.556 0 148.036C0 200.386 42.51 242.826 94.94 242.826C147.37 242.826 189.88 200.386 189.88 148.036C189.88 125.556 182.04 104.906 168.95 88.6661L168.72 88.3761L168.73 88.3661ZM38.19 101.056L44.55 93.2661L44.74 94.7061C44.89 95.8461 45.08 96.9861 45.3 98.1361C49.42 119.746 64.13 137.756 88.72 151.706C110.1 163.876 122.55 177.866 126.13 193.206C127.63 199.606 127.89 205.906 127.24 211.416L127.2 211.756L126.89 211.906C117.24 216.616 106.39 219.266 94.93 219.266C54.72 219.266 22.12 186.726 22.12 146.576C22.12 129.336 28.13 113.506 38.17 101.036L38.19 101.056Z" fill="#ffffff"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_sui">
                      <rect width="465" height="243" fill="white" transform="translate(0 0.117188)"/>
                    </clipPath>
                  </defs>
                </svg>

                {/* Walrus Logo */}
                <img 
                  src="/images/walrus.svg" 
                  alt="Walrus" 
                  className="tech-logo"
                />

                {/* Seal Logo */}
                <img 
                  src="/images/seal.svg" 
                  alt="Seal" 
                  className="tech-logo"
                />
              </div>
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
                    <div className="sidebar-section-title">Content</div>
                    <div className="sidebar-item active">📊 Dashboard</div>
                    <div className="sidebar-item">📝 Posts</div>
                    <div className="sidebar-item">👥 Members</div>
                    <div className="sidebar-item">💰 Offers</div>
                    <div className="sidebar-section-title">Protocol</div>
                    <div className="sidebar-item">⛓️ Sui Explorer</div>
                    <div className="sidebar-item">💎 NFT Access</div>
                    <div className="sidebar-item">⚙️ Settings</div>
                  </div>
                  <div className="dashboard-main">
                    <div className="dashboard-header">
                      <h3>Dashboard</h3>
                      <button className="create-btn">+ New Post</button>
                    </div>

                    {/* New Subscriber Notification */}
                    <div className="notification-popup">
                      <div className="notification-icon">🎉</div>
                      <div className="notification-content">
                        <div className="notification-title">New Subscriber!</div>
                        <div className="notification-text">sarah.sui just subscribed to Crypto Weekly</div>
                      </div>
                      <div className="notification-time">2s ago</div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-label">Total Members</div>
                        <div className="stat-value">13,041</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Paid Members</div>
                        <div className="stat-value">3,207</div>
                        <div className="stat-change positive">↑ 1%</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Free Members</div>
                        <div className="stat-value">9,834</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">MRR (SUI)</div>
                        <div className="stat-value">21,819</div>
                        <div className="stat-change positive">↑ 3.8%</div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <span>Member Growth</span>
                        <span className="chart-period">6 Months</span>
                      </div>
                      <div className="chart-placeholder">
                        <svg viewBox="0 0 400 100" className="chart-svg">
                          <polyline
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            points="0,80 50,75 100,70 150,65 200,55 250,45 300,35 350,25 400,20"
                          />
                          <polyline
                            fill="url(#gradient)"
                            points="0,80 50,75 100,70 150,65 200,55 250,45 300,35 350,25 400,20 400,100 0,100"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </svg>
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
            <h2>THE TECH STACK</h2>
            <h3>The Uncensorable Publishing Stack.</h3>
            <p>
              We replaced the central server. The three core components of Epoch—Walrus for storage, Sui for ownership, and Seal for access—work together to ensure no single entity can ever take down your publication or seize your revenue. Your audience, your rules.
            </p>
          </div>

          <div className="feature-blocks">
            <div className="feature-block">
              <div className="feature-block-header">
                <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h4>Powered by Sui</h4>
              </div>
              <p>Instantaneous publishing and transaction finality with Sui's parallel execution.</p>
            </div>

            <div className="feature-block">
              <div className="feature-block-header">
                <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <h4>Stored on Walrus</h4>
              </div>
              <p>Content stored as immutable decentralized blobs, independent of Epoch's servers.</p>
            </div>

            <div className="feature-block">
              <div className="feature-block-header">
                <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h4>Secured by Seal</h4>
              </div>
              <p>Proof-of-ownership and access control secured by on-chain identity protocols.</p>
            </div>

            <div className="feature-block">
              <div className="feature-block-header">
                <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h4>Crypto Native</h4>
              </div>
              <p>Payments are settled instantly on-chain, cutting out the middlemen and platform fees.</p>
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
