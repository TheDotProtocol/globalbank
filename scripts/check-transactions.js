const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTransactions() {
  try {
    console.log('🔍 Checking transactions for account: cmd5is11x0005kz04np5vul5w');
    
    const account = await prisma.account.findUnique({
      where: { id: 'cmd5is11x0005kz04np5vul5w' },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!account) {
      console.log('❌ Account not found');
      return;
    }
    
    console.log(`\n💰 Account: ${account.accountNumber}`);
    console.log(`   Balance: $${account.balance}`);
    console.log(`   Type: ${account.accountType}`);
    console.log(`   Currency: ${account.currency}`);
    
    console.log(`\n📊 Transactions (${account.transactions.length}):`);
    
    let calculatedBalance = 0;
    
    for (const tx of account.transactions) {
      const amount = Number(tx.amount);
      if (tx.type === 'CREDIT') {
        calculatedBalance += amount;
      } else if (tx.type === 'DEBIT') {
        calculatedBalance -= amount;
      }
      
      console.log(`   ${tx.createdAt.toISOString()} | ${tx.type} | $${amount} | ${tx.description} | ${tx.status}`);
    }
    
    console.log(`\n🧮 Calculated Balance: $${calculatedBalance}`);
    console.log(`   Difference: $${account.balance - calculatedBalance}`);
    
  } catch (error) {
    console.error('❌ Error checking transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkTransactions()
    .then(() => {
      console.log('✅ Transaction check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Transaction check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkTransactions }; 