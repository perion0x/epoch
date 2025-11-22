#!/bin/bash

# Walrus Sites Deployment Script
# Deploys the decentralized newsletter platform to Walrus Sites

set -e

echo "🐋 Walrus Sites Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if site-builder is installed
if ! command -v site-builder &> /dev/null; then
    echo -e "${RED}❌ Error: site-builder CLI not found${NC}"
    echo ""
    echo "Please install the Walrus Sites CLI tool:"
    echo "  cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder"
    echo ""
    exit 1
fi

# Check if wallet is configured
if [ ! -f ~/.sui/sui_config/client.yaml ]; then
    echo -e "${RED}❌ Error: Sui wallet not configured${NC}"
    echo ""
    echo "Please set up your Sui wallet first:"
    echo "  sui client"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Building Next.js application...${NC}"
npm run build

if [ ! -d "out" ]; then
    echo -e "${RED}❌ Error: Build output directory 'out' not found${NC}"
    echo "Make sure Next.js is configured for static export (output: 'export')"
    exit 1
fi

echo -e "${GREEN}✅ Build complete${NC}"
echo ""

echo -e "${YELLOW}🌐 Step 2: Deploying to Walrus Sites...${NC}"
echo ""

# Deploy to Walrus Sites
# The site-builder will:
# 1. Upload all files to Walrus as blobs
# 2. Create a site object on Sui
# 3. Return a walrus.site URL

NETWORK="${WALRUS_NETWORK:-testnet}"

echo "Network: $NETWORK"
echo "Deploying from: ./out"
echo ""

site-builder publish \
  --network "$NETWORK" \
  ./out

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your decentralized newsletter is now live on Walrus Sites!"
echo ""
echo "📝 Next steps:"
echo "  1. Note the walrus.site URL from the output above"
echo "  2. Update your DNS (optional) to point to the Walrus site"
echo "  3. Share your censorship-resistant newsletter!"
echo ""
