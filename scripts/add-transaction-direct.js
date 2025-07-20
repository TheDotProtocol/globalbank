const { PrismaClient } = require('@prisma/client');

async function addBabyTauTransaction() {
  // Create a fresh Prisma client instance
  const prisma = new PrismaClient();

  try {
    console.log('💰 Adding transaction for Baby Tau account...');
    
    // Find Baby Tau user by email
    const user = await prisma.user.findUnique({
      where: { email: 'babyaccount@globaldotbank.org' }
    });
    
    if (!user) {
      console.log('❌ Baby Tau user not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    
    // Find Baby Tau's account
    const account = await prisma.account.findFirst({
      where: { userId: user.id }
    });
    
    if (!account) {
      console.log('❌ Baby Tau account not found');
      return;
    }
    
    console.log(`✅ Found account: ${account.accountNumber}`);
    console.log(`   Current balance: $${account.balance}`);
    
    // Create yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(14, 30, 0, 0); // Set to 2:30 PM yesterday
    
    // Use database transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'CREDIT',
          amount: 250000,
          description: 'AR Holdings Group Corporation - Daddy\'s gift',
          status: 'COMPLETED',
          reference: `AR-HOLDINGS-GIFT-${Date.now()}`,
          createdAt: yesterday,
          updatedAt: yesterday,
          transferMode: 'EXTERNAL_TRANSFER',
          sourceAccountHolder: 'AR Holdings Group Corporation',
          destinationAccountHolder: `${user.firstName} ${user.lastName}`,
          transferFee: 0,
          netAmount: 250000
        }
      });
      
      // Update account balance
      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            increment: 250000
          }
        }
      });
      
      return transaction;
    });
    
    // Verify the update
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    console.log(`✅ Created transaction: ${result.id}`);
    console.log(`✅ Updated balance: $${updatedAccount?.balance}`);
    console.log('🎉 Transaction added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBabyTauTransaction(); 