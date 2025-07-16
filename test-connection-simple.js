const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const connectionString = "postgresql://postgres:GlobalBank2024@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres";
  
  console.log('🔍 Testing connection string...');
  console.log('Connection:', connectionString.substring(0, 50) + '...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 