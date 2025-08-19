const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function creditInterestNow() {
  try {
    console.log('💰 Crediting Interest for July 2025...\n');
    
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
      },
      orderBy: {
        accountNumber: 'asc'
      }
    });

    console.log(`📊 Found ${accounts.length} active accounts for interest credit\n`);

    // Interest rates configuration
    const INTEREST_RATES = [
      { accountType: 'SAVINGS', annualRate: 2.5, monthlyRate: 2.5 / 12, minimumBalance: 50 },
      { accountType: 'CHECKING', annualRate: 1.0, monthlyRate: 1.0 / 12, minimumBalance: 100 },
      { accountType: 'BUSINESS', annualRate: 1.8, monthlyRate: 1.8 / 12, minimumBalance: 500 }
    ];

    let totalInterestCredited = 0;
    let accountsCredited = 0;
    const timestamp = Date.now();

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
          console.log(`❌ ${account.accountNumber}: $${balance} < $${rateConfig.minimumBalance} (min) - NO INTEREST`);
          continue;
        }

        // Calculate monthly interest
        const monthlyInterest = balance * (rateConfig.monthlyRate / 100);
        const roundedInterest = Math.round(monthlyInterest * 100) / 100;
        
        if (roundedInterest > 0) {
          // Update account balance with interest
          const newBalance = balance + roundedInterest;
          
          await prisma.account.update({
            where: { id: account.id },
            data: { balance: newBalance }
          });

          // Create interest transaction
          await prisma.transaction.create({
            data: {
              id: `int-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
              accountId: account.id,
              userId: account.user.id,
              type: 'CREDIT',
              amount: roundedInterest,
              description: 'Interest Credited for July 2025',
              reference: `INT-JULY-2025-${account.accountNumber}`,
              status: 'COMPLETED',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          totalInterestCredited += roundedInterest;
          accountsCredited++;
          
          console.log(`✅ ${account.accountNumber}: $${balance} → $${newBalance} (+$${roundedInterest.toFixed(2)}) [${accountType}]`);
        } else {
          console.log(`⚠️ ${account.accountNumber}: $${balance} - No interest (too low)`);
        }
      } catch (error) {
        console.error(`❌ Error processing account ${account.accountNumber}:`, error);
      }
    }

    console.log(`\n🎉 Interest Credit Summary:`);
    console.log(`================================`);
    console.log(`💰 Total Interest Credited: $${totalInterestCredited.toFixed(2)}`);
    console.log(`📈 Accounts Credited: ${accountsCredited}`);
    console.log(`📅 Period: July 2025`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // Verify the updates
    console.log(`\n📊 Verification - Updated Account Balances:`);
    console.log(`============================================`);
    const updatedAccounts = await prisma.account.findMany({
      where: { isActive: true },
      select: {
        accountNumber: true,
        balance: true,
        accountType: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        accountNumber: 'asc'
      }
    });

    updatedAccounts.forEach(acc => {
      console.log(`${acc.accountNumber}: $${acc.balance} (${acc.accountType}) - ${acc.user.email}`);
    });

    // Check interest transactions
    console.log(`\n📊 Verification - Interest Transactions:`);
    console.log(`========================================`);
    const interestTransactions = await prisma.transaction.findMany({
      where: {
        description: {
          contains: 'Interest Credited for July 2025'
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

    console.log(`Found ${interestTransactions.length} interest transactions:`);
    interestTransactions.forEach(tx => {
      console.log(`- ${tx.account.accountNumber}: $${tx.amount} (${tx.createdAt})`);
    });

    console.log(`\n✅ Interest credit completed successfully!`);
    console.log(`📄 Users can now see these transactions in their personal accounts`);
    console.log(`📊 PDF statements will include the interest credits`);

  } catch (error) {
    console.error('❌ Error crediting interest:', error);
  } finally {
    await prisma.$disconnect();
  }
}

creditInterestNow(); 