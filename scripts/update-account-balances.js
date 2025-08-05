const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAccountBalances() {
  try {
    console.log('🏦 Starting account balance updates...');
    
    // Update all accounts with $0 balance to $100
    const zeroBalanceAccounts = await prisma.account.updateMany({
      where: {
        balance: 0,
        isActive: true
      },
      data: {
        balance: 100
      }
    });
    
    console.log(`✅ Updated ${zeroBalanceAccounts.count} accounts from $0 to $100`);
    
    // Create welcome gift transactions for updated accounts
    const updatedAccounts = await prisma.account.findMany({
      where: {
        balance: 100,
        isActive: true
      }
    });
    
    for (const account of updatedAccounts) {
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          userId: account.userId,
          type: 'CREDIT',
          amount: 100,
          description: 'Welcome Gift from The Dot Protocol Co Ltd',
          reference: `WELCOME-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'COMPLETED'
        }
      });
    }
    
    console.log(`✅ Created welcome gift transactions for ${updatedAccounts.length} accounts`);
    
    // Update specific account 0506114890 to $1M
    const millionDollarAccount = await prisma.account.updateMany({
      where: {
        accountNumber: '0506114890'
      },
      data: {
        balance: 1000000
      }
    });
    
    console.log(`✅ Updated account 0506114890 to $1,000,000`);
    
    // Create transaction for the $1M deposit
    const account = await prisma.account.findFirst({
      where: {
        accountNumber: '0506114890'
      }
    });
    
    if (account) {
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          userId: account.userId,
          type: 'CREDIT',
          amount: 1000000,
          description: 'Capital Injection - The Dot Protocol Co Ltd',
          reference: `CAPITAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'COMPLETED'
        }
      });
    }
    
    console.log('✅ Account balance updates completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating account balances:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateAccountBalances(); 