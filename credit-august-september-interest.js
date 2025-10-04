const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.rbmpeyjaoitdvafxntao:GlobalBank2024@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function creditInterestForMonth(year, month) {
  console.log(`🏦 Crediting interest for ${month}/${year}...`);
  
  try {
    // Get all active accounts with balances
    const accounts = await prisma.account.findMany({
      where: {
        isActive: true,
        balance: {
          gt: 0
        }
      },
      include: {
        user: true
      }
    });

    console.log(`📊 Found ${accounts.length} accounts to process`);

    let totalInterestCredited = 0;
    let accountsProcessed = 0;

    for (const account of accounts) {
      try {
        // Determine interest rate based on account type
        let interestRate = 0;
        let minimumBalance = 0;

        switch (account.accountType) {
          case 'SAVINGS':
            interestRate = 2.5; // 2.5% annual
            minimumBalance = 50;
            break;
          case 'CHECKING':
            interestRate = 1.0; // 1% annual
            minimumBalance = 100;
            break;
          case 'BUSINESS':
            interestRate = 1.8; // 1.8% annual
            minimumBalance = 500;
            break;
          default:
            interestRate = 1.0; // Default 1% annual
            minimumBalance = 100;
        }

        // Check if account meets minimum balance requirement
        if (account.balance < minimumBalance) {
          console.log(`⚠️ Account ${account.accountNumber} (${account.user.firstName} ${account.user.lastName}) - Balance $${account.balance} below minimum $${minimumBalance} for ${account.accountType} account`);
          continue;
        }

        // Calculate monthly interest
        const monthlyRate = interestRate / 12; // Convert annual to monthly
        const interestAmount = (account.balance * monthlyRate) / 100;

        if (interestAmount > 0) {
          // Create interest transaction
          const interestTransaction = await prisma.transaction.create({
            data: {
              accountId: account.id,
              userId: account.userId,
              type: 'DEPOSIT', // Interest is a deposit
              amount: interestAmount,
              description: `Interest Credit - ${month}/${year} (${interestRate}% annual rate)`,
              status: 'COMPLETED',
              reference: `INT-${year}-${month.toString().padStart(2, '0')}-${account.accountNumber}`
            }
          });

          // Update account balance
          await prisma.account.update({
            where: { id: account.id },
            data: {
              balance: {
                increment: interestAmount
              }
            }
          });

          totalInterestCredited += interestAmount;
          accountsProcessed++;

          console.log(`✅ Credited $${interestAmount.toFixed(2)} interest to ${account.user.firstName} ${account.user.lastName} (${account.accountNumber}) - New balance: $${(account.balance + interestAmount).toFixed(2)}`);
        }

      } catch (error) {
        console.error(`❌ Error processing account ${account.accountNumber}:`, error);
      }
    }

    console.log(`\n🎉 Interest crediting completed for ${month}/${year}:`);
    console.log(`📊 Accounts processed: ${accountsProcessed}`);
    console.log(`💰 Total interest credited: $${totalInterestCredited.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error crediting interest:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting interest crediting for August and September 2025...\n');
    
    // Credit interest for August 2025
    await creditInterestForMonth(2025, 8);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Credit interest for September 2025
    await creditInterestForMonth(2025, 9);
    
    console.log('\n🎉 All interest crediting completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
