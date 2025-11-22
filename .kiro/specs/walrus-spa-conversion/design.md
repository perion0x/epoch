# Design: SPA Conversion for Walrus Sites

## Overview

Convert the Next.js App Router application to a client-side SPA using React Router, enabling static export and Walrus Sites deployment.

## Architecture Changes

### Before (Next.js App Router)
```
/app/newsletters/page.tsx          → Server-rendered
/app/newsletters/[id]/page.tsx     → Dynamic route (SSR)
/app/newsletters/[id]/issues/[issueId]/page.tsx → Dynamic (SSR)
```

### After (React Router SPA)
```
/src/App.tsx                       → Main app with router
/src/pages/NewslettersPage.tsx    → Client-rendered
/src/pages/NewsletterDetailPage.tsx → Client-rendered with URL params
/src/pages/IssueDetailPage.tsx    → Client-rendered with URL params
```

## Implementation Strategy

### Phase 1: Add React Router
1. Install `react-router-dom`
2. Create route configuration
3. Wrap app in Router provider

### Phase 2: Convert Pages
1. Move page components from `/app` to `/src/pages`
2. Convert to standard React components
3. Use `useParams()` for dynamic segments
4. Use `useNavigate()` for navigation

### Phase 3: Update Next.js Config
1. Enable static export: `output: 'export'`
2. Configure for SPA mode
3. Set up fallback routing

### Phase 4: Update Build Process
1. Build outputs to `/out` directory
2. All routes resolve to `index.html`
3. Client-side router handles navigation

## Route Mapping

| Old Next.js Route | New React Router Route | Component |
|-------------------|------------------------|-----------|
| `/` | `/` | HomePage |
| `/newsletters` | `/newsletters` | NewslettersPage |
| `/newsletters/create` | `/newsletters/create` | CreateNewsletterPage |
| `/newsletters/[id]` | `/newsletters/:id` | NewsletterDetailPage |
| `/newsletters/[id]/publish` | `/newsletters/:id/publish` | PublishIssuePage |
| `/newsletters/[id]/issues/[issueId]` | `/newsletters/:id/issues/:issueId` | IssueDetailPage |
| `/newsletters/[id]/nfts` | `/newsletters/:id/nfts` | NFTManagementPage |

## Technical Details

### Router Configuration

```typescript
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'newsletters', element: <NewslettersPage /> },
      { path: 'newsletters/create', element: <CreateNewsletterPage /> },
      { path: 'newsletters/:id', element: <NewsletterDetailPage /> },
      { path: 'newsletters/:id/publish', element: <PublishIssuePage /> },
      { path: 'newsletters/:id/issues/:issueId', element: <IssueDetailPage /> },
      { path: 'newsletters/:id/nfts', element: <NFTManagementPage /> },
    ],
  },
]);
```

### Entry Point

```typescript
// src/main.tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SuiProvider>
      <RouterProvider router={router} />
    </SuiProvider>
  </React.StrictMode>
);
```

### Next.js Config for SPA

```javascript
// next.config.js
module.exports = {
  output: 'export',
  distDir: 'out',
  images: { unoptimized: true },
  trailingSlash: true,
};
```

### Walrus Sites Routing

```toml
# .walrus-sites.toml
[routing]
spa_mode = true  # All routes go to index.html
index = "index.html"
not_found = "index.html"  # SPA handles 404s
```

## Data Fetching

All data fetching happens client-side:

```typescript
// Before (Next.js)
export default async function Page({ params }) {
  const newsletter = await getNewsletter(params.id);
  return <div>{newsletter.title}</div>;
}

// After (React Router)
export function NewsletterDetailPage() {
  const { id } = useParams();
  const { data: newsletter } = useQuery(['newsletter', id], () => getNewsletter(id));
  return <div>{newsletter?.title}</div>;
}
```

## Benefits

✅ **Static Export**: No server required
✅ **Walrus Compatible**: Pure static files
✅ **Fast Navigation**: Client-side routing
✅ **Same Features**: All functionality preserved
✅ **Decentralized**: 100% on Walrus

## Migration Checklist

- [ ] Install React Router
- [ ] Create router configuration
- [ ] Convert all page components
- [ ] Update navigation links
- [ ] Configure Next.js for export
- [ ] Test all routes
- [ ] Build and verify output
- [ ] Deploy to Walrus Sites
