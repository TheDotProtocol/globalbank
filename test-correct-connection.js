const { PrismaClient } = require('@prisma/client');

async function testCorrectConnection() {
  // Your provided connection string
  const connectionString = "postgresql://postgres:GlobalBank2024@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🔍 Testing your connection string...');
    console.log('Connection string:', connectionString.substring(0, 50) + '...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful! Result:', result);
    
    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('✅ Tables found:', tables.map(t => t.table_name));
    
    console.log('\n🎉 Database is working! Now let\'s fix the RLS issues...');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testCorrectConnection(); 