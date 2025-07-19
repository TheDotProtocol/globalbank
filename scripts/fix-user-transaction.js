const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserTransaction() {
  try {
    console.log('🔧 Fixing user transaction and balance...');
    
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
    
    // Delete any existing incorrect transactions for this user
    const existingTransactions = await prisma.transaction.findMany({
      where: { userId: user.id }
    });
    
    console.log(`📊 Found ${existingTransactions.length} existing transactions`);
    
    // Delete all existing transactions
    if (existingTransactions.length > 0) {
      await prisma.transaction.deleteMany({
        where: { userId: user.id }
      });
      console.log('🗑️  Deleted existing transactions');
    }
    
    // Create the correct transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from AR Holdings Group Corporation, Singapore',
        status: 'COMPLETED',
        reference: `AR-HOLDINGS-${Date.now()}`
      }
    });
    
    console.log(`✅ Created transaction: ${transaction.id}`);
    console.log(`   Type: ${transaction.type}`);
    console.log(`   Amount: $${transaction.amount}`);
    console.log(`   Description: ${transaction.description}`);
    
    // Update account balance to exactly 150001 (150000 + 1)
    await prisma.account.update({
      where: { id: account.id },
      data: { balance: 150001 }
    });
    
    // Verify the update
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    console.log(`✅ Updated balance: $${updatedAccount.balance}`);
    
    // Verify transaction was created correctly
    const verifyTransaction = await prisma.transaction.findFirst({
      where: { userId: user.id }
    });
    
    if (verifyTransaction) {
      console.log(`✅ Transaction verified:`);
      console.log(`   ID: ${verifyTransaction.id}`);
      console.log(`   Type: ${verifyTransaction.type}`);
      console.log(`   Amount: $${verifyTransaction.amount}`);
      console.log(`   Description: ${verifyTransaction.description}`);
      console.log(`   Status: ${verifyTransaction.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing user transaction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if executed directly
if (require.main === module) {
  fixUserTransaction()
    .then(() => {
      console.log('✅ User transaction fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to fix user transaction:', error);
      process.exit(1);
    });
}

module.exports = { fixUserTransaction }; 