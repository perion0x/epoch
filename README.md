# Decentralized Newsletter Platform

A gasless, censorship-resistant newsletter platform where creators own their content and readers access it directly from decentralized storage. Built on **Sui**, **Walrus**, and **Seal**.

## Features

*   **Gasless Experience:** Creators can launch newsletters and publish issues without needing a wallet or paying gas fees (sponsored via Gas Station).
*   **Decentralized Content:** All newsletter content is stored as **Walrus Blobs**, ensuring permanent and immutable storage separate from the frontend.
*   **On-Chain Ownership:** Newsletter identity and issue metadata are secured on the **Sui Blockchain**.
*   **Instant Preview:** Robust publishing flow that provides immediate content feedback while decentralized propagation happens in the background.
*   **Seal Encryption (Architecture):** "Premium Content" encryption logic is integrated in the codebase (`services/seal.ts`), designed to power subscription-gated newsletters.

## Technology Stack

*   **Frontend & API:** Next.js 14 (Hosted on Vercel)
*   **Blockchain:** Sui (Move Smart Contracts)
*   **Storage:** Walrus (Raw Blobs for Issue Content)
*   **Access Control:** Sui Seal (Encryption & Policy - Codebase Integrated)

## Project Structure

```bash
.
├── src/
│   ├── app/               # Next.js App Router (Frontend + API Routes)
│   ├── config/            # Environment Configuration
│   ├── services/          # Core Services (Walrus, Seal, Gas Station)
│   └── components/        # UI Components (Koenig Editor, etc.)
├── move/                  # Sui Move Smart Contracts
│   ├── sources/           # Move Source Files (newsletter, issue, seal_policy)
│   └── Move.toml          # Package Config
└── public/                # Static Assets
```

## Getting Started

### Prerequisites

*   Node.js 20+
*   pnpm, npm, or yarn

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Copy `.env.example` to `.env.local` and fill in your keys (Sui Network, Walrus Endpoints, Seal Key Server).
    ```bash
    cp .env.example .env.local
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Walrus Integration

This platform uses **Walrus Blobs** to store newsletter content.
*   **Writing:** When an issue is published, the content is serialized and uploaded to a Walrus Publisher Node.
*   **Reading:** The application retrieves the content directly from a Walrus Aggregator using the Blob ID stored on-chain.
*   **Deduplication:** Content is timestamped to ensure every issue generates a unique Blob ID on Walrus.

## Seal Integration

We have implemented the **Seal SDK** for encrypted premium content.
*(Note: Currently disabled in the live demo for stability, but fully implemented in the codebase.)*

1.  **Encrypt:** Content is encrypted client-side/server-side using Seal's ephemeral key.
2.  **Policy:** An Access Policy on Sui defines who can decrypt (e.g., "Must own Subscription Object").
3.  **Decrypt:** Eligible users derive the decryption key via the Seal network to read the content.

## Future Roadmap

*   **Monetization:** Enable readers to subscribe to creators using **SUI** or **USDC** via smart contracts.
*   **Live Encryption:** Enable the Seal encryption toggle in the production UI.

## License

MIT
