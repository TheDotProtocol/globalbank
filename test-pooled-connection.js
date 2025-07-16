const { PrismaClient } = require('@prisma/client');

async function testPooledConnection() {
  const pooledConnection = "postgresql://postgres.rbmpeyjaoitdvafxntao:GlobalBank2024@aws-0-us-west-1.pooler.supabase.com:6543/postgres";
  
  console.log('🔍 Testing pooled connection...');
  console.log('Connection:', pooledConnection.substring(0, 60) + '...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: pooledConnection,
      },
    },
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Pooled connection successful!');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
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