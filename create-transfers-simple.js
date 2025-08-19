const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTransfersSimple() {
  try {
    console.log('🔧 Creating transfers (simple version)...');

    // Find Saleena Thamani's account (0506118608)
    const saleenaAccount = await prisma.account.findFirst({
      where: { accountNumber: '0506118608' },
      include: { user: true }
    });

    if (!saleenaAccount) {
      console.error('❌ Saleena Thamani account not found');
      return;
    }

    console.log('✅ Found Saleena account:', saleenaAccount.accountNumber);
    console.log('   Name:', saleenaAccount.user.firstName, saleenaAccount.user.lastName);
    console.log('   Current balance:', saleenaAccount.balance);

    // Find destination accounts
    const account1 = await prisma.account.findFirst({
      where: { accountNumber: '0506110982' },
      include: { user: true }
    });

    const account2 = await prisma.account.findFirst({
      where: { accountNumber: '0506113754' },
      include: { user: true }
    });

    if (!account1 || !account2) {
      console.error('❌ One or both destination accounts not found');
      return;
    }

    console.log('✅ Found destination accounts:');
    console.log('   Account 1:', account1.accountNumber, '-', account1.user.firstName, account1.user.lastName);
    console.log('   Account 2:', account2.accountNumber, '-', account2.user.firstName, account2.user.lastName);

    const transferAmount = 100;

    // Check if Saleena has sufficient balance
    if (Number(saleenaAccount.balance) < (transferAmount * 2)) {
      console.error('❌ Insufficient balance in Saleena account');
      return;
    }

    console.log('💰 Creating transfers...');

    // Create first transfer using raw SQL to avoid schema issues
    const transfer1Result = await prisma.$executeRaw`
      INSERT INTO transactions (
        id, "userId", "accountId", type, amount, description, status, reference, 
        "transferMode", "sourceAccountHolder", "destinationAccountHolder", 
        "transferFee", "netAmount", "isDisputed", "createdAt", "updatedAt"
      ) VALUES (
        ${`transfer_${Date.now()}_1`}, 
        ${saleenaAccount.userId}, 
        ${saleenaAccount.id}, 
        'TRANSFER', 
        ${transferAmount}, 
        ${`Transfer from Saleena Thamani to ${account1.user.firstName} ${account1.user.lastName}`}, 
        'COMPLETED', 
        ${`TRANSFER-${Date.now()}-1`}, 
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

    console.log('✅ Created transfer 1');

    // Create second transfer using raw SQL
    const transfer2Result = await prisma.$executeRaw`
      INSERT INTO transactions (
        id, "userId", "accountId", type, amount, description, status, reference, 
        "transferMode", "sourceAccountHolder", "destinationAccountHolder", 
        "transferFee", "netAmount", "isDisputed", "createdAt", "updatedAt"
      ) VALUES (
        ${`transfer_${Date.now()}_2`}, 
        ${saleenaAccount.userId}, 
        ${saleenaAccount.id}, 
        'TRANSFER', 
        ${transferAmount}, 
        ${`Transfer from Saleena Thamani to ${account2.user.firstName} ${account2.user.lastName}`}, 
        'COMPLETED', 
        ${`TRANSFER-${Date.now()}-2`}, 
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

    console.log('✅ Created transfer 2');

    // Update account balances using raw SQL
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

    console.log('✅ Updated account balances');

    // Verify the changes
    const updatedSaleena = await prisma.account.findUnique({
      where: { id: saleenaAccount.id }
    });

    const updatedAccount1 = await prisma.account.findUnique({
      where: { id: account1.id }
    });

    const updatedAccount2 = await prisma.account.findUnique({
      where: { id: account2.id }
    });

    console.log('\n📊 Final summary:');
    console.log('   Saleena account (0506118608): $' + updatedSaleena.balance);
    console.log('   Account 1 (0506110982): $' + updatedAccount1.balance);
    console.log('   Account 2 (0506113754): $' + updatedAccount2.balance);

    const finalTransactionCount = await prisma.transaction.count();
    console.log('   Total transactions after transfers:', finalTransactionCount);

    console.log('\n✅ All operations completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTransfersSimple(); 