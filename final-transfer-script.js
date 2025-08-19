const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createFinalTransfers() {
  try {
    console.log('🔧 Creating final transfers...');

    // First, let's check the current state
    console.log('\n📊 Current database state:');
    
    const saleenaAccount = await prisma.account.findFirst({
      where: { accountNumber: '0506118608' },
      include: { user: true }
    });

    const account1 = await prisma.account.findFirst({
      where: { accountNumber: '0506110982' },
      include: { user: true }
    });

    const account2 = await prisma.account.findFirst({
      where: { accountNumber: '0506113754' },
      include: { user: true }
    });

    if (!saleenaAccount || !account1 || !account2) {
      console.error('❌ One or more accounts not found');
      return;
    }

    console.log('   Saleena (0506118608): $' + saleenaAccount.balance);
    console.log('   Prajuab (0506110982): $' + account1.balance);
    console.log('   Sura (0506113754): $' + account2.balance);

    const transferAmount = 100;

    // Check if Saleena has sufficient balance
    if (Number(saleenaAccount.balance) < (transferAmount * 2)) {
      console.error('❌ Insufficient balance in Saleena account');
      return;
    }

    console.log('\n💰 Creating transfers...');

    // Create transfers using raw SQL to avoid schema issues
    const timestamp = Date.now();

    // Transfer 1: Saleena to Prajuab
    await prisma.$executeRaw`
      INSERT INTO transactions (
        id, "userId", "accountId", type, amount, description, status, reference, 
        "transferMode", "sourceAccountHolder", "destinationAccountHolder", 
        "transferFee", "netAmount", "isDisputed", "createdAt", "updatedAt"
      ) VALUES (
        ${`transfer_${timestamp}_1`}, 
        ${saleenaAccount.userId}, 
        ${saleenaAccount.id}, 
        'TRANSFER', 
        ${transferAmount}, 
        ${`Transfer from Saleena Thamani to ${account1.user.firstName} ${account1.user.lastName}`}, 
        'COMPLETED', 
        ${`TRANSFER-${timestamp}-1`}, 
        'EXTERNAL_TRANSFER', 
        ${`${saleenaAccount.user.firstName} ${saleenaAccount.user.lastName}`}, 
        ${`${account1.user.firstName} ${account1.user.lastName}`}, 
        0, 
        ${transferAmount}, 
        false, 
        NOW(), 
        NOW()
      )
    `;

    console.log('   ✅ Created transfer 1: Saleena → Prajuab');

    // Transfer 2: Saleena to Sura
    await prisma.$executeRaw`
      INSERT INTO transactions (
        id, "userId", "accountId", type, amount, description, status, reference, 
        "transferMode", "sourceAccountHolder", "destinationAccountHolder", 
        "transferFee", "netAmount", "isDisputed", "createdAt", "updatedAt"
      ) VALUES (
        ${`transfer_${timestamp}_2`}, 
        ${saleenaAccount.userId}, 
        ${saleenaAccount.id}, 
        'TRANSFER', 
        ${transferAmount}, 
        ${`Transfer from Saleena Thamani to ${account2.user.firstName} ${account2.user.lastName}`}, 
        'COMPLETED', 
        ${`TRANSFER-${timestamp}-2`}, 
        'EXTERNAL_TRANSFER', 
        ${`${saleenaAccount.user.firstName} ${saleenaAccount.user.lastName}`}, 
        ${`${account2.user.firstName} ${account2.user.lastName}`}, 
        0, 
        ${transferAmount}, 
        false, 
        NOW(), 
        NOW()
      )
    `;

    console.log('   ✅ Created transfer 2: Saleena → Sura');

    // Update account balances
    console.log('\n💰 Updating account balances...');

    await prisma.$executeRaw`
      UPDATE accounts 
      SET balance = balance - ${transferAmount * 2}, "updatedAt" = NOW()
      WHERE id = ${saleenaAccount.id}
    `;

    await prisma.$executeRaw`
      UPDATE accounts 
      SET balance = balance + ${transferAmount}, "updatedAt" = NOW()
      WHERE id = ${account1.id}
    `;

    await prisma.$executeRaw`
      UPDATE accounts 
      SET balance = balance + ${transferAmount}, "updatedAt" = NOW()
      WHERE id = ${account2.id}
    `;

    console.log('   ✅ Updated all account balances');

    // Verify the changes
    console.log('\n📊 Final account balances:');
    
    const updatedSaleena = await prisma.account.findUnique({
      where: { id: saleenaAccount.id }
    });

    const updatedAccount1 = await prisma.account.findUnique({
      where: { id: account1.id }
    });

    const updatedAccount2 = await prisma.account.findUnique({
      where: { id: account2.id }
    });

    console.log('   Saleena (0506118608): $' + updatedSaleena.balance);
    console.log('   Prajuab (0506110982): $' + updatedAccount1.balance);
    console.log('   Sura (0506113754): $' + updatedAccount2.balance);

    const totalTransactions = await prisma.transaction.count();
    console.log('\n📈 Total transactions in database:', totalTransactions);

    console.log('\n✅ All transfers completed successfully!');
    console.log('🎉 Database has been updated with the new transfers!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFinalTransfers(); 