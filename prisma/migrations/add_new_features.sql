-- Add new fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS selfie_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Add new fields to transactions table for fraud detection
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_location TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_ip TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Add new status to transaction_status enum
ALTER TYPE "TransactionStatus" ADD VALUE IF NOT EXISTS 'ON_HOLD';

-- Add new fields to fixed_deposits table
ALTER TABLE fixed_deposits ADD COLUMN IF NOT EXISTS certificate_url TEXT;
ALTER TABLE fixed_deposits ADD COLUMN IF NOT EXISTS maturity_value DECIMAL(10,2);
ALTER TABLE fixed_deposits ADD COLUMN IF NOT EXISTS is_renewable BOOLEAN DEFAULT TRUE;
ALTER TABLE fixed_deposits ADD COLUMN IF NOT EXISTS renewed_at TIMESTAMP;

-- Add new fields to kyc_documents table for Sumsub integration
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS sumsub_id TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS sumsub_status TEXT;

-- Create manual_entries table
CREATE TABLE IF NOT EXISTS manual_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  admin_note TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_transactions_suspicious ON transactions(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_transactions_verification ON transactions(requires_verification);
CREATE INDEX IF NOT EXISTS idx_manual_entries_user ON manual_entries(user_id); 