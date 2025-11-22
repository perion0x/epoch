import type { Metadata } from 'next';
import { SuiProvider } from '@/providers/SuiProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decentralized Newsletter',
  description: 'Censorship-resistant newsletter platform on Sui',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <SuiProvider>{children}</SuiProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
