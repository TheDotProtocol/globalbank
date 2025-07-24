const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateKBankDetails() {
  try {
    console.log('🏦 Updating K Bank account with correct details...');

    // Find the existing K Bank account
    const existingKBank = await prisma.corporateBank.findFirst({
      where: { bankName: 'K Bank' }
    });

    if (!existingKBank) {
      console.log('❌ K Bank account not found. Creating new account...');
      
      // Create K Bank with correct details
      const kBankAccount = await prisma.corporateBank.create({
        data: {
          bankName: 'Kasikorn Bank',
          accountHolderName: 'The Dotprotocol Co., Ltd',
          accountNumber: '198-1-64757-9',
          routingNumber: null, // Thailand doesn't use routing numbers
          swiftCode: 'KASITHBK',
          iban: null, // Thailand doesn't use IBAN
          branchCode: '001', // Main branch
          accountType: 'CURRENT',
          currency: 'THB', // Thai Baht
          isActive: true,
          dailyLimit: 5000000, // 5M THB daily limit
          monthlyLimit: 50000000, // 50M THB monthly limit
          transferFee: 50, // 50 THB per transfer
          apiEnabled: true,
          apiEndpoint: 'https://api.kasikornbank.com/v1', // Example endpoint
          webhookUrl: 'https://globaldotbank.org/api/webhooks/kasikorn'
        }
      });

      console.log('✅ K Bank account created with correct details:', kBankAccount.id);
    } else {
      console.log('✅ Found existing K Bank account, updating details...');
      
      // Update existing K Bank with correct details
      const updatedKBank = await prisma.corporateBank.update({
        where: { id: existingKBank.id },
        data: {
          bankName: 'Kasikorn Bank',
          accountHolderName: 'The Dotprotocol Co., Ltd',
          accountNumber: '198-1-64757-9',
          swiftCode: 'KASITHBK',
          accountType: 'CURRENT',
          currency: 'THB',
          apiEndpoint: 'https://api.kasikornbank.com/v1',
          webhookUrl: 'https://globaldotbank.org/api/webhooks/kasikorn'
        }
      });

      console.log('✅ K Bank account updated successfully:', updatedKBank.id);
    }

    // Verify the updated account
    const kBankAccount = await prisma.corporateBank.findFirst({
      where: { bankName: 'Kasikorn Bank' }
    });

    console.log('\n📊 Updated K Bank Account Details:');
    console.log('   Bank Name:', kBankAccount.bankName);
    console.log('   Account Holder:', kBankAccount.accountHolderName);
    console.log('   Account Number:', kBankAccount.accountNumber);
    console.log('   Account Type:', kBankAccount.accountType);
    console.log('   SWIFT Code:', kBankAccount.swiftCode);
    console.log('   Currency:', kBankAccount.currency);
    console.log('   Status:', kBankAccount.isActive ? 'Active' : 'Inactive');

    console.log('\n✅ K Bank account details updated successfully!');

  } catch (error) {
    console.error('❌ Error updating K Bank details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateKBankDetails(); 