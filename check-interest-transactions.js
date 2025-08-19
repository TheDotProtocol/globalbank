const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInterestTransactions() {
  try {
    console.log('🔍 Checking Interest Transactions...\n');
    
    // Check all transactions with "Interest" in description
    const interestTransactions = await prisma.transaction.findMany({
      where: {
        description: {
          contains: 'Interest'
        }
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            balance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${interestTransactions.length} interest transactions:`);
    console.log('========================================');
    
    interestTransactions.forEach(tx => {
      console.log(`- ${tx.account.accountNumber}: $${tx.amount} (${tx.description}) - ${tx.createdAt}`);
    });

    // Check account balances
    console.log('\n📊 Current Account Balances:');
    console.log('================================');
    const accounts = await prisma.account.findMany({
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

    accounts.forEach(acc => {
      console.log(`${acc.accountNumber}: $${acc.balance} (${acc.accountType})`);
    });

    // Check if there are any transactions at all
    const allTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        account: {
          select: {
            accountNumber: true
          }
        }
      }
    });

    console.log(`\n📊 Recent Transactions (last 10):`);
    console.log('==================================');
    allTransactions.forEach(tx => {
      console.log(`- ${tx.account.accountNumber}: $${tx.amount} (${tx.description}) - ${tx.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInterestTransactions(); 