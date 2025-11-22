#!/bin/bash

# Testnet Deployment Script for Decentralized Newsletter Platform
# This script automates the deployment process to Sui testnet

set -e  # Exit on error

echo "🚀 Decentralized Newsletter Platform - Testnet Deployment"
echo "=========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo -e "${RED}❌ Sui CLI not found. Please install it first.${NC}"
    echo "Visit: https://docs.sui.io/build/install"
    exit 1
fi

echo -e "${GREEN}✅ Sui CLI found${NC}"

# Check active environment
ACTIVE_ENV=$(sui client active-env)
echo "📍 Active environment: $ACTIVE_ENV"

if [ "$ACTIVE_ENV" != "testnet" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on testnet. Current environment: $ACTIVE_ENV${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get active address
ACTIVE_ADDRESS=$(sui client active-address)
echo "👤 Active address: $ACTIVE_ADDRESS"

# Check gas balance
echo ""
echo "💰 Checking gas balance..."
GAS_OUTPUT=$(sui client gas 2>&1)

if echo "$GAS_OUTPUT" | grep -q "No gas coins"; then
    echo -e "${RED}❌ No gas coins found${NC}"
    echo ""
    echo "Please get testnet SUI tokens from:"
    echo "🌐 https://faucet.sui.io/?address=$ACTIVE_ADDRESS"
    echo ""
    echo "After getting tokens, run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Gas coins found${NC}"
echo "$GAS_OUTPUT"

# Build Move packages
echo ""
echo "🔨 Building Move packages..."
cd move

BUILD_OUTPUT=$(sui move build 2>&1)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    echo "$BUILD_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Run tests
echo ""
echo "🧪 Running Move tests..."
TEST_OUTPUT=$(sui move test 2>&1)
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo "$TEST_OUTPUT"
    read -p "Do you want to continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ All tests passed${NC}"
fi

# Deploy
echo ""
echo "🚀 Deploying to testnet..."
echo "This will cost approximately 0.1 SUI in gas fees."
read -p "Continue with deployment? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "📦 Publishing package..."

DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 2>&1)
DEPLOY_STATUS=$?

cd ..

if [ $DEPLOY_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "$DEPLOY_OUTPUT"

# Extract package ID (this is a simplified extraction, may need adjustment)
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep -oE "0x[a-f0-9]{64}" | head -1)

if [ -z "$PACKAGE_ID" ]; then
    echo -e "${YELLOW}⚠️  Could not automatically extract package ID${NC}"
    echo "Please manually extract it from the output above."
else
    echo ""
    echo "📝 Deployment Information:"
    echo "=========================="
    echo "Package ID: $PACKAGE_ID"
    echo "Deployer: $ACTIVE_ADDRESS"
    echo "Network: $ACTIVE_ENV"
    echo "Date: $(date)"
    echo ""
    
    # Create deployment info file
    cat > deployment-info.json <<EOF
{
  "network": "$ACTIVE_ENV",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "$ACTIVE_ADDRESS",
  "packages": {
    "newsletter": {
      "packageId": "$PACKAGE_ID",
      "modules": {
        "newsletter": "newsletter::newsletter",
        "issue": "newsletter::issue",
        "nft": "newsletter::nft",
        "subscription": "newsletter::subscription",
        "access_policy": "newsletter::access_policy"
      }
    }
  }
}
EOF
    
    echo -e "${GREEN}✅ Deployment info saved to deployment-info.json${NC}"
    
    # Update .env.local
    if [ -f .env.local ]; then
        # Backup existing .env.local
        cp .env.local .env.local.backup
        
        # Update or add package ID
        if grep -q "NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID" .env.local; then
            sed -i.bak "s/NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=.*/NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=$PACKAGE_ID/" .env.local
            rm .env.local.bak
        else
            echo "NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=$PACKAGE_ID" >> .env.local
        fi
        
        echo -e "${GREEN}✅ Updated .env.local with package ID${NC}"
    fi
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Next Steps:"
echo "1. Verify deployment on Sui Explorer:"
echo "   https://suiexplorer.com/object/$PACKAGE_ID?network=testnet"
echo ""
echo "2. Test smart contract functions:"
echo "   sui client call --package $PACKAGE_ID --module newsletter --function create_and_share_newsletter ..."
echo ""
echo "3. Build and deploy frontend:"
echo "   npm run build"
echo "   vercel --prod"
echo ""
echo "4. Run integration tests"
echo ""
echo "See docs/TESTNET_DEPLOYMENT_GUIDE.md for detailed instructions."
