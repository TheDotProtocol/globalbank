const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testExportLogic() {
  try {
    console.log('🧪 Testing Export Logic...\n');
    
    const month = 7; // July
    const year = 2025;
    
    // Get all accounts with their balances and transactions (same logic as export API)
    const accounts = await prisma.account.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        transactions: {
          where: {
            OR: [
              // Regular transactions from the specified month
              {
                createdAt: {
                  gte: new Date(year, month - 1, 1),
                  lt: new Date(year, month, 1)
                }
              },
              // Interest transactions (regardless of date)
              {
                description: {
                  contains: 'Interest'
                }
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        accountNumber: 'asc'
      }
    });

    console.log(`📊 Found ${accounts.length} accounts with transactions`);
    
    let totalBalance = 0;
    let totalInterest = 0;
    let totalTransactions = 0;

    // Test the same logic as the export API
    accounts.forEach(account => {
      const balance = parseFloat(account.balance.toString());
      const monthlyTransactions = account.transactions.length;
      const monthlyInterest = account.transactions
        .filter(tx => tx.description.includes('Interest'))
        .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0);

      totalBalance += balance;
      totalInterest += monthlyInterest;
      totalTransactions += monthlyTransactions;

      console.log(`\n📊 Account: ${account.accountNumber}`);
      console.log(`   Balance: $${balance}`);
      console.log(`   Transactions: ${monthlyTransactions}`);
      console.log(`   Interest: $${monthlyInterest}`);
      
      if (account.transactions.length > 0) {
        console.log(`   Transaction details:`);
        account.transactions.forEach(tx => {
          console.log(`     - $${tx.amount}: ${tx.description} (${tx.createdAt})`);
        });
      }
    });

    console.log(`\n🎯 Summary:`);
    console.log(`   Total Balance: $${totalBalance}`);
    console.log(`   Total Interest: $${totalInterest}`);
    console.log(`   Total Transactions: ${totalTransactions}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExportLogic(); 