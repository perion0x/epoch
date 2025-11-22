import { describe, it, expect } from 'vitest';
import { config } from './environment';

describe('Environment Configuration', () => {
  it('should have valid Sui configuration', () => {
    expect(config.sui.network).toBeDefined();
    expect(config.sui.rpcUrl).toBeDefined();
    expect(config.sui.network).toBe('testnet');
  });

  it('should have valid Walrus configuration', () => {
    expect(config.walrus.aggregatorUrl).toBeDefined();
    expect(config.walrus.publisherUrl).toBeDefined();
  });

  it('should have valid Seal configuration', () => {
    expect(config.seal.keyServerUrl).toBeDefined();
  });

  it('should have contract configuration placeholders', () => {
    expect(config.contracts).toBeDefined();
    expect(config.contracts.newsletterPackageId).toBeDefined();
    expect(config.contracts.sealPolicyPackageId).toBeDefined();
  });
});
