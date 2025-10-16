const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/globalbank'
    }
  }
});

async function creditARHoldings() {
  try {
    console.log('🏦 Starting AR Holdings Group credit...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // First, check current balance of account 0506115866
    const account = await prisma.account.findFirst({
      where: {
        accountNumber: '0506115866'
      },
      include: {
        user: true
      }
    });

    if (!account) {
      console.error('❌ Account 0506115866 not found');
      return;
    }

    console.log('✅ Found account:', account.accountNumber);
    console.log('👤 Account holder:', account.user.firstName, account.user.lastName);
    console.log('💰 Current balance: $' + account.balance.toLocaleString());

    // Credit the account with $500,000
    const creditAmount = 500000;
    const newBalance = Number(account.balance) + creditAmount;

    console.log('💳 Crediting account with $' + creditAmount.toLocaleString());
    console.log('💰 New balance will be: $' + newBalance.toLocaleString());

    // Update the account balance
    const updatedAccount = await prisma.account.update({
      where: {
        id: account.id
      },
      data: {
        balance: newBalance
      }
    });

    console.log('✅ Account balance updated successfully');

    // Create the credit transaction
    const transaction = await prisma.transaction.create({
      data: {
        accountId: account.id,
        userId: account.userId,
        type: 'CREDIT',
        amount: creditAmount,
        description: 'Deposit from AR Holdings Group',
        reference: `AR-HOLDINGS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'COMPLETED'
      }
    });

    console.log('✅ Transaction created:', transaction.reference);
    console.log('📄 Transaction ID:', transaction.id);

    // Verify the final balance
    const finalAccount = await prisma.account.findFirst({
      where: {
        accountNumber: '0506115866'
      }
    });

    console.log('🎉 Final balance: $' + finalAccount.balance.toLocaleString());

    // Get total bank balance
    const totalBalance = await prisma.account.aggregate({
      where: {
        isActive: true
      },
      _sum: {
        balance: true
      }
    });

    console.log('🏦 Total bank balance: $' + totalBalance._sum.balance.toLocaleString());

    console.log('✅ AR Holdings Group credit completed successfully!');

  } catch (error) {
    console.error('❌ Error crediting AR Holdings Group:', error);
  } finally {
    await prisma.$disconnect();
  }
}

creditARHoldings();
