import Link from 'next/link';
import { WalletConnection } from '@/components/WalletConnection';
import { WalletStatus } from '@/components/WalletStatus';

export default function Home() {
  return (
    <main>
      <header className="app-header">
        <h1>Decentralized Newsletter Platform</h1>
        <WalletConnection />
      </header>
      <div className="content">
        <p>Welcome to the censorship-resistant newsletter platform built on Sui and Walrus.</p>
        <WalletStatus />
        
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/newsletters" className="browse-link">
            Browse Newsletters →
          </Link>
          <Link href="/test-gasless" className="create-link">
            Create Newsletter →
          </Link>
        </div>
      </div>
    </main>
  );
}
