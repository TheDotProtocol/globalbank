const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAccountBalances() {
  try {
    console.log('🔧 Fixing account balances...');
    
    // Get all accounts
    const accounts = await prisma.account.findMany({
      include: {
        transactions: true
      }
    });
    
    console.log(`📊 Found ${accounts.length} accounts to process`);
    
    for (const account of accounts) {
      console.log(`\n💰 Processing account: ${account.id}`);
      console.log(`   Current balance: $${account.balance}`);
      
      // Calculate correct balance from transactions
      let calculatedBalance = 0;
      
      for (const transaction of account.transactions) {
        if (transaction.type === 'CREDIT') {
          calculatedBalance += transaction.amount;
        } else if (transaction.type === 'DEBIT') {
          calculatedBalance -= transaction.amount;
        }
      }
      
      console.log(`   Calculated balance: $${calculatedBalance}`);
      console.log(`   Transaction count: ${account.transactions.length}`);
      
      // Update account balance if different
      if (Math.abs(account.balance - calculatedBalance) > 0.01) {
        await prisma.account.update({
          where: { id: account.id },
          data: { balance: calculatedBalance }
        });
        console.log(`   ✅ Updated balance to: $${calculatedBalance}`);
      } else {
        console.log(`   ✅ Balance already correct`);
      }
    }
    
    console.log('\n🎉 Account balance fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing account balances:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixAccountBalances()
    .then(() => {
      console.log('✅ Balance fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Balance fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixAccountBalances }; 