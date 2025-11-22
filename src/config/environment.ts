export const config = {
  sui: {
    network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
    rpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
  },
  walrus: {
    aggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
    publisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
  },
  seal: {
    keyServerUrl: process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_URL || 'https://seal-testnet.sui.io',
  },
  contracts: {
    newsletterPackageId: (process.env.NEXT_PUBLIC_NEWSLETTER_PACKAGE_ID || '').trim(),
    sealPolicyPackageId: (process.env.NEXT_PUBLIC_SEAL_POLICY_PACKAGE_ID || '').trim(),
  },
} as const;

export type Config = typeof config;

/**
 * Get environment configuration in a format suitable for service initialization
 */
export function getEnvironmentConfig() {
  return {
    walrusPublisherUrl: config.walrus.publisherUrl,
    walrusAggregatorUrl: config.walrus.aggregatorUrl,
    sealKeyServerUrl: config.seal.keyServerUrl,
    packageId: config.contracts.newsletterPackageId,
    sealPackageId: config.contracts.sealPolicyPackageId,
  };
}
