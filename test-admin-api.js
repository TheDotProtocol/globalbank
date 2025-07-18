const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminAPI() {
  try {
    console.log('🔍 Testing admin API functionality...\n');
    
    // Test 1: Check if we can connect to database
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Total users: ${userCount}\n`);
    
    // Test 2: Get all users with their data
    console.log('2. Fetching all users with comprehensive data...');
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            cards: true
          }
        },
        kycDocuments: true,
        fixedDeposits: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   KYC Status: ${user.kycStatus}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Accounts: ${user.accounts.length}`);
      
      if (user.accounts.length > 0) {
        user.accounts.forEach(account => {
          console.log(`     - ${account.accountType}: ${account.accountNumber} ($${account.balance})`);
          console.log(`       Cards: ${account.cards.length}, Transactions: ${account.transactions.length}`);
        });
      }
      console.log('');
    });
    
    // Test 3: Calculate totals
    const totalBalance = users.reduce((sum, user) => {
      return sum + user.accounts.reduce((accSum, acc) => accSum + Number(acc.balance), 0);
    }, 0);
    
    const totalCards = users.reduce((sum, user) => {
      return sum + user.accounts.reduce((accSum, acc) => accSum + acc.cards.length, 0);
    }, 0);
    
    const totalTransactions = users.reduce((sum, user) => {
      return sum + user.accounts.reduce((accSum, acc) => accSum + acc.transactions.length, 0);
    }, 0);
    
    console.log('📊 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Total Balance: $${totalBalance.toFixed(2)}`);
    console.log(`   Total Cards: ${totalCards}`);
    console.log(`   Total Transactions: ${totalTransactions}`);
    console.log(`   Verified KYC: ${users.filter(u => u.kycStatus === 'VERIFIED').length}`);
    console.log(`   Pending KYC: ${users.filter(u => u.kycStatus === 'PENDING').length}`);
    
  } catch (error) {
    console.error('❌ Error testing admin API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPI(); 