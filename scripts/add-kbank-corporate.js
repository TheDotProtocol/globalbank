const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addKBankCorporate() {
  try {
    console.log('🏦 Adding K Bank, Thailand corporate account...');

    // Check if K Bank already exists
    const existingKBank = await prisma.corporateBank.findFirst({
      where: { bankName: 'K Bank' }
    });

    if (existingKBank) {
      console.log('⚠️ K Bank already exists:', existingKBank.accountNumber);
      return;
    }

    // Create K Bank corporate account
    const kBankAccount = await prisma.corporateBank.create({
      data: {
        bankName: 'K Bank',
        accountHolderName: 'Global Dot Bank Co., Ltd.',
        accountNumber: '1234567890', // Replace with actual account number
        routingNumber: '001234567', // Replace with actual routing number
        swiftCode: 'KASITHBK', // K Bank SWIFT code
        iban: null, // Thailand doesn't use IBAN
        branchCode: '001', // Main branch
        accountType: 'BUSINESS',
        currency: 'THB', // Thai Baht
        isActive: true,
        dailyLimit: 5000000, // 5M THB daily limit
        monthlyLimit: 50000000, // 50M THB monthly limit
        transferFee: 50, // 50 THB per transfer
        apiEnabled: true,
        apiEndpoint: 'https://api.kbank.com/v1', // Example endpoint
        webhookUrl: 'https://globaldotbank.org/api/webhooks/kbank'
      }
    });

    console.log('✅ K Bank corporate account created:', kBankAccount.id);
    console.log('📊 Account details:');
    console.log('   Bank Name:', kBankAccount.bankName);
    console.log('   Account Number:', kBankAccount.accountNumber);
    console.log('   Currency:', kBankAccount.currency);
    console.log('   Daily Limit:', kBankAccount.dailyLimit);
    console.log('   Monthly Limit:', kBankAccount.monthlyLimit);
    console.log('   Transfer Fee:', kBankAccount.transferFee);

    // Create some sample bank transfers for demonstration
    const sampleTransfers = [
      {
        toAccountNumber: '0506118608',
        toAccountName: 'Saleena Thamani',
        amount: 50000,
        currency: 'THB',
        transferType: 'INBOUND',
        status: 'COMPLETED',
        reference: 'KBANK-001',
        description: 'Initial funding transfer to Saleena Thamani'
      },
      {
        toAccountNumber: '0506110982',
        toAccountName: 'Prajuab Buangam',
        amount: 25000,
        currency: 'THB',
        transferType: 'INBOUND',
        status: 'COMPLETED',
        reference: 'KBANK-002',
        description: 'Funding transfer to Prajuab Buangam'
      },
      {
        toAccountNumber: '0506113754',
        toAccountName: 'Sura Preamsuk',
        amount: 30000,
        currency: 'THB',
        transferType: 'INBOUND',
        status: 'COMPLETED',
        reference: 'KBANK-003',
        description: 'Funding transfer to Sura Preamsuk'
      }
    ];

    console.log('\n💰 Creating sample bank transfers...');

    for (const transferData of sampleTransfers) {
      const transfer = await prisma.bankTransfer.create({
        data: {
          corporateBankId: kBankAccount.id,
          toAccountNumber: transferData.toAccountNumber,
          toAccountName: transferData.toAccountName,
          amount: transferData.amount,
          currency: transferData.currency,
          transferType: transferData.transferType,
          status: transferData.status,
          reference: transferData.reference,
          description: transferData.description,
          fee: kBankAccount.transferFee,
          netAmount: transferData.amount - kBankAccount.transferFee,
          processedAt: new Date()
        }
      });

      console.log('   ✅ Created transfer:', transfer.reference, '-', transferData.amount, transferData.currency);
    }

    // Verify the corporate bank and transfers
    const totalTransfers = await prisma.bankTransfer.count({
      where: { corporateBankId: kBankAccount.id }
    });

    console.log('\n📊 Final summary:');
    console.log('   K Bank Account ID:', kBankAccount.id);
    console.log('   Total transfers:', totalTransfers);
    console.log('   Account Status: Active');

    console.log('\n✅ K Bank corporate account setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up K Bank:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addKBankCorporate(); 