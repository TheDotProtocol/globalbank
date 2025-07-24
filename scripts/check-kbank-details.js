const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkKBankDetails() {
  try {
    console.log('🔍 Checking current K Bank account details...');

    // Find all corporate banks
    const allBanks = await prisma.corporateBank.findMany();
    
    console.log('\n📊 All Corporate Banks:');
    allBanks.forEach((bank, index) => {
      console.log(`\n${index + 1}. Bank Details:`);
      console.log('   ID:', bank.id);
      console.log('   Bank Name:', bank.bankName);
      console.log('   Account Holder:', bank.accountHolderName);
      console.log('   Account Number:', bank.accountNumber);
      console.log('   Account Type:', bank.accountType);
      console.log('   SWIFT Code:', bank.swiftCode);
      console.log('   Currency:', bank.currency);
      console.log('   Status:', bank.isActive ? 'Active' : 'Inactive');
      console.log('   Created:', bank.createdAt);
    });

    // Find K Bank specifically
    const kBank = await prisma.corporateBank.findFirst({
      where: { 
        OR: [
          { bankName: 'K Bank' },
          { bankName: 'Kasikorn Bank' }
        ]
      }
    });

    if (kBank) {
      console.log('\n🏦 Found K Bank Account:');
      console.log('   ID:', kBank.id);
      console.log('   Bank Name:', kBank.bankName);
      console.log('   Account Holder:', kBank.accountHolderName);
      console.log('   Account Number:', kBank.accountNumber);
      console.log('   Account Type:', kBank.accountType);
      console.log('   SWIFT Code:', kBank.swiftCode);
      console.log('   Currency:', kBank.currency);
      console.log('   Status:', kBank.isActive ? 'Active' : 'Inactive');
    } else {
      console.log('\n❌ No K Bank account found');
    }

  } catch (error) {
    console.error('❌ Error checking K Bank details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKBankDetails(); 