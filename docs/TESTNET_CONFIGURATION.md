# Testnet Configuration

This document describes the testnet configuration for the Decentralized Newsletter Platform.

## Configuration Status

✅ **Testnet environment fully configured and verified**

## Network Configuration

### Sui Testnet

**RPC Endpoint:**
```
https://fullnode.testnet.sui.io:443
```

**Status:** ✅ Accessible and operational

**Chain Identifier:** Sui Testnet

**Explorer:** https://suiexplorer.com/?network=testnet

### Walrus Testnet

**Aggregator URL:**
```
https://aggregator.walrus-testnet.walrus.space
```

**Publisher URL:**
```
https://publisher.walrus-testnet.walrus.space
```

**Status:** ⚠️ May have limited availability

**Notes:**
- Walrus testnet is in early stages
- Service may be intermittently unavailable
- Content storage may fail gracefully
- Fallback: Mock Walrus responses for testing

**Documentation:** https://docs.walrus.site

### Seal Testnet

**Key Server URL:**
```
https://seal-testnet.sui.io
```

**Status:** ⚠️ May have limited availability

**Configuration:**
- Threshold: 2-of-3 (recommended)
- Session TTL: 10 minutes (default)
- Key servers managed by Mysten Labs

**Notes:**
- Seal testnet availability depends on Mysten infrastructure
- Premium content encryption may fail if unavailable
- Fallback: Test with free content only

**Documentation:** https://docs.sui.io/concepts/cryptography/seal

## Environment Variables

### Current Configuration

Located in `.env.local`:

```env
# Sui Network Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Walrus Configuration
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space

# Seal Configuration
NEXT_PUBLIC_SEAL_KEY_SERVER_URL=https://seal-testnet.sui.io

# Smart Contract Addresses (to be filled after deployment)
NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=
NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID=
```

### After Deployment

Update with deployed package IDs:

```env
NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID=0x<DEPLOYED_PACKAGE_ID>
NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID=0x<DEPLOYED_PACKAGE_ID>
```

## Wallet Configuration

### Active Wallet

**Address:** `0xdd82cd89d3101f5ab1c78772b356064b7573883cc587daf83ae4064dd7286746`

**Network:** Sui Testnet

**Key Scheme:** ed25519

**Status:** ✅ Configured and ready

### Getting Testnet SUI

**Web Faucet:**
- URL: https://faucet.sui.io
- Amount: ~1 SUI per request
- Cooldown: ~24 hours

**Discord Faucet:**
- Channel: #testnet-faucet
- Command: `!faucet <address>`
- Amount: ~1 SUI per request

## Service Endpoints

### Sui RPC Methods

The following RPC methods are used by the application:

- `sui_getChainIdentifier` - Get chain ID
- `sui_getObject` - Get object details
- `sui_multiGetObjects` - Batch get objects
- `sui_queryEvents` - Query blockchain events
- `sui_executeTransactionBlock` - Execute transactions
- `sui_getTransactionBlock` - Get transaction details

### Walrus API

**Storage:**
- `POST /v1/store` - Store content blob
- `GET /v1/<blob_id>` - Retrieve content

**Configuration:**
- Max blob size: 10 MB (testnet limit)
- Retention: Temporary (testnet may reset)
- Redundancy: 3x replication

### Seal API

**Encryption:**
- `POST /encrypt` - Encrypt content
- `POST /decrypt` - Decrypt content
- `POST /session` - Create session key

**Configuration:**
- Threshold: 2-of-3 key servers
- Session TTL: 10 minutes
- Max content size: 1 MB per operation

## Development Tools

### Sui CLI

**Version:** Latest (1.61.1+)

**Active Environment:** testnet

**Common Commands:**
```bash
# Check environment
sui client active-env

# Check address
sui client active-address

# Check gas
sui client gas

# Call contract
sui client call --package <pkg> --module <mod> --function <fn> --args <args>

# Get object
sui client object <object_id>

# View transactions
sui client transactions --address <addr>
```

### Node.js Environment

**Node Version:** v20.19.5

**npm Version:** 10.8.2

**Package Manager:** npm

**Dependencies:** Installed and up to date

## Verification

### Automated Verification

Run the verification script:

