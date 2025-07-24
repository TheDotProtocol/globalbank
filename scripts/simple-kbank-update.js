const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateKBankDetails() {
  try {
    console.log('🏦 Updating K Bank account details...');

    // First, let's delete the existing K Bank account to avoid unique constraint issues
    const existingKBank = await prisma.corporateBank.findFirst({
      where: { 
        OR: [
          { bankName: 'K Bank' },
          { bankName: 'Kasikorn Bank' }
        ]
      }
    });

    if (existingKBank) {
      console.log('🗑️ Deleting existing K Bank account:', existingKBank.id);
      await prisma.corporateBank.delete({
        where: { id: existingKBank.id }
      });
    }

    // Create new K Bank account with correct details
    const newKBank = await prisma.corporateBank.create({
      data: {
        bankName: 'Kasikorn Bank',
        accountHolderName: 'The Dotprotocol Co., Ltd',
        accountNumber: '198-1-64757-9',
        routingNumber: null,
        swiftCode: 'KASITHBK',
        iban: null,
        branchCode: '001',
        accountType: 'CURRENT',
        currency: 'THB',
        isActive: true,
        dailyLimit: 5000000,
        monthlyLimit: 50000000,
        transferFee: 50,
        apiEnabled: true,
        apiEndpoint: 'https://api.kasikornbank.com/v1',
        webhookUrl: 'https://globaldotbank.org/api/webhooks/kasikorn'
      }
    });

    console.log('✅ K Bank account created with correct details:', newKBank.id);
    console.log('\n📊 K Bank Account Details:');
    console.log('   Bank Name:', newKBank.bankName);
    console.log('   Account Holder:', newKBank.accountHolderName);
    console.log('   Account Number:', newKBank.accountNumber);
    console.log('   Account Type:', newKBank.accountType);
    console.log('   SWIFT Code:', newKBank.swiftCode);
    console.log('   Currency:', newKBank.currency);
    console.log('   Status:', newKBank.isActive ? 'Active' : 'Inactive');

    console.log('\n✅ K Bank account details updated successfully!');

  } catch (error) {
    console.error('❌ Error updating K Bank details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateKBankDetails(); 