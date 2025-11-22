# Gasless Publishing Setup Guide

## Quick Start

You can now test gasless newsletter creation! Here's what we've built:

### ✅ What's Implemented

1. **Gas Station Service** - Sponsors transactions automatically
2. **Keypair Manager** - Generates temporary keypairs for users
3. **Gasless API** - `/api/gasless/newsletters` endpoint
4. **Frontend Service** - Simple API wrapper
5. **Test Page** - `/test-gasless` for quick testing

### 🚀 How to Test

1. **Set up sponsor wallet** (required):
   ```bash
   # Generate a new wallet for sponsoring
   sui client new-address ed25519
   
   # Export the private key
   sui keytool export --key-identity <your-address>
   
   # Copy the base64 private key to .env.local
   # SPONSOR_PRIVATE_KEY=<your-base64-private-key>
   ```

2. **Fund the sponsor wallet**:
   ```bash
   # Get testnet SUI from faucet
   curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
     --header 'Content-Type: application/json' \
     --data-raw '{"FixedAmountRequest":{"recipient":"<your-sponsor-address>"}}'
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **Visit the test page**:
   ```
   http://localhost:3000/test-gasless
   ```

5. **Create a newsletter**:
   - Enter a title and description
   - Click "Create Newsletter (Gasless)"
   - No wallet needed! ✨

### 📋 What Happens Behind the Scenes

1. **User submits form** → Frontend generates a session-based user ID
2. **API receives request** → Backend generates/retrieves user's keypair
3. **Transaction built** → Sui transaction created with user as sender
4. **User signs** → Transaction signed with user's temporary keypair
5. **Platform sponsors** → Gas Station adds sponsor signature
6. **Transaction submitted** → Sent to Sui blockchain
7. **Newsletter created** → On-chain, gasless! 🎉

### ⚠️ Current Limitations

- **Database not connected** - Keypairs are logged but not persisted
- **Mock transaction** - Gas Station needs real sponsor wallet setup
- **No issue publishing yet** - Only newsletter creation works
- **No premium content** - Seal integration not connected yet

### 🔧 Next Steps to Make it Production-Ready

1. **Connect database** - Implement PostgreSQL/SQLite for keypair storage
2. **Set up real sponsor wallet** - Fund with real testnet SUI
3. **Add rate limiting** - Implement Redis-based rate limiting
4. **Add issue publishing** - Create `/api/gasless/issues` endpoint
5. **Add premium content** - Integrate Seal for NFT-gated content

### 🧪 Testing Checklist

- [ ] Sponsor wallet funded with testnet SUI
- [ ] Environment variables configured
- [ ] Dev server running
- [ ] Test page accessible at `/test-gasless`
- [ ] Newsletter creation works without wallet
- [ ] Transaction appears on Sui explorer

### 📚 API Documentation

#### POST /api/gasless/newsletters

Create a newsletter without wallet connection.

**Request:**
```json
{
  "userId": "user_123",
  "title": "My Newsletter",
  "description": "A great newsletter",
  "accessModel": {
    "isFree": true,
    "isNftGated": false,
    "isHybrid": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "newsletterId": "0x...",
  "transactionDigest": "0x...",
  "userAddress": "0x...",
  "gasUsed": 1234567
}
```

#### GET /api/gasless/newsletters?id=<newsletter_id>

Get newsletter details.

**Response:**
```json
{
  "newsletter": {
    "id": "0x...",
    "creator": "0x...",
    "title": "My Newsletter",
    "description": "A great newsletter",
    "accessModel": { ... },
    "createdAt": 1234567890,
    "issueCount": 0
  }
}
```

### 🐛 Troubleshooting

**Error: "Sponsor wallet unavailable"**
- Make sure `SPONSOR_PRIVATE_KEY` is set in `.env.local`
- Verify the private key is valid base64

**Error: "Insufficient gas"**
- Fund your sponsor wallet with testnet SUI
- Check balance: `sui client gas <sponsor-address>`

**Error: "Transaction failed"**
- Check Sui RPC is accessible
- Verify contract addresses are correct
- Check sponsor wallet has enough SUI

### 💡 Tips

- User IDs are stored in localStorage (key: `gasless_user_id`)
- Each user gets a unique Sui address
- Keypairs are encrypted with `PLATFORM_MASTER_KEY`
- All transactions are logged for accounting

---

**Ready to test?** Set up your sponsor wallet and visit `/test-gasless`! 🚀
