import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { NewslettersPage } from './pages/NewslettersPage';
import { CreateNewsletterPage } from './pages/CreateNewsletterPage';
import { NewsletterDetailPage } from './pages/NewsletterDetailPage';
import { PublishIssuePage } from './pages/PublishIssuePage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { NFTManagementPage } from './pages/NFTManagementPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'newsletters',
        element: <NewslettersPage />,
      },
      {
        path: 'newsletters/create',
        element: <CreateNewsletterPage />,
      },
      {
        path: 'newsletters/:id',
        element: <NewsletterDetailPage />,
      },
      {
        path: 'newsletters/:id/publish',
        element: <PublishIssuePage />,
      },
      {
        path: 'newsletters/:id/issues/:issueId',
        element: <IssueDetailPage />,
      },
      {
        path: 'newsletters/:id/nfts',
        element: <NFTManagementPage />,
      },
    ],
  },
]);
