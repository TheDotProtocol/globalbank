const { PrismaClient } = require('@prisma/client');

async function addBabyTauTransaction() {
  // Create a fresh Prisma client instance
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('💰 Adding transaction for Baby Tau account...');
    
    // Try different possible email addresses for Baby Tau
    const possibleEmails = [
      'babyaccount@globaldotbank.org',
      'babytau@gmail.com',
      'baby.tau@gmail.com',
      'babytau@example.com',
      'baby.tau@example.com'
    ];
    
    let user = null;
    for (const email of possibleEmails) {
      try {
        user = await prisma.user.findUnique({
          where: { email: email }
        });
        if (user) {
          console.log(`✅ Found user with email: ${email}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error checking email ${email}:`, error.message);
        continue;
      }
    }
    
    if (!user) {
      console.log('❌ Baby Tau user not found with any of the attempted emails');
      console.log('Attempted emails:', possibleEmails);
      
      // List all users to see what's available
      try {
        const allUsers = await prisma.user.findMany({
          select: { email: true, firstName: true, lastName: true }
        });
        console.log('Available users:');
        allUsers.forEach(u => console.log(`  - ${u.email} (${u.firstName} ${u.lastName})`));
      } catch (error) {
        console.log('Could not list users:', error.message);
      }
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
    
    // Create the transaction
    const transaction = await prisma.transaction.create({
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
    
    console.log(`✅ Created transaction: ${transaction.id}`);
    console.log(`   Type: ${transaction.type}`);
    console.log(`   Amount: $${transaction.amount}`);
    console.log(`   Description: ${transaction.description}`);
    console.log(`   Date: ${transaction.createdAt}`);
    
    // Update account balance
    await prisma.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: 250000
        }
      }
    });
    
    // Verify the update
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    console.log(`✅ Updated balance: $${updatedAccount.balance}`);
    console.log('🎉 Transaction added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBabyTauTransaction(); 