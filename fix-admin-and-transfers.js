const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminAndCreateTransfers() {
  try {
    console.log('🔧 Fixing admin issues and creating transfers...');

    // 1. First, let's check the current database state
    console.log('\n📊 Checking current database state...');
    
    const [totalUsers, totalAccounts, totalTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.transaction.count()
    ]);

    console.log('   Total Users:', totalUsers);
    console.log('   Total Accounts:', totalAccounts);
    console.log('   Total Transactions:', totalTransactions);

    // 2. Find Saleena Thamani's account
    console.log('\n🔍 Finding Saleena Thamani account...');
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

    // 3. Find destination accounts
    console.log('\n🔍 Finding destination accounts...');
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
      if (!account1) console.error('   Account 0506110982 not found');
      if (!account2) console.error('   Account 0506113754 not found');
      return;
    }

    console.log('✅ Found destination accounts:');
    console.log('   Account 1:', account1.accountNumber, '-', account1.user.firstName, account1.user.lastName, '- Balance:', account1.balance);
    console.log('   Account 2:', account2.accountNumber, '-', account2.user.firstName, account2.user.lastName, '- Balance:', account2.balance);

    // 4. Create transfers
    console.log('\n💰 Creating transfers...');
    const transferAmount = 100;
    const transferFee = 0;
    const netAmount = transferAmount - transferFee;

    // Check if Saleena has sufficient balance
    if (Number(saleenaAccount.balance) < (transferAmount * 2)) {
      console.error('❌ Insufficient balance in Saleena account');
      console.error('   Required:', transferAmount * 2);
      console.error('   Available:', saleenaAccount.balance);
      return;
    }

    // Create first transfer
    console.log('   Creating transfer 1: $' + transferAmount + ' to ' + account1.user.firstName + ' ' + account1.user.lastName);
    const transfer1 = await prisma.transaction.create({
      data: {
        userId: saleenaAccount.userId,
        accountId: saleenaAccount.id,
        type: 'TRANSFER',
        amount: transferAmount,
        description: `Transfer from Saleena Thamani to ${account1.user.firstName} ${account1.user.lastName}`,
        status: 'COMPLETED',
        reference: `TRANSFER-${Date.now()}-1`,
        transferMode: 'EXTERNAL_TRANSFER',
        sourceAccountHolder: `${saleenaAccount.user.firstName} ${saleenaAccount.user.lastName}`,
        destinationAccountHolder: `${account1.user.firstName} ${account1.user.lastName}`,
        transferFee: transferFee,
        netAmount: netAmount,
        isDisputed: false
      }
    });

    console.log('   ✅ Created transfer 1:', transfer1.id);

    // Create second transfer
    console.log('   Creating transfer 2: $' + transferAmount + ' to ' + account2.user.firstName + ' ' + account2.user.lastName);
    const transfer2 = await prisma.transaction.create({
      data: {
        userId: saleenaAccount.userId,
        accountId: saleenaAccount.id,
        type: 'TRANSFER',
        amount: transferAmount,
        description: `Transfer from Saleena Thamani to ${account2.user.firstName} ${account2.user.lastName}`,
        status: 'COMPLETED',
        reference: `TRANSFER-${Date.now()}-2`,
        transferMode: 'EXTERNAL_TRANSFER',
        sourceAccountHolder: `${saleenaAccount.user.firstName} ${saleenaAccount.user.lastName}`,
        destinationAccountHolder: `${account2.user.firstName} ${account2.user.lastName}`,
        transferFee: transferFee,
        netAmount: netAmount,
        isDisputed: false
      }
    });

    console.log('   ✅ Created transfer 2:', transfer2.id);

    // 5. Update account balances
    console.log('\n💰 Updating account balances...');

    // Update Saleena's account balance (deduct both transfers)
    const updatedSaleenaAccount = await prisma.account.update({
      where: { id: saleenaAccount.id },
      data: {
        balance: {
          decrement: transferAmount * 2
        }
      }
    });

    console.log('   ✅ Updated Saleena balance:', updatedSaleenaAccount.balance);

    // Update destination account 1 balance
    const updatedAccount1 = await prisma.account.update({
      where: { id: account1.id },
      data: {
        balance: {
          increment: netAmount
        }
      }
    });

    console.log('   ✅ Updated Account 1 balance:', updatedAccount1.balance);

    // Update destination account 2 balance
    const updatedAccount2 = await prisma.account.update({
      where: { id: account2.id },
      data: {
        balance: {
          increment: netAmount
        }
      }
    });

    console.log('   ✅ Updated Account 2 balance:', updatedAccount2.balance);

    // 6. Verify the changes
    console.log('\n📊 Final summary:');
    console.log('   Saleena account (0506118608): $' + updatedSaleenaAccount.balance);
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

fixAdminAndCreateTransfers(); 