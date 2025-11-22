import Link from 'next/link';
import { NewsletterCreationForm } from '@/components/NewsletterCreationForm';

/**
 * Newsletter creation page
 * Implements Requirements 1.1, 1.2, 1.3
 */
export default function CreateNewsletterPage() {
  return (
    <main>
      <header className="app-header">
        <h1>Decentralized Newsletter Platform</h1>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/newsletters">Browse</Link>
        </nav>
      </header>
      
      <div className="content">
        <NewsletterCreationForm />
      </div>
    </main>
  );
}
