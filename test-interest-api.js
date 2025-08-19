const { PrismaClient } = require('@prisma/client');

async function testInterestAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Interest Calculation API...\n');
    
    // Test 1: Direct interest calculation using the same logic
    console.log('📊 Test 1: Direct Interest Calculation');
    console.log('=====================================');
    
    const INTEREST_RATES = [
      { accountType: 'SAVINGS', annualRate: 2.5, monthlyRate: 2.5 / 12, minimumBalance: 50 },
      { accountType: 'CHECKING', annualRate: 1.0, monthlyRate: 1.0 / 12, minimumBalance: 100 },
      { accountType: 'BUSINESS', annualRate: 1.8, monthlyRate: 1.8 / 12, minimumBalance: 500 }
    ];

    // Get all active accounts with balances
    const accounts = await prisma.account.findMany({
      where: {
        isActive: true,
        balance: {
          gt: 0
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    console.log(`Found ${accounts.length} active accounts for interest calculation`);

    let totalInterestPaid = 0;
    let accountsWithInterest = 0;

    for (const account of accounts) {
      try {
        const balance = parseFloat(account.balance.toString());
        const accountType = account.accountType;
        
        // Find interest rate for this account type
        let rateConfig = INTEREST_RATES.find(rate => rate.accountType === accountType);
        
        // If no specific rate found, use a default rate
        if (!rateConfig) {
          console.log(`⚠️ No specific rate for account type: ${accountType}, using default rate`);
          rateConfig = {
            accountType: 'DEFAULT',
            annualRate: 1.5,
            monthlyRate: 1.5 / 12,
            minimumBalance: 50
          };
        }

        // Check minimum balance requirement
        if (balance < rateConfig.minimumBalance) {
          console.log(`⚠️ Account ${account.accountNumber} has insufficient balance (${balance}) for interest (minimum: ${rateConfig.minimumBalance})`);
          continue;
        }

        // Calculate monthly interest
        const monthlyInterest = balance * (rateConfig.monthlyRate / 100);
        const roundedInterest = Math.round(monthlyInterest * 100) / 100;
        
        if (roundedInterest > 0) {
          // Apply interest to account
          const newBalance = balance + roundedInterest;
          await prisma.account.update({
            where: { id: account.id },
            data: { balance: newBalance }
          });

          // Create interest transaction
          await prisma.transaction.create({
            data: {
              id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              accountId: account.id,
              userId: account.user.id,
              type: 'CREDIT',
              amount: roundedInterest,
              description: 'Monthly Interest Payment',
              reference: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              status: 'COMPLETED'
            }
          });

          totalInterestPaid += roundedInterest;
          accountsWithInterest++;
          
          console.log(`💰 Applied $${roundedInterest.toFixed(2)} interest to account ${account.accountNumber}`);
        } else {
          console.log(`⚠️ No interest for account ${account.accountNumber} (balance: $${balance}, type: ${account.accountType})`);
        }
      } catch (error) {
        console.error(`❌ Error processing account ${account.id}:`, error);
      }
    }

    console.log(`✅ Interest calculation completed:`);
    console.log(`   - Total interest paid: $${totalInterestPaid.toFixed(2)}`);
    console.log(`   - Accounts with interest: ${accountsWithInterest}`);
    
    // Test 2: Check if transactions were created
    console.log('\n📊 Test 2: Checking Created Transactions');
    console.log('========================================');
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        description: {
          contains: 'Interest'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        account: {
          select: {
            accountNumber: true,
            balance: true
          }
        }
      }
    });
    
    console.log(`Found ${recentTransactions.length} recent interest transactions:`);
    recentTransactions.forEach(tx => {
      console.log(`- ${tx.account.accountNumber}: $${tx.amount} (${tx.description})`);
    });
    
    // Test 3: Check updated account balances
    console.log('\n📊 Test 3: Checking Updated Account Balances');
    console.log('============================================');
    const updatedAccounts = await prisma.account.findMany({
      where: { isActive: true },
      select: {
        accountNumber: true,
        balance: true,
        accountType: true
      },
      orderBy: {
        accountNumber: 'asc'
      }
    });
    
    console.log('Current account balances after interest:');
    updatedAccounts.forEach(acc => {
      console.log(`${acc.accountNumber}: $${acc.balance} (${acc.accountType})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInterestAPI(); 