const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminSimple() {
  try {
    console.log('🔍 Testing simple admin data fetch...\n');
    
    // Test 1: Get basic user data
    console.log('1. Fetching basic user data...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        kycStatus: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Found ${users.length} users:\n`);
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   KYC: ${user.kycStatus}, Email Verified: ${user.emailVerified}`);
    });
    
    // Test 2: Get accounts separately
    console.log('\n2. Fetching accounts...');
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        userId: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        currency: true
      }
    });
    
    console.log(`✅ Found ${accounts.length} accounts:\n`);
    accounts.forEach(account => {
      console.log(`💰 Account: ${account.accountNumber} (${account.accountType}) - $${account.balance} ${account.currency}`);
    });
    
    // Test 3: Get cards separately
    console.log('\n3. Fetching cards...');
    const cards = await prisma.card.findMany({
      select: {
        id: true,
        userId: true,
        cardNumber: true,
        cardType: true,
        status: true
      }
    });
    
    console.log(`✅ Found ${cards.length} cards:\n`);
    cards.forEach(card => {
      console.log(`💳 Card: ${card.cardNumber} (${card.cardType}) - ${card.status}`);
    });
    
    // Test 4: Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    
    console.log('\n📊 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Total Accounts: ${accounts.length}`);
    console.log(`   Total Cards: ${cards.length}`);
    console.log(`   Total Balance: $${totalBalance.toFixed(2)}`);
    console.log(`   Verified KYC: ${users.filter(u => u.kycStatus === 'VERIFIED').length}`);
    console.log(`   Pending KYC: ${users.filter(u => u.kycStatus === 'PENDING').length}`);
    
  } catch (error) {
    console.error('❌ Error testing admin simple:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminSimple(); 