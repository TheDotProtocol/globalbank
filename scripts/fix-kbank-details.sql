-- Update K Bank account with correct details
UPDATE corporate_banks 
SET 
  "bankName" = 'Kasikorn Bank',
  "accountHolderName" = 'The Dotprotocol Co., Ltd',
  "accountNumber" = '198-1-64757-9',
  "swiftCode" = 'KASITHBK',
  "accountType" = 'CURRENT',
  "currency" = 'THB',
  "apiEndpoint" = 'https://api.kasikornbank.com/v1',
  "webhookUrl" = 'https://globaldotbank.org/api/webhooks/kasikorn',
  "updatedAt" = NOW()
WHERE "bankName" = 'K Bank';

-- Show the updated account
SELECT 
  id,
  "bankName",
  "accountHolderName", 
  "accountNumber",
  "accountType",
  "swiftCode",
  "currency",
  "isActive",
  "createdAt",
  "updatedAt"
FROM corporate_banks 
WHERE "bankName" = 'Kasikorn Bank'; 