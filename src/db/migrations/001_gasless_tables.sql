-- Migration: Gasless Publishing Tables
-- Creates tables for user sessions, keypairs, and sponsored transactions
-- Implements Requirements 1.5, 5.1

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  user_id VARCHAR(255) PRIMARY KEY,
  created_at BIGINT NOT NULL,
  last_active BIGINT NOT NULL,
  user_address VARCHAR(66), -- Sui address (0x + 64 hex chars)
  newsletters TEXT -- JSON array of newsletter IDs
);

CREATE INDEX idx_user_sessions_last_active ON user_sessions(last_active);

-- User keypairs table
CREATE TABLE IF NOT EXISTS user_keypairs (
  user_id VARCHAR(255) PRIMARY KEY,
  public_key TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  last_used BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_sessions(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_keypairs_last_used ON user_keypairs(last_used);

-- Sponsored transactions table
CREATE TABLE IF NOT EXISTS sponsored_transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  transaction_digest VARCHAR(66) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  gas_used BIGINT NOT NULL,
  timestamp BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_sessions(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_sponsored_transactions_user_id ON sponsored_transactions(user_id);
CREATE INDEX idx_sponsored_transactions_timestamp ON sponsored_transactions(timestamp);
CREATE INDEX idx_sponsored_transactions_type ON sponsored_transactions(transaction_type);
CREATE INDEX idx_sponsored_transactions_status ON sponsored_transactions(status);

-- Comments
COMMENT ON TABLE user_sessions IS 'Stores session data for wallet-less users';
COMMENT ON TABLE user_keypairs IS 'Stores encrypted keypairs for wallet-less users';
COMMENT ON TABLE sponsored_transactions IS 'Logs all sponsored transactions for accounting';
