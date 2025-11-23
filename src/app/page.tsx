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
            <svg width="200" height="100" viewBox="0 0 465 244" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_1988_12912)">
                <path d="M406.16 150.768C406.16 157.388 404.7 162.898 401.83 167.148C398.99 171.408 395.42 174.608 391.21 176.668C387.04 178.728 382.88 179.778 378.86 179.778C372.18 179.778 366.6 177.478 362.3 172.948C358.02 168.398 355.86 162.188 355.86 154.488V84.8984H337V155.638C337 165.088 338.57 173.048 341.68 179.308C344.8 185.558 349.17 190.318 354.66 193.448C360.12 196.518 366.44 198.078 373.44 198.078C381.9 198.078 389.02 196.068 394.6 192.108C399.64 188.488 403.52 184.098 406.16 179.048V196.648H425.02V84.8984H406.16V150.778V150.768Z" fill="#4DA2FF"/>
                <path d="M308.871 126.158C304.531 123.078 299.911 120.608 295.141 118.818C290.491 117.068 286.211 115.668 282.401 114.658L267.461 110.638C264.781 109.938 261.801 109.008 258.621 107.878C255.461 106.718 252.391 105.228 249.521 103.468C246.701 101.688 244.351 99.4586 242.531 96.8286C240.791 94.1986 239.911 90.9986 239.911 87.3086C239.911 82.8786 241.191 78.8686 243.721 75.3986C246.311 71.8886 249.981 69.0886 254.601 67.0786C259.311 65.0486 264.901 64.0186 271.211 64.0186C279.831 64.0186 287.191 65.9786 293.101 69.8586C298.911 73.6686 302.271 79.0986 303.091 85.9986L303.191 86.8786H322.261L322.221 85.8486C321.981 78.2886 319.601 71.4386 315.171 65.4986C310.801 59.5786 304.801 54.8586 297.351 51.4686C289.921 48.0386 281.311 46.3086 271.781 46.3086C262.251 46.3086 253.671 48.0686 246.001 51.5386C238.351 54.9786 232.161 59.8886 227.601 66.1486C223.061 72.3886 220.761 79.7986 220.761 88.1686C220.761 98.2786 224.241 106.578 231.091 112.838C237.841 119.008 247.111 123.818 258.641 127.138L276.651 132.288C281.721 133.698 286.511 135.368 290.881 137.248C295.151 139.088 298.641 141.498 301.251 144.428C303.781 147.268 305.071 151.038 305.071 155.628C305.071 160.708 303.561 165.208 300.571 169.078C297.581 172.948 293.431 176.008 288.241 178.178C283.051 180.348 277.111 181.448 270.571 181.448C261.571 181.448 253.651 179.318 247.031 175.118C240.411 170.918 236.521 164.878 235.451 157.178L235.351 156.298H216.281L216.321 157.328C216.561 165.328 219.051 172.548 223.711 178.808C228.371 185.068 234.771 189.968 242.731 193.398C250.691 196.828 259.831 198.568 269.931 198.568C279.831 198.568 288.671 196.768 296.291 193.218C303.911 189.668 309.911 184.648 314.161 178.288C318.411 171.928 320.561 164.488 320.561 156.148C320.561 145.758 317.031 137.228 310.081 130.748C303.131 124.268 293.651 119.458 281.881 116.418L263.871 111.268C258.801 109.858 254.011 108.188 249.641 106.308C245.371 104.468 241.881 102.058 239.271 99.1286C236.741 96.2886 235.451 92.5186 235.451 87.9286C235.451 82.8486 236.961 78.3486 239.951 74.4786C242.941 70.6086 247.091 67.5486 252.281 65.3786C257.471 63.2086 263.411 62.1086 269.951 62.1086C278.951 62.1086 286.871 64.2386 293.491 68.4386C300.111 72.6386 303.991 78.6786 305.061 86.3786L305.161 87.2586H324.231L324.191 86.2286C323.951 78.2286 321.461 71.0086 316.801 64.7486C312.141 58.4886 305.741 53.5886 297.781 50.1586C289.821 46.7286 280.681 44.9886 270.581 44.9886C260.681 44.9886 251.841 46.7886 244.221 50.3386C236.601 53.8886 230.601 58.9086 226.351 65.2686C222.101 71.6286 219.951 79.0686 219.951 87.4386C219.951 97.8286 223.481 106.358 230.431 112.838C237.381 119.318 246.861 124.128 258.631 127.138L276.641 132.288C281.711 133.698 286.501 135.368 290.871 137.248C295.141 139.088 298.631 141.498 301.241 144.428C303.771 147.268 305.061 151.038 305.061 155.628C305.061 160.708 303.551 165.208 300.561 169.078L308.871 126.158Z" fill="#4DA2FF"/>
                <path d="M128.16 46.3086C118.63 46.3086 110.05 48.0686 102.38 51.5386C94.7305 54.9786 88.5405 59.8886 83.9805 66.1486C79.4405 72.3886 77.1405 79.7986 77.1405 88.1686C77.1405 98.2786 80.6205 106.578 87.4705 112.838C94.2205 119.008 103.49 123.818 115.02 127.138L133.03 132.288C138.1 133.698 142.89 135.368 147.26 137.248C151.53 139.088 155.02 141.498 157.63 144.428C160.16 147.268 161.45 151.038 161.45 155.628C161.45 160.708 159.94 165.208 156.95 169.078C153.96 172.948 149.81 176.008 144.62 178.178C139.43 180.348 133.49 181.448 126.95 181.448C117.95 181.448 110.03 179.318 103.41 175.118C96.7905 170.918 92.9005 164.878 91.8305 157.178L91.7305 156.298H72.6605L72.7005 157.328C72.9405 165.328 75.4305 172.548 80.0905 178.808C84.7505 185.068 91.1505 189.968 99.1105 193.398C107.07 196.828 116.21 198.568 126.31 198.568C136.21 198.568 145.05 196.768 152.67 193.218C160.29 189.668 166.29 184.648 170.54 178.288C174.79 171.928 176.94 164.488 176.94 156.148C176.94 145.758 173.41 137.228 166.46 130.748C159.51 124.268 150.03 119.458 138.26 116.418L120.25 111.268C115.18 109.858 110.39 108.188 106.02 106.308C101.75 104.468 98.2605 102.058 95.6505 99.1286C93.1205 96.2886 91.8305 92.5186 91.8305 87.9286C91.8305 82.8486 93.3405 78.3486 96.3305 74.4786C99.3205 70.6086 103.47 67.5486 108.66 65.3786C113.85 63.2086 119.79 62.1086 126.33 62.1086C135.33 62.1086 143.25 64.2386 149.87 68.4386C156.49 72.6386 160.37 78.6786 161.44 86.3786L161.54 87.2586H180.61L180.57 86.2286C180.33 78.2286 177.84 71.0086 173.18 64.7486C168.52 58.4886 162.12 53.5886 154.16 50.1586C146.2 46.7286 137.06 44.9886 126.96 44.9886L128.16 46.3086Z" fill="#4DA2FF"/>
                <path d="M58.8203 84.8984H39.9603V196.648H58.8203V84.8984Z" fill="#4DA2FF"/>
                <path d="M49.3906 76.6484C54.6406 76.6484 58.8906 72.3984 58.8906 67.1484C58.8906 61.8984 54.6406 57.6484 49.3906 57.6484C44.1406 57.6484 39.8906 61.8984 39.8906 67.1484C39.8906 72.3984 44.1406 76.6484 49.3906 76.6484Z" fill="#4DA2FF"/>
              </g>
              <defs>
                <clipPath id="clip0_1988_12912">
                  <rect width="465" height="244" fill="white"/>
                </clipPath>
              </defs>
            </svg>
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
