const { PrismaClient } = require('@prisma/client');

async function testInterestDirect() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Interest Calculation Directly...\n');
    
    // Get current account balances
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        accountType: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        accountNumber: 'asc'
      }
    });

    console.log('📊 Current Account Balances:');
    console.log('================================');
    accounts.forEach(acc => {
      console.log(`${acc.accountNumber}: $${acc.balance} (${acc.accountType}) - ${acc.user.email}`);
    });

    // Calculate expected interest
    const INTEREST_RATES = [
      { accountType: 'SAVINGS', annualRate: 2.5, monthlyRate: 2.5 / 12, minimumBalance: 50 },
      { accountType: 'CHECKING', annualRate: 1.0, monthlyRate: 1.0 / 12, minimumBalance: 100 },
      { accountType: 'BUSINESS', annualRate: 1.8, monthlyRate: 1.8 / 12, minimumBalance: 500 }
    ];

    console.log('\n🧮 Expected Interest Calculation:');
    console.log('==================================');
    
    let totalExpectedInterest = 0;
    
    for (const account of accounts) {
      const balance = parseFloat(account.balance.toString());
      const accountType = account.accountType;
      
      let rateConfig = INTEREST_RATES.find(rate => rate.accountType === accountType);
      if (!rateConfig) {
        rateConfig = {
          accountType: 'DEFAULT',
          annualRate: 1.5,
          monthlyRate: 1.5 / 12,
          minimumBalance: 50
        };
      }

      if (balance < rateConfig.minimumBalance) {
        console.log(`❌ ${account.accountNumber}: $${balance} < $${rateConfig.minimumBalance} (min) - NO INTEREST`);
        continue;
      }

      const monthlyInterest = balance * (rateConfig.monthlyRate / 100);
      const roundedInterest = Math.round(monthlyInterest * 100) / 100;
      totalExpectedInterest += roundedInterest;

      console.log(`✅ ${account.accountNumber}: $${balance} × ${rateConfig.monthlyRate}% = $${roundedInterest} (${accountType})`);
    }

    console.log(`\n💰 Total Expected Interest: $${totalExpectedInterest.toFixed(2)}`);
    
    // Check if there are any existing interest transactions
    const existingInterestTransactions = await prisma.transaction.findMany({
      where: {
        description: {
          contains: 'Interest'
        }
      },
      select: {
        id: true,
        amount: true,
        description: true,
        createdAt: true,
        account: {
          select: {
            accountNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📊 Existing Interest Transactions: ${existingInterestTransactions.length}`);
    if (existingInterestTransactions.length > 0) {
      existingInterestTransactions.forEach(tx => {
        console.log(`- ${tx.account.accountNumber}: $${tx.amount} (${tx.createdAt})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInterestDirect(); 