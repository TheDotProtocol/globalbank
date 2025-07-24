const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateKBankDetails() {
  try {
    console.log('🏦 Updating K Bank account with correct details...');

    // First, let's see what we have
    const existingBanks = await prisma.$queryRaw`
      SELECT id, "bankName", "accountHolderName", "accountNumber", "accountType", "swiftCode", "currency"
      FROM corporate_banks
      WHERE "bankName" LIKE '%Bank%'
    `;
    
    console.log('📊 Current banks:', existingBanks);

    // Update K Bank details
    const updateResult = await prisma.$executeRaw`
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
      WHERE "bankName" = 'K Bank'
    `;

    console.log('✅ Update result:', updateResult);

    // Verify the update
    const updatedBank = await prisma.$queryRaw`
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
      WHERE "bankName" = 'Kasikorn Bank'
    `;

    console.log('\n📊 Updated K Bank Account:');
    console.log(updatedBank);

    console.log('\n✅ K Bank account details updated successfully!');

  } catch (error) {
    console.error('❌ Error updating K Bank details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateKBankDetails(); 