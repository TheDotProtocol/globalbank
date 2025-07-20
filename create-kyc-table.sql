-- Create KYC Documents table with all required fields
CREATE TABLE IF NOT EXISTS "kycDocuments" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  status TEXT DEFAULT 'PENDING',
  "uploadedAt" TIMESTAMP DEFAULT NOW(),
  "verifiedAt" TIMESTAMP,
  "verifiedBy" TEXT,
  "rejectionReason" TEXT,
  notes TEXT,
  "isActive" BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "kycDocuments_userId_idx" ON "kycDocuments"("userId");
CREATE INDEX IF NOT EXISTS "kycDocuments_status_idx" ON "kycDocuments"("status");
CREATE INDEX IF NOT EXISTS "kycDocuments_documentType_idx" ON "kycDocuments"("documentType");
CREATE INDEX IF NOT EXISTS "kycDocuments_uploadedAt_idx" ON "kycDocuments"("uploadedAt");

-- Verify the table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'kycDocuments' 
ORDER BY ordinal_position; 