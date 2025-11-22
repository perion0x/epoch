#!/bin/bash

# Testnet Configuration Verification Script
# Verifies that all testnet services are accessible and configured correctly

set -e

echo "🔍 Verifying Testnet Configuration"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check Sui RPC
echo "1️⃣  Checking Sui Testnet RPC..."
SUI_RPC_URL="${NEXT_PUBLIC_SUI_RPC_URL:-https://fullnode.testnet.sui.io:443}"

if curl -s -X POST "$SUI_RPC_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"sui_getChainIdentifier","params":[]}' \
    | grep -q "result"; then
    echo -e "${GREEN}✅ Sui RPC accessible: $SUI_RPC_URL${NC}"
else
    echo -e "${RED}❌ Sui RPC not accessible: $SUI_RPC_URL${NC}"
fi

# Check Walrus Aggregator
echo ""
echo "2️⃣  Checking Walrus Aggregator..."
WALRUS_AGGREGATOR="${NEXT_PUBLIC_WALRUS_AGGREGATOR_URL:-https://aggregator.walrus-testnet.walrus.space}"

if curl -s --head "$WALRUS_AGGREGATOR" | head -n 1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Walrus Aggregator accessible: $WALRUS_AGGREGATOR${NC}"
else
    echo -e "${YELLOW}⚠️  Walrus Aggregator may not be accessible: $WALRUS_AGGREGATOR${NC}"
    echo "   This is expected if Walrus testnet is down"
fi

# Check Walrus Publisher
echo ""
echo "3️⃣  Checking Walrus Publisher..."
WALRUS_PUBLISHER="${NEXT_PUBLIC_WALRUS_PUBLISHER_URL:-https://publisher.walrus-testnet.walrus.space}"

if curl -s --head "$WALRUS_PUBLISHER" | head -n 1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Walrus Publisher accessible: $WALRUS_PUBLISHER${NC}"
else
    echo -e "${YELLOW}⚠️  Walrus Publisher may not be accessible: $WALRUS_PUBLISHER${NC}"
    echo "   This is expected if Walrus testnet is down"
fi

# Check Seal Key Server
echo ""
echo "4️⃣  Checking Seal Key Server..."
SEAL_SERVER="${NEXT_PUBLIC_SEAL_KEY_SERVER_URL:-https://seal-testnet.sui.io}"

if curl -s --head "$SEAL_SERVER" | head -n 1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Seal Key Server accessible: $SEAL_SERVER${NC}"
else
    echo -e "${YELLOW}⚠️  Seal Key Server may not be accessible: $SEAL_SERVER${NC}"
    echo "   This is expected if Seal testnet is down"
fi

# Check Package IDs
echo ""
echo "5️⃣  Checking Package IDs..."

if [ -z "$NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID" ]; then
    echo -e "${YELLOW}⚠️  Newsletter Package ID not set${NC}"
    echo "   Set NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID after deployment"
else
    echo -e "${GREEN}✅ Newsletter Package ID: $NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID${NC}"
    
    # Verify package exists on-chain
    if curl -s -X POST "$SUI_RPC_URL" \
        -H "Content-Type: application/json" \
        -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"sui_getObject\",\"params\":[\"$NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID\",{\"showType\":true}]}" \
        | grep -q "\"status\":\"Exists\""; then
        echo -e "${GREEN}   ✅ Package verified on-chain${NC}"
    else
        echo -e "${RED}   ❌ Package not found on-chain${NC}"
    fi
fi

if [ -z "$NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID" ]; then
    echo -e "${YELLOW}⚠️  Seal Policy Package ID not set${NC}"
    echo "   This is optional if using the same package for access policy"
else
    echo -e "${GREEN}✅ Seal Policy Package ID: $NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID${NC}"
fi

# Check Sui CLI
echo ""
echo "6️⃣  Checking Sui CLI..."

if command -v sui &> /dev/null; then
    echo -e "${GREEN}✅ Sui CLI installed${NC}"
    
    ACTIVE_ENV=$(sui client active-env 2>/dev/null || echo "unknown")
    echo "   Environment: $ACTIVE_ENV"
    
    if [ "$ACTIVE_ENV" = "testnet" ]; then
        echo -e "${GREEN}   ✅ Connected to testnet${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Not connected to testnet (current: $ACTIVE_ENV)${NC}"
    fi
    
    ACTIVE_ADDRESS=$(sui client active-address 2>/dev/null || echo "unknown")
    echo "   Address: $ACTIVE_ADDRESS"
else
    echo -e "${YELLOW}⚠️  Sui CLI not installed${NC}"
    echo "   Install from: https://docs.sui.io/build/install"
fi

# Check Node.js and npm
echo ""
echo "7️⃣  Checking Node.js environment..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not installed${NC}"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not installed${NC}"
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Node modules installed${NC}"
else
    echo -e "${YELLOW}⚠️  Node modules not installed${NC}"
    echo "   Run: npm install"
fi

# Summary
echo ""
echo "📊 Configuration Summary"
echo "========================"
echo "Network: ${NEXT_PUBLIC_SUI_NETWORK:-testnet}"
echo "Sui RPC: $SUI_RPC_URL"
echo "Walrus Aggregator: $WALRUS_AGGREGATOR"
echo "Walrus Publisher: $WALRUS_PUBLISHER"
echo "Seal Server: $SEAL_SERVER"
echo ""

if [ -z "$NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID" ]; then
    echo -e "${YELLOW}⚠️  Configuration incomplete: Package ID not set${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy smart contracts: ./scripts/deploy-testnet.sh"
    echo "2. Update .env.local with package ID"
    echo "3. Run this script again to verify"
else
    echo -e "${GREEN}✅ Configuration complete!${NC}"
    echo ""
    echo "Ready to:"
    echo "1. Build frontend: npm run build"
    echo "2. Deploy frontend: vercel --prod"
    echo "3. Run integration tests"
fi

echo ""
