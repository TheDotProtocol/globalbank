const { PrismaClient } = require('@prisma/client');

async function testPooledConnection() {
  // Try the pooled connection string
  const pooledConnection = "postgresql://postgres.rbmpeyjaoitdvafxntao:Globalbank2024@aws-0-us-west-1.pooler.supabase.com:6543/postgres";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: pooledConnection,
      },
    },
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🔍 Testing pooled connection...');
    console.log('Connection string:', pooledConnection.substring(0, 60) + '...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Pooled connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful! Result:', result);
    
    console.log('\n🎉 Use this pooled connection string in Vercel:');
    console.log(pooledConnection);
    
  } catch (error) {
    console.error('❌ Pooled connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testPooledConnection(); 