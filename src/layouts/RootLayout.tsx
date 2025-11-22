import { Outlet } from 'react-router-dom';
import { SuiProvider } from '@/providers/SuiProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '../app/globals.css';

export function RootLayout() {
  return (
    <ErrorBoundary>
      <SuiProvider>
        <Outlet />
      </SuiProvider>
    </ErrorBoundary>
  );
}
