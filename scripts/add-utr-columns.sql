-- Add UTR columns to transactions and international_transfers
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS utr TEXT;
ALTER TABLE international_transfers ADD COLUMN IF NOT EXISTS utr TEXT;
ALTER TABLE international_transfers ADD COLUMN IF NOT EXISTS "targetCurrency" TEXT DEFAULT 'USD';

CREATE UNIQUE INDEX IF NOT EXISTS transactions_utr_key ON transactions(utr) WHERE utr IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS international_transfers_utr_key ON international_transfers(utr) WHERE utr IS NOT NULL;
