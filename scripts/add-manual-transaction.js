const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addManualTransaction() {
  try {
    console.log('💰 Adding manual transaction for deposit...');
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: 'njmsweettie@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    
    // Find the account
    const account = await prisma.account.findFirst({
      where: { userId: user.id }
    });
    
    if (!account) {
      console.log('❌ Account not found');
      return;
    }
    
    console.log(`✅ Found account: ${account.accountNumber}`);
    console.log(`   Current balance: $${account.balance}`);
    
    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Manual deposit entry',
        status: 'COMPLETED',
        reference: `MANUAL-${Date.now()}`,
        metadata: {
          adminNote: 'Manual deposit entry from database',
          createdBy: 'admin',
          timestamp: new Date().toISOString()
        }
      }
    });
    
    console.log(`✅ Created transaction: ${transaction.id}`);
    
    // Update account balance
    await prisma.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: 150000
        }
      }
    });
    
    // Verify the update
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    console.log(`✅ Updated balance: $${updatedAccount.balance}`);
    
  } catch (error) {
    console.error('❌ Error adding manual transaction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if executed directly
if (require.main === module) {
  addManualTransaction()
    .then(() => {
      console.log('✅ Manual transaction added');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to add manual transaction:', error);
      process.exit(1);
    });
}

module.exports = { addManualTransaction }; 