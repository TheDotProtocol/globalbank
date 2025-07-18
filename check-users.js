const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking database users...\n');
    
    // Get all users with their accounts and transactions
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        kycDocuments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Found ${users.length} users in database:\n`);

    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   KYC Status: ${user.kycStatus}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      
      if (user.accounts.length > 0) {
        console.log(`   📁 Accounts (${user.accounts.length}):`);
        user.accounts.forEach(account => {
          console.log(`      - ${account.accountType} Account: ${account.accountNumber}`);
          console.log(`        Balance: $${account.balance}`);
          console.log(`        Currency: ${account.currency}`);
          console.log(`        Status: ${account.isActive ? 'Active' : 'Inactive'}`);
          
          if (account.transactions.length > 0) {
            console.log(`        Recent Transactions (${account.transactions.length}):`);
            account.transactions.forEach(tx => {
              console.log(`          • ${tx.type}: $${tx.amount} - ${tx.description} (${tx.status})`);
            });
          }
        });
      } else {
        console.log(`   📁 No accounts found`);
      }
      
      if (user.kycDocuments.length > 0) {
        console.log(`   📄 KYC Documents (${user.kycDocuments.length}):`);
        user.kycDocuments.forEach(doc => {
          console.log(`      - ${doc.documentType}: ${doc.status}`);
        });
      } else {
        console.log(`   📄 No KYC documents found`);
      }
      
      console.log('');
    });

    // Get total statistics
    const totalBalance = users.reduce((sum, user) => {
      return sum + user.accounts.reduce((accSum, acc) => accSum + Number(acc.balance), 0);
    }, 0);

    console.log(`💰 Total System Balance: $${totalBalance.toFixed(2)}`);
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`✅ Verified KYC: ${users.filter(u => u.kycStatus === 'VERIFIED').length}`);
    console.log(`⏳ Pending KYC: ${users.filter(u => u.kycStatus === 'PENDING').length}`);

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 