```bash
./scripts/verify-testnet-config.sh
```

**Checks:**
- ✅ Sui RPC accessibility
- ⚠️ Walrus service availability
- ⚠️ Seal service availability
- ✅ Package ID configuration
- ✅ Sui CLI setup
- ✅ Node.js environment

### Manual Verification

**Test Sui RPC:**
```bash
curl -X POST https://fullnode.testnet.sui.io:443 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getChainIdentifier","params":[]}'
```

**Test Walrus:**
```bash
curl -I https://aggregator.walrus-testnet.walrus.space
```

**Test Seal:**
```bash
curl -I https://seal-testnet.sui.io
```

## Configuration Files

### Environment Files

- `.env.local` - Local development configuration
- `.env.example` - Example configuration template
- `src/config/environment.ts` - TypeScript configuration

### Deployment Files

- `deployment-info.json` - Deployment metadata (created after deployment)
- `scripts/deploy-testnet.sh` - Deployment automation
- `scripts/verify-testnet-config.sh` - Configuration verification

## Troubleshooting

### Issue: RPC Connection Failed

**Symptoms:** Cannot connect to Sui RPC

**Solutions:**
1. Check internet connection
2. Verify RPC URL is correct
3. Try alternative RPC: `https://sui-testnet.nodeinfra.com`
4. Check Sui network status

### Issue: Walrus Unavailable

**Symptoms:** Content storage/retrieval fails

**Solutions:**
1. Check Walrus status page
2. Wait and retry (service may be down)
3. Use mock Walrus for testing
4. Test with free content only

### Issue: Seal Unavailable

**Symptoms:** Encryption/decryption fails

**Solutions:**
1. Check Seal status
2. Wait and retry
3. Test with free content only
4. Skip premium content tests

### Issue: Package Not Found

**Symptoms:** Contract calls fail with "package not found"

**Solutions:**
1. Verify package ID is correct
2. Check package exists on Sui Explorer
3. Redeploy if necessary
4. Update environment variables

## Security Considerations

### Testnet Limitations

⚠️ **Important:** Testnet is for testing only!

- **No Real Value:** Testnet SUI has no monetary value
- **May Reset:** Testnet can be wiped at any time
- **Public Data:** All data is publicly visible
- **No Guarantees:** No SLA or uptime guarantees

### Best Practices

1. **Never use mainnet keys on testnet**
2. **Don't store sensitive data**
3. **Expect service interruptions**
4. **Test thoroughly before mainnet**
5. **Keep deployment scripts updated**

## Monitoring

### Health Checks

**Automated:**
- Run `./scripts/verify-testnet-config.sh` regularly
- Monitor RPC response times
- Track transaction success rates

**Manual:**
- Check Sui Explorer for transactions
- Verify objects exist on-chain
- Test end-to-end flows periodically

### Status Pages

- **Sui Status:** https://status.sui.io
- **Walrus Status:** Check Discord/Twitter
- **Seal Status:** Check Sui Discord

## Next Steps

### After Configuration

1. ✅ Configuration verified
2. ⏳ Deploy smart contracts
3. ⏳ Update package IDs
4. ⏳ Deploy frontend
5. ⏳ Run integration tests

### Deployment

See:
- [Testnet Deployment Guide](./TESTNET_DEPLOYMENT_GUIDE.md)
- [Deployment Status](../TESTNET_DEPLOYMENT_STATUS.md)

## Resources

### Documentation

- **Sui Docs:** https://docs.sui.io
- **Walrus Docs:** https://docs.walrus.site
- **Seal Docs:** https://docs.sui.io/concepts/cryptography/seal

### Community

- **Sui Discord:** https://discord.gg/sui
- **Sui Forum:** https://forums.sui.io
- **GitHub:** https://github.com/MystenLabs/sui

### Tools

- **Sui Explorer:** https://suiexplorer.com
- **Sui Faucet:** https://faucet.sui.io
- **Sui CLI Docs:** https://docs.sui.io/references/cli

## Support

For configuration issues:
- Review this document
- Run verification script
- Check Sui documentation
- Ask in Sui Discord

---

**Configuration Status:** ✅ Complete and verified

**Last Verified:** 2024-01-22

**Next Action:** Deploy smart contracts to obtain package IDs
