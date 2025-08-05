const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAccounts() {
  try {
    console.log('🔍 Debugging Account Balances and Interest Calculation...\n');
    
    // Check current accounts
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        accountType: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    console.log('📊 Current Account Balances:');
    console.log('================================');
    accounts.forEach(acc => {
      console.log(`${acc.accountNumber}: $${acc.balance} (${acc.accountType}) - ${acc.user.email}`);
    });
    console.log(`\nTotal active accounts: ${accounts.length}\n`);

    // Test interest calculation for each account
    console.log('🧮 Testing Interest Calculation:');
    console.log('================================');
    
    const INTEREST_RATES = [
      { accountType: 'SAVINGS', annualRate: 2.5, monthlyRate: 2.5 / 12, minimumBalance: 50 },
      { accountType: 'CHECKING', annualRate: 1.0, monthlyRate: 1.0 / 12, minimumBalance: 100 },
      { accountType: 'BUSINESS', annualRate: 1.8, monthlyRate: 1.8 / 12, minimumBalance: 500 }
    ];

    let totalInterest = 0;
    
    for (const account of accounts) {
      const balance = parseFloat(account.balance.toString());
      const accountType = account.accountType;
      
      // Find interest rate
      let rateConfig = INTEREST_RATES.find(rate => rate.accountType === accountType);
      if (!rateConfig) {
        rateConfig = {
          accountType: 'DEFAULT',
          annualRate: 1.5,
          monthlyRate: 1.5 / 12,
          minimumBalance: 50
        };
      }

      // Check minimum balance
      if (balance < rateConfig.minimumBalance) {
        console.log(`❌ ${account.accountNumber}: $${balance} < $${rateConfig.minimumBalance} (min) - NO INTEREST`);
        continue;
      }

      // Calculate interest
      const monthlyInterest = balance * (rateConfig.monthlyRate / 100);
      const roundedInterest = Math.round(monthlyInterest * 100) / 100;
      totalInterest += roundedInterest;

      console.log(`✅ ${account.accountNumber}: $${balance} × ${rateConfig.monthlyRate}% = $${roundedInterest} (${accountType})`);
    }

    console.log(`\n💰 Total Interest to be Paid: $${totalInterest.toFixed(2)}`);
    console.log(`📈 Accounts with Interest: ${accounts.filter(acc => parseFloat(acc.balance.toString()) >= 50).length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAccounts(); 