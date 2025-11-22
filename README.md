# Decentralized Newsletter Platform

A censorship-resistant newsletter platform built on Sui blockchain and Walrus decentralized storage. Deploy your entire site to Walrus for a truly unstoppable Web3 experience!

## Features

- **Fully Decentralized**: Frontend hosted on Walrus Sites, content on Walrus, logic on Sui
- **Token-Gated Access**: Premium content controlled via NFTs using Sui's Seal
- **Censorship-Resistant**: No centralized intermediaries or single points of failure
- **Flexible Access Models**: Free, NFT-gated, or hybrid newsletters
- **Cost-Effective**: ~$0.01-0.05/year vs $5-50/month traditional hosting

## Project Structure

```
.
├── src/                    # Frontend application (Next.js)
│   ├── app/               # Next.js app directory
│   ├── config/            # Configuration files
│   ├── services/          # Service layer (Walrus, Seal, Newsletter)
│   └── types/             # TypeScript type definitions
├── move/                   # Sui Move smart contracts
│   ├── sources/           # Move source files
│   └── Move.toml          # Move package configuration
└── package.json           # Node.js dependencies
```

## Setup

### Prerequisites

- Node.js 20+
- Sui CLI (for Move development)
- pnpm, npm, or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env.local
```

3. Build Move contracts (when ready):
```bash
cd move
sui move build
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 🐋 Deployment to Walrus Sites

Deploy your newsletter to Walrus for a fully decentralized, censorship-resistant experience!

### Quick Deploy

```bash
# Build static site
npm run build

# Deploy to Walrus Sites
npm run deploy:walrus
```

Your site will be live at `https://[your-site-id].walrus.site` 🎉

### Full Guide

See [WALRUS_DEPLOYMENT_QUICKSTART.md](./WALRUS_DEPLOYMENT_QUICKSTART.md) for:
- Prerequisites and setup
- Step-by-step deployment
- Updating your site
- Troubleshooting

For advanced configuration, see [docs/WALRUS_SITES_DEPLOYMENT.md](./docs/WALRUS_SITES_DEPLOYMENT.md)

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Blockchain**: Sui (Move smart contracts)
- **Storage**: Walrus decentralized storage
- **Access Control**: Sui Seal
- **Testing**: Vitest, fast-check (property-based testing)

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SUI_NETWORK`: Sui network (testnet/mainnet)
- `NEXT_PUBLIC_SUI_RPC_URL`: Sui RPC endpoint
- `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL`: Walrus aggregator URL
- `NEXT_PUBLIC_WALRUS_PUBLISHER_URL`: Walrus publisher URL
- `NEXT_PUBLIC_SEAL_KEY_SERVER_URL`: Seal key server URL
- `NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID`: Deployed newsletter package ID
- `NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID`: Deployed Seal policy package ID

## License

MIT
