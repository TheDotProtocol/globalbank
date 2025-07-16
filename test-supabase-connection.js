const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:GlobalBank2024@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres'
    }
  }
});

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Test account count
    const accountCount = await prisma.account.count();
    console.log(`🏦 Total accounts in database: ${accountCount}`);
    
    // Test transaction count
    const transactionCount = await prisma.transaction.count();
    console.log(`💳 Total transactions in database: ${transactionCount}`);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 